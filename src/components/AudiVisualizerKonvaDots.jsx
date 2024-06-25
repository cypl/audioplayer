import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Stage, Layer, Circle } from 'react-konva';
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

function generateCirclePoints(dataSet, width, height, barsCount, symbol, amplifier, amplifierRatio) {
    const points = [];
    const halfHeight = height / 2;
    const baseHeight = 0;

    dataSet.forEach((val, i) => {
        const x = symbol === "+" ? width / 2 + val * (amplifier * amplifierRatio[i]) : width / 2 - val * (amplifier * amplifierRatio[i]);
        const y = baseHeight + ((i * height) / (barsCount - 1));
        points.push({ x, y, value: val });
    });

    return points;
}

function pointOpacity(pointValue) {
    if(pointValue >= 10){
        return 1
    }
    else if(pointValue < 10 && pointValue > 9){
        return 0.9
    }
    else if(pointValue < 9 && pointValue > 8){
        return 0.8
    }
    else if(pointValue < 8 && pointValue > 7){
        return 0.7
    }
    else if(pointValue < 6 && pointValue > 5){
        return 0.6
    }
    else if(pointValue < 5 && pointValue > 4){
        return 0.5
    }
    else if(pointValue < 4 && pointValue > 3){
        return 0.4
    }
    else if(pointValue < 3 && pointValue > 2){
        return 0.3
    }
    else if(pointValue < 2 && pointValue > 1){
        return 0.2
    }
    else if(pointValue < 1 && pointValue > 0){
        return 0.1
    }
    else{
        return 0
    }
}

const AudioVisualizerKonvaDots = ({ dataFrequencyLeft, dataFrequencyRight, showGrid }) => {
    const stageRef = useRef(null);
    const dotSize = 1.6;
    // First group
    const barsCount = 150;
    const amplifier = 5.5;
    // Second group
    const barsCountSecond = 150;
    const amplifierSecond = 7.5;

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
    // Second group
    const [previousDataLeftSecond, setPreviousDataLeftSecond] = useState([]);
    const [previousDataRightSecond, setPreviousDataRightSecond] = useState([]);

    // Generate current data
    const dataLeftCurrent = transformArray(dataFrequencyLeft, 50, 200, barsCount, "normal");  // max 2048
    const dataRightCurrent = transformArray(dataFrequencyRight, 50, 200, barsCount, "normal"); // max 2048
    const dataLeftCurrentSecond = transformArray(dataFrequencyLeft, 200, 1200, barsCountSecond, "normal");  // max 2048
    const dataRightCurrentSecond = transformArray(dataFrequencyRight, 200, 1200, barsCountSecond, "normal"); // max 2048

    // Update previous data state
    useEffect(() => {
        setPreviousDataLeft(prev => [...prev.slice(-20), dataLeftCurrent]);
        setPreviousDataRight(prev => [...prev.slice(-20), dataRightCurrent]);
        setPreviousDataLeftSecond(prev => [...prev.slice(-20), dataLeftCurrentSecond]);
        setPreviousDataRightSecond(prev => [...prev.slice(-20), dataRightCurrentSecond]);
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
    const dataLeftSecond = getDataPairs(dataLeftCurrentSecond, previousDataLeftSecond);
    const dataRightSecond = getDataPairs(dataRightCurrentSecond, previousDataRightSecond);

    console.clear();
    console.log(dataLeft);

    // Flatten the combined data for current and historical values
    const dataLeftValues = dataLeft.map(pair => pair[0]);
    const dataRightValues = dataRight.map(pair => pair[0]);
    const dataLeftHistoryRatio = dataLeft.map(pair => pair[1]);
    const dataRightHistoryRatio = dataRight.map(pair => pair[1]);

    const combinedDataLeft = [...dataLeftValues.reverse(), ...dataLeftValues.reverse()];
    const combinedDataRight = [...dataRightValues.reverse(), ...dataRightValues.reverse()];
    const combinedDataLeftHistoryRatio = [...dataLeftHistoryRatio.reverse(), ...dataLeftHistoryRatio.reverse()];
    const combinedDataRightHistoryRatio = [...dataRightHistoryRatio.reverse(), ...dataRightHistoryRatio.reverse()];

    const combinedLeftPoints = generateCirclePoints(combinedDataLeft, width, height, barsCount * 2, "-", amplifier, Array(barsCount * 2).fill(1));
    const combinedRightPoints = generateCirclePoints(combinedDataRight, width, height, barsCount * 2, "+", amplifier, Array(barsCount * 2).fill(1));
    const combinedLeftPointsHistory = generateCirclePoints(combinedDataLeft, width, height, barsCount * 2, "-", amplifier, combinedDataLeftHistoryRatio);
    const combinedRightPointsHistory = generateCirclePoints(combinedDataRight, width, height, barsCount * 2, "+", amplifier, combinedDataRightHistoryRatio);

    // Second group
    const dataLeftValuesSecond = dataLeftSecond.map(pair => pair[0]);
    const dataRightValuesSecond = dataRightSecond.map(pair => pair[0]);
    const dataLeftHistoryRatioSecond = dataLeftSecond.map(pair => pair[1]);
    const dataRightHistoryRatioSecond = dataRightSecond.map(pair => pair[1]);

    const combinedDataLeftSecond = [...dataLeftValuesSecond.reverse(), ...dataLeftValuesSecond.reverse()];
    const combinedDataRightSecond = [...dataRightValuesSecond.reverse(), ...dataRightValuesSecond.reverse()];
    const combinedDataLeftHistoryRatioSecond = [...dataLeftHistoryRatioSecond.reverse(), ...dataLeftHistoryRatioSecond.reverse()];
    const combinedDataRightHistoryRatioSecond = [...dataRightHistoryRatioSecond.reverse(), ...dataRightHistoryRatioSecond.reverse()];

    const combinedLeftPointsSecond = generateCirclePoints(combinedDataLeftSecond, width, height, barsCountSecond * 2, "-", amplifierSecond, Array(barsCountSecond * 2).fill(1));
    const combinedRightPointsSecond = generateCirclePoints(combinedDataRightSecond, width, height, barsCountSecond * 2, "+", amplifierSecond, Array(barsCountSecond * 2).fill(1));
    const combinedLeftPointsHistorySecond = generateCirclePoints(combinedDataLeftSecond, width, height, barsCountSecond * 2, "-", amplifierSecond, combinedDataLeftHistoryRatioSecond);
    const combinedRightPointsHistorySecond = generateCirclePoints(combinedDataRightSecond, width, height, barsCountSecond * 2, "+", amplifierSecond, combinedDataRightHistoryRatioSecond);

    return (
        <>
            <CanvasContainer ref={stageRef}>
                <Stage width={width} height={height}>
                    <Layer>
                        
                        {combinedLeftPoints.map((point, index) => (
                            <Circle 
                                key={`left-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSize} 
                                fill="rgba(126, 66, 245,1)" 
                                opacity={pointOpacity(point.value)} 
                            />
                        ))}
                        {/* history points */}
                        {combinedLeftPointsHistory.map((point, index) => (
                            <Circle 
                                key={`left-history-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSize} 
                                fill="rgba(126, 66, 245,0.5)" 
                                opacity={pointOpacity(point.value)} 
                            />
                        ))}
                        {combinedRightPoints.map((point, index) => (
                            <Circle 
                                key={`right-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSize} 
                                fill="rgba(126, 66, 245,1)" 
                                opacity={pointOpacity(point.value)} 
                            />
                        ))}
                        {/* history points */}
                        {combinedRightPointsHistory.map((point, index) => (
                            <Circle 
                                key={`right-history-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSize} 
                                fill="rgba(126, 66, 245,0.5)" 
                                opacity={pointOpacity(point.value)} 
                            />
                        ))}


                        {combinedLeftPointsSecond.map((point, index) => (
                            <Circle 
                                key={`left-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSize} 
                                fill="rgba(66,135,245,1)" 
                                opacity={pointOpacity(point.value)} 
                            />
                        ))}
                        {/* history points */}
                        {combinedLeftPointsHistorySecond.map((point, index) => (
                            <Circle 
                                key={`left-history-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSize} 
                                fill="rgba(66,135,245,0.5)" 
                                opacity={pointOpacity(point.value)} 
                            />
                        ))}
                        {combinedRightPointsSecond.map((point, index) => (
                            <Circle 
                                key={`right-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSize} 
                                fill="rgba(66,135,245,1)" 
                                opacity={pointOpacity(point.value)}  
                            />
                        ))}
                        {/* history points */}
                        {combinedRightPointsHistorySecond.map((point, index) => (
                            <Circle 
                                key={`right-history-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSize} 
                                fill="rgba(66,135,245,0.5)" 
                                opacity={pointOpacity(point.value)} 
                            />
                        ))}
                    </Layer>
                </Stage>
            </CanvasContainer>
            {showGrid && <Grid />}
        </>
    );
};

AudioVisualizerKonvaDots.propTypes = {
    dataFrequencyLeft: PropTypes.array.isRequired,
    dataFrequencyRight: PropTypes.array.isRequired,
    showGrid: PropTypes.bool,
};

const CanvasContainer = styled.div`
    position: absolute;
    // width: calc(100vw - 10rem);
    // height: calc(100vh - 10rem);
    width:100%;
    height:100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    //background-color: #121010;
    background-color: #000;
`;

export default AudioVisualizerKonvaDots;
