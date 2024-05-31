import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Stage, Layer, Line } from 'react-konva';
import styled from 'styled-components';
import { transformArray } from '../utils/arrayUtils';
import Grid from './Grid';


function generateLinePoints(dataSet, width, height, barsCount, symbol, amplifier){
    if (symbol === "+"){
        return dataSet.flatMap(
            (val, i) => [
                (i * width) / (barsCount - 1), height / 2 + val * amplifier
            ]
        )
    } else {
        return dataSet.flatMap(
            (val, i) => [
                (i * width) / (barsCount - 1), height / 2 - val * amplifier
            ]
        )
    }
}

const AudioVisualizerKonva = ({ dataFrequencyLeft, dataFrequencyRight, showGrid }) => {
    const stageRef = useRef(null);
    const barsCount = 42;
    const amplifier = 3;
    const historyStep = 5;

    // const dataV1 = transformArray(dataFrequencyLeft, 0, 2048, 2, "normal")
    // const dataV2 = transformArray(dataFrequencyLeft, 0, 2048, 2, "reverse")

    // Manage Canvas size
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
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
    const width = dimensions.width;
    const height = dimensions.height;
    // End manage Canvas size

    // on génère les données, puis les lignes principales
    const dataLeft = transformArray(dataFrequencyLeft, 0, 2048, barsCount, "normal")
    const dataRight = transformArray(dataFrequencyRight, 0, 2048, barsCount, "normal")

    const leftLinePoints = generateLinePoints(dataLeft, width, height, barsCount, "-", amplifier)
    const rightLinePoints = generateLinePoints(dataRight, width, height, barsCount, "+", amplifier)

    // Historique des données
    const [dataLeftHistory, setDataLeftHistory] = useState([]);
    const [dataRightHistory, setDataRightHistory] = useState([]);

    useEffect(() => {
        const dataLeft = transformArray(dataFrequencyLeft, 0, 2048, barsCount, "normal")
        const dataRight = transformArray(dataFrequencyRight, 0, 2048, barsCount, "normal")

        setDataLeftHistory((prevHistory) => {
            const newHistory = [dataLeft, ...prevHistory];
            return newHistory.slice(0, 10); // Conserver les 10 derniers jeux de données
        });

        setDataRightHistory((prevHistory) => {
            const newHistory = [dataRight, ...prevHistory];
            return newHistory.slice(0, 10); // Conserver les 10 derniers jeux de données
        });
    }, [dataFrequencyLeft, dataFrequencyRight]);

    let leftLinePointsHistory = [];
    let rightLinePointsHistory = [];
    if (dataLeftHistory[historyStep]){
        leftLinePointsHistory = generateLinePoints(dataLeftHistory[historyStep], width, height, barsCount, "-", amplifier)
    }
    if (dataRightHistory[historyStep]){
        rightLinePointsHistory = generateLinePoints(dataRightHistory[historyStep], width, height, barsCount, "+", amplifier)
    }

    return (
        <>
        <CanvasContainer ref={stageRef}>
            <Stage width={width} height={height}>
            <Layer>
                    <>
                        {Array.from({ length: barsCount }).map((_, i) => (
                            <Line key={`v2-${i}`}/>
                        ))}
                        {Array.from({ length: barsCount }).map((_, i) => (
                            <Line key={`h2-${i}`}/>
                        ))}
                    </>
                    {dataLeftHistory[historyStep] &&
                        <Line 
                            points={leftLinePointsHistory} 
                            stroke={"rgba(255,255,255,0.2)"} 
                            strokeWidth={2} 
                            dash={[2,2]} 
                            tension={0.2}
                            perfectDrawEnabled={false}
                            listening={false}
                        />
                    }
                    {dataRightHistory[historyStep] &&
                        <Line 
                            points={rightLinePointsHistory} 
                            stroke={"rgba(255,255,255,0.2)"} 
                            strokeWidth={2} 
                            dash={[2,2]} 
                            tension={0.2}
                            perfectDrawEnabled={false}
                            listening={false}
                        />
                    }
                </Layer>
                <Layer>
                    <>
                        {Array.from({ length: barsCount }).map((_, i) => (
                            <Line key={`v-${i}`}
                                  points={[i * (width / barsCount), 0, i * (width / barsCount), height]}
                            />
                        ))}
                        {Array.from({ length: barsCount }).map((_, i) => (
                            <Line key={`h-${i}`}
                                  points={[0, i * (height / barsCount), width, i * (height / barsCount)]}
                            />
                        ))}
                    </>
                    <Line 
                        points={leftLinePoints} 
                        stroke={"rgba(255,255,255,0.5)"} 
                        strokeWidth={2} dash={[2,2]} 
                        tension={0.2}
                        perfectDrawEnabled={false}
                        listening={false}
                    />
                    <Line 
                        points={rightLinePoints} 
                        stroke={"rgba(255,255,255,0.5)"} 
                        strokeWidth={2} dash={[2,2]} 
                        tension={0.2}
                        perfectDrawEnabled={false}
                        listening={false}
                    />
                </Layer>
            </Stage>
        </CanvasContainer>
            {showGrid && <Grid/>}
        </>
    );
};

AudioVisualizerKonva.propTypes = {
    dataFrequencyLeft: PropTypes.object.isRequired,
    dataFrequencyRight: PropTypes.object.isRequired,
    showGrid: PropTypes.bool,
};

const CanvasContainer = styled.div`
    position: absolute;
    width: calc(100vw - 10rem);
    height: calc(100vh - 10rem);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #121010;
`;

export default AudioVisualizerKonva;
