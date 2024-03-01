import { useState, useEffect, useRef } from 'react';
import Volume from './components/Volume';
import Tracklist from './components/Tracklist';
import './App.css';

// Déclaration du contexte audio à l'extérieur du composant pour qu'il soit partagé globalement
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [audioSrc, setAudioSrc] = useState(null);

  const audioRef = useRef(null);
  // Initialiser gainNodeRef une seule fois et ne pas le recréer avec chaque source
  const gainNodeRef = useRef(audioContext.createGain());

  useEffect(() => {
    // Connecter gainNode au contexte audio dès le début et ne pas le déconnecter
    gainNodeRef.current.connect(audioContext.destination);
    // Logique de nettoyage : 
    // La fonction de retour dans useEffect est une instruction de nettoyage 
    // qui s'exécute lorsque le composant est sur le point de se démonter. 
    // gainNodeRef.current.disconnect(); déconnecte le gainNode de toute destination ou source à laquelle il était connecté. 
    // Cela est utile pour éviter les fuites de mémoire et s'assurer que les ressources audio sont correctement libérées lorsque le composant n'est plus utilisé.
    return () => {
      gainNodeRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    // Nettoyer l'audio précédent si nécessaire
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(audioSrc);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const track = audioContext.createMediaElementSource(audio);
    track.connect(gainNodeRef.current); // Connecter la nouvelle source au gainNode existant

    gainNodeRef.current.gain.value = volume; // Conserver le volume actuel

    // Ajouter l'écouteur d'événement 'ended' à l'élément audio
    audioRef.current.addEventListener('ended', handleAudioEnded);

    if (isPlaying) {
      audio.play().catch(e => console.error(e));
    }

    // Nettoyer en retirant l'audio et le track précédents
    return () => {
      audio.pause();
      track.disconnect();
      audio.removeEventListener('ended', handleAudioEnded); // Assurez-vous de retirer l'écouteur d'événement lors du nettoyage
    };
  }, [isPlaying]);

  // Lorsque l'on change de source audio,
  // la lecture s'arrête, et si le lecteur était en pause il ne l'est plus.
  useEffect(() => {
    if(audioSrc != null){
      setIsPaused(false);
      setIsPlaying(false);
    }
  }, [audioSrc]);

  // Définir la fonction de rappel pour l'événement 'ended'
  const handleAudioEnded = () => {
    setIsPaused(false);
    setIsPlaying(false);
  };

  // Si le volume change, le gain du lecteur s'ajuste
  useEffect(() => {
    gainNodeRef.current.gain.value = volume;
  }, [volume]);

  const play = () => {
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        audioRef.current.play().catch(e => console.error(e));
        setIsPlaying(true);
        setIsPaused(false);
      });
    } else {
      audioRef.current.play().catch(e => console.error(e));
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(true);
      setIsPaused(true);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return (
    <>
      <div>
        { (!isPlaying && !isPaused || isPlaying && isPaused) && 
          <button onClick={play} className={audioSrc == null ? "inactive" : ""}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.24182 2.32181C3.3919 2.23132 3.5784 2.22601 3.73338 2.30781L12.7334 7.05781C12.8974 7.14436 13 7.31457 13 7.5C13 7.68543 12.8974 7.85564 12.7334 7.94219L3.73338 12.6922C3.5784 12.774 3.3919 12.7687 3.24182 12.6782C3.09175 12.5877 3 12.4252 3 12.25V2.75C3 2.57476 3.09175 2.4123 3.24182 2.32181ZM4 3.57925V11.4207L11.4288 7.5L4 3.57925Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </button>
        }
        { isPlaying && !isPaused && 
          <button onClick={pause}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.04995 2.74998C6.04995 2.44623 5.80371 2.19998 5.49995 2.19998C5.19619 2.19998 4.94995 2.44623 4.94995 2.74998V12.25C4.94995 12.5537 5.19619 12.8 5.49995 12.8C5.80371 12.8 6.04995 12.5537 6.04995 12.25V2.74998ZM10.05 2.74998C10.05 2.44623 9.80371 2.19998 9.49995 2.19998C9.19619 2.19998 8.94995 2.44623 8.94995 2.74998V12.25C8.94995 12.5537 9.19619 12.8 9.49995 12.8C9.80371 12.8 10.05 12.5537 10.05 12.25V2.74998Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </button> 
        }
        <button onClick={stop} className={!isPlaying && !isPaused ? "inactive" : ""}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 3C2 2.44772 2.44772 2 3 2H12C12.5523 2 13 2.44772 13 3V12C13 12.5523 12.5523 13 12 13H3C2.44772 13 2 12.5523 2 12V3ZM12 3H3V12H12V3Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
        </button>
        <Volume volume={volume} setVolume={setVolume} />
        <Tracklist audioSrc={audioSrc} setAudioSrc={setAudioSrc}/>
      </div>
    </>
  );
}

export default App;

