import { useState, useEffect, useRef } from 'react';
import Volume from './components/Volume';
import Tracklist from './components/Tracklist';
import { GetData } from './api';
import TrackTimeControler from './components/TimeControler';
import styled from 'styled-components'
import { colorsUI, sizesUI } from './utils/UI';
import Button from './components/Button';
import IconPrev from './components/IconPrev';
import IconNext from './components/IconNext';
import IconPlay from './components/IconPlay';
import IconPause from './components/IconPause';
import AudioVisualizer from './components/AudioVisualizer';


// Déclaration du contexte audio à l'extérieur du composant pour qu'il soit partagé globalement
const audioContext = new (window.AudioContext || window.webkitAudioContext)();


function App() {
  const [playerVisible, setPlayerVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef(null);
  // Gestion de la source audio
  const [audioSrc, setAudioSrc] = useState(null);
  // Get data for the tracklist
  const tracklist = GetData("data/tracklist.json");

  // Gestion du volume
  const [volume, setVolume] = useState(0.8);
  // Initialiser gainNodeRef une seule fois et ne pas le recréer avec chaque source
  const gainNodeRef = useRef(audioContext.createGain());
  const analyserNodeRefLeft = useRef(audioContext.createAnalyser());
  const analyserNodeRefRight = useRef(audioContext.createAnalyser());

  const splitterRef = useRef(audioContext.createChannelSplitter(2)); // Pour un signal stéréo

  // Connecter gainNode au contexte audio dès le début et ne pas le déconnecter
  useEffect(() => {
    analyserNodeRefLeft.current.fftSize = 4096; // 512 ?
    analyserNodeRefRight.current.fftSize = 4096;
  
    // Connecter le gainNode à la destination audio pour jouer le son
    gainNodeRef.current.connect(audioContext.destination);
    
    // Connecter le gainNode au splitter pour analyser les canaux séparément
    gainNodeRef.current.connect(splitterRef.current); 
    
    // Connecter le splitter aux AnalyserNodes pour les canaux gauche et droit
    //splitterRef.current.connect(analyserNodeRef.current, 0); // Canal gauche
    //splitterRef.current.connect(analyserNodeRefRight.current, 1); // Canal droit
  
    // Logique de nettoyage
    return () => {
      gainNodeRef.current.disconnect();
      splitterRef.current.disconnect();
    };
  }, []);

  // Si le volume change, le gain du lecteur s'ajuste
  useEffect(() => {
    gainNodeRef.current.gain.value = volume;
  }, [volume]);

  // Gestion de la lecture de la piste audio, lors d'un changement de source audio
useEffect(() => {
  if (audioSrc) {
    // S'assurer que l'audio est arrêté et remis à zéro
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Charger et jouer la nouvelle source
    const audio = new Audio(audioSrc);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const track = audioContext.createMediaElementSource(audioRef.current);
    track.connect(gainNodeRef.current); // Connecter la source au gainNode

    // Connexion correcte du splitter et des analyseurs
    track.connect(splitterRef.current); // Connectez la source au splitter
    splitterRef.current.connect(analyserNodeRefLeft.current, 0); // Connecter le canal gauche à analyserNodeRefLeft
    splitterRef.current.connect(analyserNodeRefRight.current, 1); // Connecter le canal droit à analyserNodeRefRight

    gainNodeRef.current.connect(audioContext.destination); // Connecter le gainNode à la destination

    gainNodeRef.current.gain.value = volume;

    audioRef.current.addEventListener('ended', handleAudioEnded);

    // Cette vérification permet de relancer la lecture si isPlaying est vrai,
    // ou de la démarrer si nous changeons la source alors que la lecture n'était pas active.
    if (isPlaying || !isPaused) {
      audio.play().catch(e => console.error(e));
      setIsPlaying(true);
      setIsPaused(false);
    }
  }
}, [audioSrc]); // Assurez-vous d'ajouter toutes les dépendances nécessaires ici



  // Définir la fonction de rappel pour l'événement 'ended'
  const handleAudioEnded = () => {
    setIsPaused(false);
    setIsPlaying(false);
  }

  // Gestion des données de fréquences 
  const [dataFrequencyLeft, setDataFrequencyLeft] = useState(new Uint8Array(0));
  const [dataFrequencyRight, setDataFrequencyRight] = useState(new Uint8Array(0));

  useEffect(() => {
    let intervalId;
    
    // Modifier la condition pour arrêter également lorsque isPaused est vrai
    if (isPlaying && !isPaused) {
      intervalId = setInterval(updateAnalyserData, 60); // génère une analyse toutes les 60ms
    } else {
      // Arrêter l'intervalle si l'audio est en pause ou arrêté
      clearInterval(intervalId);
    }
    
    // Nettoyage de l'effet qui arrête l'intervalle quand le composant se démonte ou quand isPlaying/isPaused change
    return () => clearInterval(intervalId);
  }, [isPlaying, isPaused]); // Ajouter isPaused aux dépendances de useEffect
  
  const updateAnalyserData = () => {
    if (!isPlaying || isPaused) return; // Arrête la mise à jour si l'audio n'est pas en cours de lecture ou est en pause
    // Signal de gauche
    const frequencyDataLeft = new Uint8Array(analyserNodeRefLeft.current.frequencyBinCount);
    analyserNodeRefLeft.current.getByteFrequencyData(frequencyDataLeft);
    // Signal de droite
    const frequencyDataRight = new Uint8Array(analyserNodeRefRight.current.frequencyBinCount);
    analyserNodeRefRight.current.getByteFrequencyData(frequencyDataRight);
    
    setDataFrequencyLeft(frequencyDataLeft); // Mise à jour de l'état avec les nouvelles données
    setDataFrequencyRight(frequencyDataRight); // Mise à jour de l'état avec les nouvelles données
  };

  // Permet de lancer la lecture de la piste audio
  const play = () => {
    // Réactiver le contexte audio si nécessaire (par exemple, après une suspension due à des politiques du navigateur)
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        setIsPlaying(true);
        setIsPaused(false);
        // Tenter de jouer l'audio si la référence existe et que la source est prête
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.error(e));
        }
      });
    } else if (audioRef.current) {
      // Jouer l'audio si la référence existe
      audioRef.current.play().catch(e => console.error(e));
      setIsPlaying(true);
      setIsPaused(false);
    }
  }
  
  // Permet de mettre en pause la lecture de la piste audio
  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(true);
      setIsPaused(true);
    }
  }

  const launchTrack = (source) => {
    if (isPlaying) {
      // Arrêter la lecture actuelle avant de changer de source
      stop(); // Assurez-vous que cette fonction réinitialise isPlaying et isPaused comme nécessaire
    }
    // Mettre à jour la source audio, ce qui déclenchera le useEffect pour charger et jouer la nouvelle source
    setAudioSrc(source);
    // La logique dans useEffect pour audioSrc devrait s'occuper de jouer la nouvelle source si isPlaying est vrai
  };


  // Gestion de la progression
  const [duration, setDuration] = useState(0); // État pour stocker la durée de la piste audio
  const [currentTime, setCurrentTime] = useState(0); // État pour la position actuelle de lecture dans la piste audio
  // console.log(duration) // durée de la piste audio en cours

  // Permet de déterminer la durée de la piste audio, 
  // une fois que les métadonnées de la piste sont chargées
  useEffect(() => {
    if (audioRef.current) {
      const handleLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
      };
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      // Nettoyage
      return () => {
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    } 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRef.current]);

  // Permet de mettre à jour la position de lecture dans la piste audio
  useEffect(() => {
    let intervalId;
    if (isPlaying) {
      intervalId = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 1000); // Mettre à jour chaque seconde
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [isPlaying]);
  
  // Permet de déplacer la lecture dans la piste audio
  const controlProgression = (event) => {
    const newTime = event.target.value;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }

  return (
    <>
    {!playerVisible && 
      <Show onClick={() => setPlayerVisible(true)}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2.5C2 2.22386 2.22386 2 2.5 2H5.5C5.77614 2 6 2.22386 6 2.5C6 2.77614 5.77614 3 5.5 3H3V5.5C3 5.77614 2.77614 6 2.5 6C2.22386 6 2 5.77614 2 5.5V2.5ZM9 2.5C9 2.22386 9.22386 2 9.5 2H12.5C12.7761 2 13 2.22386 13 2.5V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3H9.5C9.22386 3 9 2.77614 9 2.5ZM2.5 9C2.77614 9 3 9.22386 3 9.5V12H5.5C5.77614 12 6 12.2239 6 12.5C6 12.7761 5.77614 13 5.5 13H2.5C2.22386 13 2 12.7761 2 12.5V9.5C2 9.22386 2.22386 9 2.5 9ZM12.5 9C12.7761 9 13 9.22386 13 9.5V12.5C13 12.7761 12.7761 13 12.5 13H9.5C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12H12V9.5C12 9.22386 12.2239 9 12.5 9Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>    
      </Show>
    }
    {playerVisible && 
      <Player>
        <Hide onClick={() => setPlayerVisible(false)}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 2C5.77614 2 6 2.22386 6 2.5V5.5C6 5.77614 5.77614 6 5.5 6H2.5C2.22386 6 2 5.77614 2 5.5C2 5.22386 2.22386 5 2.5 5H5V2.5C5 2.22386 5.22386 2 5.5 2ZM9.5 2C9.77614 2 10 2.22386 10 2.5V5H12.5C12.7761 5 13 5.22386 13 5.5C13 5.77614 12.7761 6 12.5 6H9.5C9.22386 6 9 5.77614 9 5.5V2.5C9 2.22386 9.22386 2 9.5 2ZM2 9.5C2 9.22386 2.22386 9 2.5 9H5.5C5.77614 9 6 9.22386 6 9.5V12.5C6 12.7761 5.77614 13 5.5 13C5.22386 13 5 12.7761 5 12.5V10H2.5C2.22386 10 2 9.77614 2 9.5ZM9 9.5C9 9.22386 9.22386 9 9.5 9H12.5C12.7761 9 13 9.22386 13 9.5C13 9.77614 12.7761 10 12.5 10H10V12.5C10 12.7761 9.77614 13 9.5 13C9.22386 13 9 12.7761 9 12.5V9.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
        </Hide>
        <ButtonsWrapper>
          <div> 
            <Button inactive={!isPlaying && !isPaused} icon={<IconPrev/>}/>
            { (!isPlaying && !isPaused || isPlaying && isPaused) && 
              <Button action={play} icon={<IconPlay/>} centered={true}/>
            }
            { isPlaying && !isPaused && 
              <Button action={pause} icon={<IconPause/>} centered={true}/>
            }
            <Button inactive={!isPlaying && !isPaused} icon={<IconNext/>}/>
          </div>
          <Volume volume={volume} setVolume={setVolume} />
        </ButtonsWrapper>

        <TrackTimeControler currentTime={currentTime} duration={duration} control={controlProgression} />
        <Tracklist data={tracklist} audioSrc={audioSrc} launchTrack={launchTrack}/>
      </Player>
      }
      <AudioVisualizer dataFrequencyLeft={dataFrequencyLeft} dataFrequencyRight={dataFrequencyRight}/>
      
    </>
  );
}

export default App;

const Hide = styled.div`
  position:absolute;
  height:1.6rem;
  width:1.6rem;
  left:0.5rem;
  top:0.5rem;
  background-color:${colorsUI.background};
  border-radius:${sizesUI.radius};
  border:1px solid ${colorsUI.border};
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  & svg{
    color:${colorsUI.textInactive};
  }
`
const Show = styled.div`
  position:absolute;
  height:1.6rem;
  width:1.6rem;
  left:0.5rem;
  top:0.5rem;
  background-color:${colorsUI.background};
  border-radius:${sizesUI.radius};
  border:1px solid ${colorsUI.border};
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  & svg{
    color:${colorsUI.textInactive};
  }
`
const Player = styled.div`
  position:absolute;
  background:rgba(100,100,100,0.18);
  border-radius:${sizesUI.radiusBig};
  border:1px solid ${colorsUI.border};
  width:20rem;
  padding:0.5rem;
  top:1rem;
  left:1rem;
  z-index:1;
`
const ButtonsWrapper = styled.div`
  padding:0.8rem 0.6rem 0rem 0.6rem;
  display:flex;
  justify-content:center;
  & div{
    border-radius:${sizesUI.radius};
    overflow:hidden;
  }
`