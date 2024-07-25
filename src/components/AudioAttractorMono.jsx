import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Stage, Layer, Circle, Line } from 'react-konva';
import styled from 'styled-components';
import { transformArray } from '../utils/arrayUtils';

// Fonction pour calculer une moyenne mobile sur les données brutes
function movingAverage(arr, windowSize) {
    let result = [];
    for (let i = 0; i < arr.length - windowSize + 1; i++) {
        const window = arr.slice(i, i + windowSize);
        const average = window.reduce((sum, val) => sum + val, 0) / windowSize;
        result.push(average);
    }
    return result;
}

// Fonction pour générer les points de l'attracteur de Clifford
function generateCliffordAttractor(a, b, c, d, numPoints) {
    let x = 0;
    let y = 0;
    const points = [];

    for (let i = 0; i < numPoints; i++) {
        const newX = Math.sin(a * y) + c * Math.cos(a * x);
        const newY = Math.sin(b * x) + d * Math.cos(b * y);
        x = newX;
        y = newY;
        points.push({ x, y });
    }

    return points;
}

// Fonction pour normaliser les points sur la zone de dessin
function normalizePoints(points, width, height) {
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    return points.map(p => ({
        x: ((p.x - minX) / (maxX - minX)) * width,
        y: ((p.y - minY) / (maxY - minY)) * height
    }));
}

const AudioAttractorMono = ({ dataFrequencyMono }) => {
    const stageRef = useRef(null);
    const barsCount = 140;
    const history = 61;
    const pointRadius = 1.4;

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [attractor, setAttractor] = useState([]);
    const prevAttractorRef = useRef([]);

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: stageRef.current.offsetWidth,
                height: stageRef.current.offsetHeight
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const dataLeftCurrent = transformArray(movingAverage(dataFrequencyMono, 40), 0, 1800, barsCount, "normal");
        
        // Utiliser les données audio pour influencer les paramètres de l'attracteur
        const a = 1.5 + (dataLeftCurrent[0] / 255) * 0.5;
        const b = -1.5 + (dataLeftCurrent[Math.floor(barsCount / 3)] / 255) * 0.5;
        const c = 1.5 + (dataLeftCurrent[Math.floor(barsCount * 2 / 3)] / 255) * 0.5;
        const d = 0.5 + (dataLeftCurrent[barsCount - 1] / 255) * 0.5;

        const newAttractor = generateCliffordAttractor(a, b, c, d, 1000);
        const normalizedAttractor = normalizePoints(newAttractor, dimensions.width, dimensions.height);

        // Interpolation avec l'état précédent
        const interpolatedAttractor = normalizedAttractor.map((point, index) => {
            const prevPoint = prevAttractorRef.current[index] || point;
            return {
                x: prevPoint.x + (point.x - prevPoint.x) * 0.1,
                y: prevPoint.y + (point.y - prevPoint.y) * 0.1
            };
        });

        setAttractor(interpolatedAttractor);
        prevAttractorRef.current = interpolatedAttractor;
    }, [dataFrequencyMono, dimensions]);

    return (
        <CanvasContainer ref={stageRef}>
            <Stage width={dimensions.width} height={dimensions.height}>
                <Layer>
                    <Line
                        points={attractor.flatMap(p => [p.x, p.y])}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth={1}
                    />
                    {attractor.map((point, index) => (
                        <Circle
                            key={index}
                            x={point.x}
                            y={point.y}
                            radius={pointRadius}
                            fill="rgba(255, 255, 255, 0.8)"
                        />
                    ))}
                </Layer>
            </Stage>
        </CanvasContainer>
    );
};

AudioAttractorMono.propTypes = {
    dataFrequencyMono: PropTypes.array.isRequired,
};

const CanvasContainer = styled.div`
    position: absolute;
    width: calc(100% - 5rem);
    height: calc(100% - 5rem);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #000;
`;

export default AudioAttractorMono;