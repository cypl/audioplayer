import { useRef, useEffect } from "react";
import p5 from "p5";
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colorsUI, sizesUI } from "../utils/UI";

const AudioVisualizer2 = ({ dataFrequency }) => {
    const sketchRef = useRef();
    const p5Instance = useRef(null);
    const latestData = useRef(dataFrequency); // Stocker la dernière dataFrequency pour l'accès dans draw
    useEffect(() => {
      // Initialisation du sketch p5.js
      const sketch = (p) => {
        p.setup = () => {
          p.createCanvas(600, 300);
          p.noFill();
        };
    
        p.draw = () => {
            p.background(0, 10); // Utiliser une valeur alpha modérée pour le fond
            p.stroke(255);
    
            p.beginShape();
        //   for (let i = 0; i < latestData.current.length; i++) {
        //     const x = p.map(i, 0, latestData.current.length, 0, p.width);
        //     const y = p.map(latestData.current[i], 0, 255, p.height, 0);
        //     p.vertex(x, y);
        //   }
            let index = 0; // Pour garder la trace de l'index actuel
            for (const value of latestData.current) {
                const x = p.map(index, 0, latestData.current.length, 0, p.width);
                const y = p.map(value, 0, 255, p.height, 0);
                p.vertex(x, y);
                index++; // Incrémentez l'index à chaque itération
            }
            p.endShape();
        };
    };

      p5Instance.current = new p5(sketch, sketchRef.current);

      return () => {
        p5Instance.current.remove();
      };
    }, []); // Le sketch est initialisé une seule fois

    useEffect(() => {
      latestData.current = dataFrequency; // Mise à jour de la dernière dataFrequency
    }, [dataFrequency]);

    return (
        <Visualizer ref={sketchRef} />
    );
};

export default AudioVisualizer2;

AudioVisualizer2.propTypes = {
    dataFrequency: PropTypes.object,
};

const Visualizer = styled.div`
  position: absolute;
  width: calc(100% - 23rem);
  aspect-ratio: 16/9;
  right: 1rem;
  top: 1rem;
  background: ${colorsUI.background};
  border-radius: ${sizesUI.radiusBig};
  & canvas {
    position: absolute;
    // width: calc(100% - 1rem)!important;
    // height: calc(100% - 1rem)!important;
    top: 0.5rem;
    left: 0.5rem;
    border-radius:${sizesUI.radius};
  }
`