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
  // Connecter gainNode au contexte audio dès le début et ne pas le déconnecter
  useEffect(() => {
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

  // // Permet d'arrêter la lecture de la piste audio, et réinitialiser
  // const stop = () => {
  //   if (audioRef.current) {
  //     audioRef.current.pause();
  //     audioRef.current.currentTime = 0;
  //     setIsPlaying(false);
  //     setIsPaused(false);
  //     setCurrentTime(0);
  //   }
  // }

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
  );
}

export default App;

const Player = styled.div`
  background:${colorsUI.background};
  border-radius:${sizesUI.radiusBig};
  width:20rem;
  padding:0.5rem;
  margin-top:3rem;
  margin-left:3rem;
`
const ButtonsWrapper = styled.div`
  padding-bottom:0.8rem;
  padding-top:0.8rem;
  display:flex;
  justify-content:center;
`