import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Stage, Layer, Line } from 'react-konva';
import styled from 'styled-components';
import { transformArray } from '../utils/arrayUtils';
import Grid from './Grid';

function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

function smoothArray(arr, smoothingFactor = 0.1) {
    const smoothedArr = [];
    smoothedArr[0] = arr[0]; // Première valeur inchangée
    for (let i = 1; i < arr.length; i++) {
        smoothedArr[i] = smoothedArr[i - 1] + smoothingFactor * (arr[i] - smoothedArr[i - 1]);
    }
    return smoothedArr;
}

function generateLinePoints(dataSet, width, height, barsCount, symbol, amplifier, amplifierRatio) {
    const halfHeight = height / 2;
    const baseHeight = 0;

    return dataSet.flatMap(
        (val, i) => [
            symbol === "+" ? width / 2 + val * (amplifier * amplifierRatio[i]) : width / 2 - val * (amplifier * amplifierRatio[i]), 
            baseHeight + ((i * height) / (barsCount - 1))
        ]
    );
}

const AudioVisualizerLines = ({ dataFrequencyLeft, dataFrequencyRight, showGrid }) => {
    const stageRef = useRef(null);
    const barsCount = 30;
    const amplifier = 5;

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

    // State to store previous data
    const [previousDataLeft, setPreviousDataLeft] = useState([]);
    const [previousDataRight, setPreviousDataRight] = useState([]);

    // Generate current data
    const dataLeftCurrent = transformArray(dataFrequencyLeft, 50, 1400, barsCount, "normal");  // max 2048
    const dataRightCurrent = transformArray(dataFrequencyRight, 50, 1400, barsCount, "normal"); // max 2048

    // Update previous data state
    useEffect(() => {
        setPreviousDataLeft(prev => [...prev.slice(-4), dataLeftCurrent]);
        setPreviousDataRight(prev => [...prev.slice(-4), dataRightCurrent]);
    }, [dataFrequencyLeft, dataFrequencyRight]);

    // Combine current and previous data
    const getDataPairs = (currentData, previousData) => {
        const ratios = currentData.map((val, i) => {
            const prevVal = previousData.length > 4 ? previousData[0][i] : val;
            return clamp(prevVal !== 0 ? val / prevVal : 1, 0.2, 1.8); // Avoid division by zero and clamp
        });
        
        const smoothedRatios = smoothArray(ratios, 0.05); // Adjust the smoothing factor as needed

        return currentData.map((val, i) => [val, smoothedRatios[i]]);
    };

    const dataLeft = getDataPairs(dataLeftCurrent, previousDataLeft);
    const dataRight = getDataPairs(dataRightCurrent, previousDataRight);

    console.clear()
    console.log(dataLeft)

    // Flatten the combined data for current and historical values
    const dataLeftValues = dataLeft.map(pair => pair[0]);
    const dataRightValues = dataRight.map(pair => pair[0]);

    const dataLeftHistoryRatio = dataLeft.map(pair => pair[1]);
    const dataRightHistoryRatio = dataRight.map(pair => pair[1]);

    const combinedDataLeft = [...dataLeftValues.reverse(), ...dataLeftValues.reverse()];
    const combinedDataRight = [...dataRightValues.reverse(), ...dataRightValues.reverse()];

    const combinedDataLeftHistoryRatio = [...dataLeftHistoryRatio.reverse(), ...dataLeftHistoryRatio.reverse()];
    const combinedDataRightHistoryRatio = [...dataRightHistoryRatio.reverse(), ...dataRightHistoryRatio.reverse()];

    const combinedLeftPoints = generateLinePoints(combinedDataLeft, width, height, barsCount * 2, "-", amplifier, Array(barsCount * 2).fill(1));
    const combinedRightPoints = generateLinePoints(combinedDataRight, width, height, barsCount * 2, "+", amplifier, Array(barsCount * 2).fill(1));

    const combinedLeftPointsHistory = generateLinePoints(combinedDataLeft, width, height, barsCount * 2, "-", amplifier, combinedDataLeftHistoryRatio);
    const combinedRightPointsHistory = generateLinePoints(combinedDataRight, width, height, barsCount * 2, "+", amplifier, combinedDataRightHistoryRatio);

    return (
        <>
            <CanvasContainer ref={stageRef}>
                <Stage width={width} height={height}>
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
                            points={combinedLeftPoints} 
                            stroke={"rgba(255,255,255,0.5)"} 
                            strokeWidth={2} dash={[2,2]} 
                            tension={0.2}
                            perfectDrawEnabled={false}
                            listening={false}
                        />
                        {/* history line */}
                        <Line 
                            points={combinedLeftPointsHistory} 
                            stroke={"rgba(255,255,255,0.25)"} 
                            strokeWidth={2} dash={[2,2]} 
                            tension={0.2}
                            perfectDrawEnabled={false}
                            listening={false}
                        />
                        <Line 
                            points={combinedRightPoints} 
                            stroke={"rgba(255,255,255,0.5)"} 
                            strokeWidth={2} dash={[2,2]} 
                            tension={0.2}
                            perfectDrawEnabled={false}
                            listening={false}
                        />
                        {/* history line */}
                        <Line 
                            points={combinedRightPointsHistory} 
                            stroke={"rgba(255,255,255,0.25)"} 
                            strokeWidth={2} dash={[2,2]} 
                            tension={0.2}
                            perfectDrawEnabled={false}
                            listening={false}
                        />
                    </Layer>
                </Stage>
            </CanvasContainer>
            {showGrid && <Grid />}
        </>
    );
};

AudioVisualizerLines.propTypes = {
    dataFrequencyLeft: PropTypes.array.isRequired,
    dataFrequencyRight: PropTypes.array.isRequired,
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

export default AudioVisualizerLines;
