import { useState, useEffect, useRef } from 'react';
import Volume from './components/Volume';
import Tracklist from './components/Tracklist';
import { GetData } from './api';
import TrackTimeControler from './components/TimeControler';
import styled from 'styled-components'
import { colorsUI, sizesUI } from './utils/UI';
import Button from './components/Button';
import IconPrev from './components/IconPrev';
import IconPlay from './components/IconPlay';
import IconPause from './components/IconPause';
import IconNext from './components/IconNext';
import AudioVisualizer2 from './components/AudioVisualizer2';


// Déclaration du contexte audio à l'extérieur du composant pour qu'il soit partagé globalement
const audioContext = new (window.AudioContext || window.webkitAudioContext)();


function App() {
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
  const analyserNodeRef = useRef(audioContext.createAnalyser());

  // Connecter gainNode au contexte audio dès le début et ne pas le déconnecter
  useEffect(() => {
    // gainNodeRef.current.connect(analyserNodeRef.current);
    // gainNodeRef.current.connect(audioContext.destination);
    // analyserNodeRef.current.fftSize = 2048;
    // analyserDataRef.current = new Float32Array(analyserNodeRef.current.frequencyBinCount);

    // const getAnalyserData = () => {
    //   // Utiliser getByteFrequencyData ou getFloatFrequencyData selon le type de données souhaité
    //   analyserNodeRef.current.getFloatFrequencyData(analyserDataRef.current);
    //   // Maintenant, analyserDataRef.current contient les données d'analyse actualisées
    //   // Vous pouvez utiliser ces données pour dessiner votre visualisation
    // };

    // console.log(getAnalyserData())
    analyserNodeRef.current.fftSize = 32; // 2048 Exemple de taille, ajustez selon vos besoins
    gainNodeRef.current.connect(analyserNodeRef.current);
    gainNodeRef.current.connect(audioContext.destination);
    
    // Logique de nettoyage : 
    // La fonction de retour dans useEffect est une instruction de nettoyage 
    // qui s'exécute lorsque le composant est sur le point de se démonter. 
    // gainNodeRef.current.disconnect(); déconnecte le gainNode de toute destination ou source à laquelle il était connecté. 
    // Cela est utile pour éviter les fuites de mémoire et s'assurer que les ressources audio sont correctement libérées lorsque le composant n'est plus utilisé.
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      gainNodeRef.current.disconnect();
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
  
      const track = audioContext.createMediaElementSource(audio);
      track.connect(gainNodeRef.current);
  
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSrc]);


  // Définir la fonction de rappel pour l'événement 'ended'
  const handleAudioEnded = () => {
    setIsPaused(false);
    setIsPlaying(false);
  }


  // Gestion des données de fréquences 
  const [dataFrequency, setDataFrequency] = useState(new Uint8Array(0));

  useEffect(() => {
    let intervalId;
    
    // Modifier la condition pour arrêter également lorsque isPaused est vrai
    if (isPlaying && !isPaused) {
      intervalId = setInterval(updateAnalyserData, 50); // génère une analyse toutes les 100ms
    } else {
      // Arrêter l'intervalle si l'audio est en pause ou arrêté
      clearInterval(intervalId);
    }
    
    // Nettoyage de l'effet qui arrête l'intervalle quand le composant se démonte ou quand isPlaying/isPaused change
    return () => clearInterval(intervalId);
  }, [isPlaying, isPaused]); // Ajouter isPaused aux dépendances de useEffect
  
  const updateAnalyserData = () => {
    if (!isPlaying || isPaused) return; // Arrête la mise à jour si l'audio n'est pas en cours de lecture ou est en pause
    const frequencyData = new Uint8Array(analyserNodeRef.current.frequencyBinCount);
    analyserNodeRef.current.getByteFrequencyData(frequencyData);
    // const frequencyData = new Float32Array(analyserNodeRef.current.frequencyBinCount);
    // analyserNodeRef.current.getFloatFrequencyData(frequencyData);
    setDataFrequency(frequencyData); // Mise à jour de l'état avec les nouvelles données
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
      <Player>
        <ButtonsWrapper>
          <Button inactive={!isPlaying && !isPaused} icon={<IconPrev/>}/>
          { (!isPlaying && !isPaused || isPlaying && isPaused) && 
            <Button inactive={audioSrc == null} action={play} icon={<IconPlay/>}/>
          }
          { isPlaying && !isPaused && 
            <Button action={pause} icon={<IconPause/>}/>
          }
          <Button inactive={!isPlaying && !isPaused} icon={<IconNext/>}/>
        </ButtonsWrapper>

        <TrackTimeControler currentTime={currentTime} duration={duration} control={controlProgression} />
        <Volume volume={volume} setVolume={setVolume} />
        <Tracklist data={tracklist} audioSrc={audioSrc} launchTrack={launchTrack}/>
      </Player>
      <AudioVisualizer2 dataFrequency={dataFrequency}/>
    </>
  );
}

export default App;

const Player = styled.div`
  position:absolute;
  background:${colorsUI.background};
  border-radius:${sizesUI.radiusBig};
  width:20rem;
  padding:0.5rem;
  top:1rem;
  left:1rem;
`
const ButtonsWrapper = styled.div`
  padding-bottom:0.8rem;
  padding-top:0.8rem;
  display:flex;
  justify-content:center;
`