import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Stage, Layer, Circle } from 'react-konva';
import styled from 'styled-components';
import { transformArray } from '../utils/arrayUtils';
import { colorsUI, sizesUI } from '../utils/UI';

// Fonction pour limiter une valeur entre un minimum et un maximum
function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

// Fonction pour lisser un tableau avec un facteur de lissage
function smoothArray(arr, smoothingFactor = 0.05) {
    const smoothedArr = [];
    smoothedArr[0] = arr[0]; // Première valeur inchangée
    for (let i = 1; i < arr.length; i++) {
        smoothedArr[i] = smoothedArr[i - 1] + smoothingFactor * (arr[i] - smoothedArr[i - 1]);
    }
    return smoothedArr;
}

// Fonction pour calculer une moyenne mobile sur les données brutes
function movingAverage(arr, windowSize) {
    let result = [];
    for (let i = 0; i < arr.length - windowSize + 1; i++) {
        const window = arr.slice(i, i + windowSize); // Sélectionne une fenêtre de données
        const average = window.reduce((sum, val) => sum + val, 0) / windowSize; // Calcule la moyenne de la fenêtre
        result.push(average);
    }
    return result;
}

// Fonction pour interpoler entre deux tableaux de données
function interpolateArrays(arr1, arr2, factor) {
    return arr1.map((val, index) => val + factor * (arr2[index] - val)); // Interpole chaque élément entre arr1 et arr2
}

// Fonction d'atténuation
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// Fonction pour appliquer le fondu
function applyFade(value, index, total, fadeCount) {
    if (index < fadeCount) {
        return value * easeInOutQuad(index / fadeCount);
    } else if (index >= total - fadeCount) {
        return value * easeInOutQuad((total - index - 1) / fadeCount);
    }
    return value;
}

// Fonction pour générer des points de cercle à partir d'un jeu de données
function generateCirclePoints(dataSet, width, height, barsCount, symbol, amplifier, amplifierRatio) {
    const points = [];
    const baseHeight = 0;
    const fadeCount = 25; // Nombre de points à atténuer au début et à la fin

    dataSet.forEach((val, i) => {
        const fadedVal = applyFade(val, i, dataSet.length, fadeCount);
        const x = symbol === "+" 
            ? width / 2 + fadedVal * (amplifier * amplifierRatio[i]) 
            : width / 2 - fadedVal * (amplifier * amplifierRatio[i]);
        const y = baseHeight + ((i * height) / (barsCount - 1));
        points.push({ x, y, value: fadedVal });
    });

    return points;
}

// Fonction pour déterminer l'opacité d'un point en fonction de sa valeur
function pointOpacity(pointValue) {
    if (pointValue >= 10) {
        return 1;
    } else if (pointValue > 0) {
        return 0.05 + (pointValue / 10) * 0.9;
    } else {
        return 0;
    }
}

function generateHslaColor(baseHue, limitHue, variation, alpha) {
    // S'assurer que la variation est entre 0 et 100
    if (variation < 0) variation = 0;
    if (variation > 100) variation = 100;
  
    // Ramener limitHue dans la plage de 0 à 360
    limitHue = ((limitHue % 360) + 360) % 360;
  
    let newHue;
    if (limitHue >= baseHue) {
      // Cas simple : limitHue est supérieur ou égal à baseHue
      newHue = baseHue + (limitHue - baseHue) * (variation / 100);
    } else {
      // Cas de rotation : limitHue est inférieur à baseHue
      newHue = baseHue + (limitHue + 360 - baseHue) * (variation / 100);
      // Ramener newHue dans la plage de 0 à 360
      newHue = newHue % 360;
    }
  
    // Générer la chaîne de caractères HSLA avec la nouvelle teinte et l'alpha
    return `hsla(${newHue}, 90%, 61%, ${alpha})`;
}

const AudioVisualizerDots2 = ({ dataFrequencyLeft, dataFrequencyRight }) => {
    const stageRef = useRef(null);
    // Première groupe
    const dotSize = 1.8;
    const barsCount = 50;
    const amplifier = 4.5;
    // Deuxième groupe
    const dotSizeSecond = 1.2;
    const barsCountSecond = 50;
    const amplifierSecond = 7.5;
    // Troisième groupe
    const dotSizeThird = 0.9;
    const barsCountThird = 50;
    const amplifierThird = 8.5;


    // Gestion de la taille du canvas
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
    // Fin de la gestion de la taille du canvas


    // État pour stocker les données précédentes
    // Premier groupe
    const [previousDataLeft, setPreviousDataLeft] = useState([]);
    const [previousDataRight, setPreviousDataRight] = useState([]);
    // Deuxième groupe
    const [previousDataLeftSecond, setPreviousDataLeftSecond] = useState([]);
    const [previousDataRightSecond, setPreviousDataRightSecond] = useState([]);
    // Troisième groupe
    const [previousDataLeftThird, setPreviousDataLeftThird] = useState([]);
    const [previousDataRightThird, setPreviousDataRightThird] = useState([]);

    // Générer les données actuelles
    // Premier groupe
    const dataLeftCurrent = transformArray(movingAverage(dataFrequencyLeft, 50), 50, 200, barsCount, "normal");  // max 2048
    const dataRightCurrent = transformArray(movingAverage(dataFrequencyRight, 50), 50, 200, barsCount, "normal"); // max 2048
    // Deuxième groupe
    const dataLeftCurrentSecond = transformArray(movingAverage(dataFrequencyLeft, 80), 150, 600, barsCountSecond, "normal");  // max 2048
    const dataRightCurrentSecond = transformArray(movingAverage(dataFrequencyRight, 80), 150, 600, barsCountSecond, "normal"); // max 2048
    // Troisième groupe
    const dataLeftCurrentThird = transformArray(movingAverage(dataFrequencyLeft, 80), 500, 1600, barsCountThird, "normal");  // max 2048
    const dataRightCurrentThird = transformArray(movingAverage(dataFrequencyRight, 80), 500, 1600, barsCountThird, "normal"); // max 2048
    
    // Mettre à jour l'état des données précédentes (20 rendus précédents)
    useEffect(() => {
        // Premier groupe
        setPreviousDataLeft(prev => [...prev.slice(-20), dataLeftCurrent]);
        setPreviousDataRight(prev => [...prev.slice(-20), dataRightCurrent]);
        // Deuxième groupe
        setPreviousDataLeftSecond(prev => [...prev.slice(-20), dataLeftCurrentSecond]);
        setPreviousDataRightSecond(prev => [...prev.slice(-20), dataRightCurrentSecond]);
        // Troisième groupe
        setPreviousDataLeftThird(prev => [...prev.slice(-20), dataLeftCurrentThird]);
        setPreviousDataRightThird(prev => [...prev.slice(-20), dataRightCurrentThird]);
    }, [dataFrequencyLeft, dataFrequencyRight]);

    // Fonction pour interpoler entre les données actuelles et précédentes
    const interpolateData = (currentData, previousData, factor = 0.05) => {
        if (previousData.length > 0) {
            const previous = previousData[previousData.length - 1];
            return interpolateArrays(previous, currentData, factor);
        }
        return currentData;
    };

    // Création d'un jeu de données, avec des données actuelles et les données précédentes
    // Premier groupe
    const interpolatedDataLeft = interpolateData(dataLeftCurrent, previousDataLeft);
    const interpolatedDataRight = interpolateData(dataRightCurrent, previousDataRight);
    // Deuxième groupe
    const interpolatedDataLeftSecond = interpolateData(dataLeftCurrentSecond, previousDataLeftSecond);
    const interpolatedDataRightSecond = interpolateData(dataRightCurrentSecond, previousDataRightSecond);
    // Deuxième groupe
    const interpolatedDataLeftThird = interpolateData(dataLeftCurrentThird, previousDataLeftThird);
    const interpolatedDataRightThird = interpolateData(dataRightCurrentThird, previousDataRightThird);

    // Combiner les données actuelles et interpolées
    const getDataPairs = (currentData, previousData) => {
        const ratios = currentData.map((val, i) => {
            const prevVal = previousData.length > 4 ? previousData[0][i] : val;
            return clamp(prevVal !== 0 ? val / prevVal : 1, 0.2, 1.8); // Évite la division par zéro et limite la valeur
        });

        const smoothedRatios = smoothArray(ratios, 0.05); // Ajuste le facteur de lissage si nécessaire

        return currentData.map((val, i) => [val, smoothedRatios[i]]);
    };

    const dataLeft = getDataPairs(interpolatedDataLeft, previousDataLeft);
    const dataRight = getDataPairs(interpolatedDataRight, previousDataRight);
    const dataLeftSecond = getDataPairs(interpolatedDataLeftSecond, previousDataLeftSecond);
    const dataRightSecond = getDataPairs(interpolatedDataRightSecond, previousDataRightSecond);
    const dataLeftThird = getDataPairs(interpolatedDataLeftThird, previousDataLeftThird);
    const dataRightThird = getDataPairs(interpolatedDataRightThird, previousDataRightThird);

    // Aplatir les données combinées pour les valeurs actuelles et historiques
    // Premier groupe
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

    // Deuxième groupe
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

    // Troisième groupe
    const dataLeftValuesThird = dataLeftThird.map(pair => pair[0]);
    const dataRightValuesThird = dataRightThird.map(pair => pair[0]);
    const dataLeftHistoryRatioThird = dataLeftThird.map(pair => pair[1]);
    const dataRightHistoryRatioThird = dataRightThird.map(pair => pair[1]);

    const combinedDataLeftThird = [...dataLeftValuesThird.reverse(), ...dataLeftValuesThird.reverse()];
    const combinedDataRightThird = [...dataRightValuesThird.reverse(), ...dataRightValuesThird.reverse()];
    const combinedDataLeftHistoryRatioThird = [...dataLeftHistoryRatioThird.reverse(), ...dataLeftHistoryRatioThird.reverse()];
    const combinedDataRightHistoryRatioThird = [...dataRightHistoryRatioThird.reverse(), ...dataRightHistoryRatioThird.reverse()];

    const combinedLeftPointsThird = generateCirclePoints(combinedDataLeftThird, width, height, barsCountThird * 2, "-", amplifierThird, Array(barsCountThird * 2).fill(1));
    const combinedRightPointsThird = generateCirclePoints(combinedDataRightThird, width, height, barsCountThird * 2, "+", amplifierThird, Array(barsCountThird * 2).fill(1));
    const combinedLeftPointsHistoryThird = generateCirclePoints(combinedDataLeftThird, width, height, barsCountThird * 2, "-", amplifierThird, combinedDataLeftHistoryRatioThird);
    const combinedRightPointsHistoryThird = generateCirclePoints(combinedDataRightThird, width, height, barsCountThird * 2, "+", amplifierThird, combinedDataRightHistoryRatioThird);

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
                                fill={generateHslaColor(260, 400, point.value, 1)} 
                                opacity={pointOpacity(point.value)} 
                            />
                        ))}
                        {combinedLeftPointsHistory.map((point, index) => (
                            <Circle 
                                key={`left-history-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSize} 
                                fill={generateHslaColor(260, 400, point.value, 0.5)}  
                                opacity={pointOpacity(point.value)} 
                            />
                        ))}
                        {combinedRightPoints.map((point, index) => (
                            <Circle 
                                key={`right-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSize} 
                                fill={generateHslaColor(260, 400, point.value, 1)}
                                opacity={pointOpacity(point.value)} 
                            />
                        ))}
                        {combinedRightPointsHistory.map((point, index) => (
                            <Circle 
                                key={`right-history-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSize} 
                                fill={generateHslaColor(260, 400, point.value, 0.5)} 
                                opacity={pointOpacity(point.value)} 
                            />
                        ))}

                        {/* Deuxième groupe */}

                        {combinedLeftPointsSecond.map((point, index) => (
                            <Circle 
                                key={`left-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSizeSecond} 
                                fill={generateHslaColor(290, 430, point.value, 1)} 
                                opacity={pointOpacity(point.value)} 
                            />
                        ))}
                        {/* history points */}
                        {combinedLeftPointsHistorySecond.map((point, index) => (
                            <Circle 
                                key={`left-history-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSizeSecond} 
                                fill={generateHslaColor(290, 430, point.value, 0.5)} 
                                opacity={pointOpacity(point.value)} 
                            />
                        ))}
                        {combinedRightPointsSecond.map((point, index) => (
                            <Circle 
                                key={`right-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSizeSecond} 
                                fill={generateHslaColor(290, 430, point.value, 1)} 
                                opacity={pointOpacity(point.value)}  
                            />
                        ))}
                        {combinedRightPointsHistorySecond.map((point, index) => (
                            <Circle 
                                key={`right-history-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSizeSecond} 
                                fill={generateHslaColor(290, 430, point.value, 0.5)} 
                                opacity={pointOpacity(point.value)} 
                            />
                        ))}

                        {/* Deuxième groupe */}

                        {combinedLeftPointsThird.map((point, index) => (
                            <Circle 
                                key={`left-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSizeThird} 
                                fill={generateHslaColor(290, 430, point.value, 1)} 
                                opacity={pointOpacity(point.value)} 
                            />
                        ))}
                        {/* history points */}
                        {combinedLeftPointsHistoryThird.map((point, index) => (
                            <Circle 
                                key={`left-history-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSizeThird} 
                                fill={generateHslaColor(290, 430, point.value, 0.5)} 
                                opacity={pointOpacity(point.value)} 
                            />
                        ))}
                        {combinedRightPointsThird.map((point, index) => (
                            <Circle 
                                key={`right-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSizeThird} 
                                fill={generateHslaColor(290, 430, point.value, 1)} 
                                opacity={pointOpacity(point.value)}  
                            />
                        ))}
                        {combinedRightPointsHistoryThird.map((point, index) => (
                            <Circle 
                                key={`right-history-${index}`} 
                                x={point.x} 
                                y={point.y} 
                                radius={dotSizeThird} 
                                fill={generateHslaColor(290, 430, point.value, 0.5)} 
                                opacity={pointOpacity(point.value)} 
                            />
                        ))}

                    </Layer>
                </Stage>
            </CanvasContainer>
        </>
    );
};

AudioVisualizerDots2.propTypes = {
    dataFrequencyLeft: PropTypes.array.isRequired,
    dataFrequencyRight: PropTypes.array.isRequired,
};

const CanvasContainer = styled.div`
    position: absolute;
    width:calc(100% - 5rem);
    height:calc(100% - 5rem);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #000;
    //border:1px solid ${colorsUI.border};
    //border-radius:${sizesUI.radius};
`;

export default AudioVisualizerDots2;
