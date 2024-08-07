import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Stage, Layer, Circle, Rect, Line } from 'react-konva';
import styled from 'styled-components';
import { transformArray } from '../utils/arrayUtils';


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

// Fonction pour générer des points de cercle à partir d'un jeu de données
function generateCirclePoints(dataSet, width, height, barsCount, amplifier, pointRadius, isUpperHalf) {
    const points = [];
    const baseHeight = height / 2; // Le milieu du canvas
    const effectiveWidth = width - 2 * pointRadius;

    dataSet.forEach((val, i) => {
        const x = pointRadius + (i / (barsCount - 1)) * effectiveWidth;
        const y = isUpperHalf 
            ? baseHeight - val * amplifier
            : baseHeight + val * amplifier; // Symétrie pour la partie inférieure
        points.push({ x, y, value: val });
    });

    return points;
}

const generateLinePoints = (dataSet, width, height, barsCount, amplifier, pointRadius, isUpperHalf) => {
    const points = [];
    const effectiveWidth = width - 2 * pointRadius;
    const baseHeight = height / 2; // Le milieu du canvas

    dataSet.forEach((val, i) => {
        const x = pointRadius + (i / (barsCount - 1)) * effectiveWidth;
        const y1 = baseHeight;
        const y2 = isUpperHalf 
            ? baseHeight - val * amplifier
            : baseHeight + val * amplifier; // Symétrie pour la partie inférieure
        points.push({ x, y1, y2, value: val });
    });

    return points;
};

// Générer les points pour différentes couches
const generatePoints = (data) => {
    return generateCirclePoints(data, width, height, barsCount, amplifier, pointRadius);
};

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

const AudioSoundScapeStereo = ({ dataFrequencyLeft, dataFrequencyRight }) => {
    const stageRef = useRef(null);
    // Première groupe
    const barsCount = 130;
    const history = 40;
    const pointRadius = 1.4; // le rayon des points ici

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


    const createInitialState = () => {
        return Array(history).fill().map(() => 
          Array(barsCount).fill().map(() => 0)
        );
    };
    // État pour stocker les données précédentes
    const [previousDataLeft, setPreviousDataLeft] = useState(createInitialState);  // un tableau de tableaux remplis de 0
    const [previousDataRight, setPreviousDataRight] = useState(createInitialState);

    // Générer les données actuelles
    // Premier groupe
    const dataLeftCurrent = transformArray(movingAverage(dataFrequencyLeft, 40), 10, 1700, barsCount, "normal");  // max 2048
    const dataRightCurrent = transformArray(movingAverage(dataFrequencyRight, 40), 10, 1700, barsCount, "normal"); // max 2048
    
    // Mettre à jour l'état des données précédentes 
    useEffect(() => {
        // setPreviousDataLeft(prev => [...prev.slice(-history), dataLeftCurrent]);
        // setPreviousDataRight(prev => [...prev.slice(-history), dataRightCurrent]);
        setPreviousDataLeft(prev => [dataLeftCurrent, ...prev.slice(0, history - 1)]);
        setPreviousDataRight(prev => [dataRightCurrent, ...prev.slice(0, history - 1)]);
    }, [dataFrequencyLeft, dataFrequencyRight]);


    const getDataPairs = (currentData, previousDataArray) => {
        // Créer un nouveau tableau avec les données actuelles en premier
        const result = [currentData];
    
        // Ajouter les données historiques
        result.push(...previousDataArray);
    
        // Limiter le nombre total de tableaux à 'history'
        return result.slice(0, history);
    };

    // Données à utiliser pour générer les points 
    const dataLeftProcessed = getDataPairs(dataLeftCurrent, previousDataLeft)
    const dataRightProcessed = getDataPairs(dataRightCurrent, previousDataRight)
    
    // Générer les points pour dataLaftProcessed[0]
    const amplifier = height / 300; // 160 ? Ajustez cette valeur pour contrôler l'amplitude verticale
    const borderWidth = 1; // Épaisseur de la bordure

    const generateHistoricalPoints = (dataProcessedLeft, dataProcessedRight, count, generatePoints, width, height, barsCount, amplifier, pointRadius) => {
        const historicalPointsLeft = [];
        const historicalPointsRight = [];
        for (let i = 0; i < count; i++) {
            const pointsLeft = generatePoints(dataProcessedLeft[i], width, height, barsCount, amplifier, pointRadius, true);
            const pointsRight = generatePoints(dataProcessedRight[i], width, height, barsCount, amplifier, pointRadius, false);
            
            const offset = i * 7;
            const opacity = Math.max(0, 1 - (i * 0.025));
            
            historicalPointsLeft.push({ points: pointsLeft, offset, opacity });
            historicalPointsRight.push({ points: pointsRight, offset, opacity }); // Même offset pour le canal droit
        }
        return { left: historicalPointsLeft, right: historicalPointsRight };
    };
    
    const linePointsLeft = generateLinePoints(dataLeftProcessed[0], width, height, barsCount, amplifier, pointRadius, true);
    const linePointsRight = generateLinePoints(dataRightProcessed[0], width, height, barsCount, amplifier, pointRadius, false);
    const pointsCurrentLeft = generateCirclePoints(dataLeftProcessed[0], width, height, barsCount, amplifier, pointRadius, true);
    const pointsCurrentRight = generateCirclePoints(dataRightProcessed[0], width, height, barsCount, amplifier, pointRadius, false);
    
    // Utilisation :
    const historicalPoints = generateHistoricalPoints(dataLeftProcessed, dataRightProcessed, 35, generateCirclePoints, width, height, barsCount, amplifier, pointRadius);    
    
    return (
        <>
            <CanvasContainer ref={stageRef}>
                <Stage width={width} height={height}>
                    <Layer>
                        {/* Rectangle pour la bordure */}
                        <Rect
                            x={borderWidth / 2}
                            y={borderWidth / 2}
                            width={width - borderWidth}
                            height={height - borderWidth}
                            stroke="rgba(255,255,255,0)"
                            strokeWidth={borderWidth}
                        />
                    </Layer>
                                        
                    {/* Couches historiques gauche */}
                    {historicalPoints.left.map((layer, layerIndex) => (
                        <Layer key={`layer-left-${layerIndex}`}>
                            {layer.points.map((point, index) => (
                                <Circle 
                                    key={`point-left-${layerIndex}-${index}`}
                                    x={point.x}
                                    y={point.y - layer.offset}
                                    radius={pointRadius}
                                    fill={generateHslaColor(260, 450, point.value, 1)}
                                    opacity={layer.opacity}
                                />
                            ))}
                        </Layer>
                    ))}
                    {/* Couches historiques droite */}
                    {historicalPoints.right.map((layer, layerIndex) => (
                        <Layer key={`layer-right-${layerIndex}`}>
                            {layer.points.map((point, index) => (
                                <Circle 
                                    key={`point-right-${layerIndex}-${index}`}
                                    x={point.x}
                                    y={point.y + layer.offset} // Notez le + ici pour la symétrie
                                    radius={pointRadius}
                                    fill={generateHslaColor(260, 450, point.value, 1)}
                                    opacity={layer.opacity}
                                />
                            ))}
                        </Layer>
                    ))}


                    {/* Couche de lignes */}
                    <Layer>
                        {linePointsLeft.map((point, index) => (
                            <Line
                                key={`line-${index}`}
                                points={[point.x, point.y1, point.x, point.y2]}
                                stroke={"#000"}
                                strokeWidth={pointRadius * 2}
                            />
                        ))}
                    </Layer>
                    {/* Couche de lignes */}
                    <Layer>
                        {linePointsRight.map((point, index) => (
                            <Line
                                key={`line-${index}`}
                                points={[point.x, point.y1, point.x, point.y2]}
                                stroke={"#000"}
                                strokeWidth={pointRadius * 2}
                            />
                        ))}
                    </Layer>

                    {/* Couche actuelle */}
                    <Layer>
                        {pointsCurrentLeft.map((point, index) => (
                            <Circle 
                                key={`current-${index}`}
                                x={point.x}
                                y={point.y}
                                radius={pointRadius}
                                fill={generateHslaColor(260, 400, point.value, 1)}
                                opacity={1}
                            />
                        ))}
                    </Layer>

                    {/* Couche actuelle */}
                    <Layer>
                        {pointsCurrentRight.map((point, index) => (
                            <Circle 
                                key={`current-${index}`}
                                x={point.x}
                                y={point.y}
                                radius={pointRadius}
                                fill={generateHslaColor(260, 400, point.value, 1)}
                                opacity={1}
                            />
                        ))}
                    </Layer>

                    

                </Stage>
            </CanvasContainer>
        </>
    );
};

AudioSoundScapeStereo.propTypes = {
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
`;

export default AudioSoundScapeStereo;