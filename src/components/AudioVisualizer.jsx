import { useRef, useEffect } from "react";
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { colorsUI, sizesUI } from "../utils/UI";


function AudioVisualizer({ dataFrequency }) {
    const canvasRef = useRef(null);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const { width, height } = canvas;
  
      context.clearRect(0, 0, width, height); // Nettoie le canvas
  
      // Exemple de dessin: barres de fréquence
      let barWidth = (width / dataFrequency.length) * 2.5;
      let barHeight;
      let x = 0;
      for(let i = 0; i < dataFrequency.length; i++) {
        barHeight = dataFrequency[i];
        
        //context.fillStyle = `rgb(${barHeight + 100},50,50)`;
        context.fillStyle = `rgb(255,255,255)`;
        context.fillRect(x, height - barHeight, barWidth, barHeight);
  
        x += barWidth + 1;
      }
    }, [dataFrequency]); // Se met à jour à chaque changement de dataFrequency
  
    return (
        <Visualizer>
            <canvas ref={canvasRef} width="1600" height="900"/>
        </Visualizer>
    )
}

export default AudioVisualizer
  
AudioVisualizer.propTypes = {
    dataFrequency: PropTypes.object,
}

const Visualizer = styled.div`
  position:absolute;
  width:calc(100% - 23rem);
  aspect-ratio:16/9;
  right:1rem;
  top:1rem;
  background:${colorsUI.background};
  border-radius:${sizesUI.radiusBig};
  & canvas{
    position:absolute;
    //outline:1px solid white;
    width:calc(100% - 2rem);
    height:calc(100% - 2rem);
    top:1rem;
    left:1rem;
  }
`