import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components'
import { GetData } from './api';
import { colorsUI, sizesUI } from './utils/UI';
import Volume from './components/Volume';
import Tracklist from './components/Tracklist';
import TrackTimeControler from './components/TimeControler';
import AudioVisualizer2 from './components/AudioVisualizer2';
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
  const [audioSrc, setAudioSrc] = useState(null);
  const [volume, setVolume] = useState(0.8);
  const [dataFrequency, setDataFrequency] = useState(new Uint8Array(0));
  const [dataFrequencyRight, setDataFrequencyRight] = useState(new Uint8Array(0));
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const tracklist = GetData("data/tracklist.json");

  const audioRef = useRef(new Audio());
  const gainNodeRef = useRef(audioContext.createGain());
  const analyserNodeRef = useRef(audioContext.createAnalyser());
  const analyserNodeRefRight = useRef(audioContext.createAnalyser());
  const splitterRef = useRef(audioContext.createChannelSplitter(2));

  useEffect(() => {
    const track = audioContext.createMediaElementSource(audioRef.current);
    track.connect(gainNodeRef.current);
    gainNodeRef.current.connect(splitterRef.current);
    splitterRef.current.connect(analyserNodeRef.current, 0);
    splitterRef.current.connect(analyserNodeRefRight.current, 1);
    gainNodeRef.current.connect(audioContext.destination);

    analyserNodeRef.current.fftSize = 2048;
    analyserNodeRefRight.current.fftSize = 2048;

    return () => {
      audioRef.current.pause();
      audioContext.close();
    };
  }, []);

  useEffect(() => {
    if (audioSrc) {
      audioRef.current.src = audioSrc;
      audioRef.current.load();
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current.duration);
      });
      audioRef.current.addEventListener('ended', handleAudioEnded);
    }
  }, [audioSrc]);

  useEffect(() => {
    gainNodeRef.current.gain.value = volume;
  }, [volume]);

  useEffect(() => {
    const updateAnalyserData = () => {
      if (isPlaying && !isPaused) {
        const frequencyData = new Uint8Array(analyserNodeRef.current.frequencyBinCount);
        analyserNodeRef.current.getByteFrequencyData(frequencyData);
        setDataFrequency(frequencyData);

        const frequencyDataRight = new Uint8Array(analyserNodeRefRight.current.frequencyBinCount);
        analyserNodeRefRight.current.getByteFrequencyData(frequencyDataRight);
        setDataFrequencyRight(frequencyDataRight);
      }
    };

    const intervalId = setInterval(updateAnalyserData, 50);

    return () => clearInterval(intervalId);
  }, [isPlaying, isPaused]);

  const play = () => {
    setIsPlaying(true);
    setIsPaused(false);
    audioRef.current.play();
  };

  const pause = () => {
    setIsPaused(true);
    audioRef.current.pause();
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setIsPaused(false);
  };

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
  
  const launchTrack = (source) => {
    if (isPlaying) {
      // Arrêter la lecture actuelle avant de changer de source
      stop(); // Assurez-vous que cette fonction réinitialise isPlaying et isPaused comme nécessaire
    }
    // Mettre à jour la source audio, ce qui déclenchera le useEffect pour charger et jouer la nouvelle source
    setAudioSrc(source);
    // La logique dans useEffect pour audioSrc devrait s'occuper de jouer la nouvelle source si isPlaying est vrai
  };

  // Permet de déplacer la lecture dans la piste audio
  const controlProgression = (event) => {
    const newTime = event.target.value;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }

  console.log(dataFrequency)
  console.log(dataFrequencyRight)

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