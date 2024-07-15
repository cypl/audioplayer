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
function generateCirclePoints(dataSet, width, height, barsCount, amplifier, pointRadius) {
    const points = [];
    const baseHeight = height - pointRadius; // Ajuster pour le rayon du point
    const effectiveWidth = width - 2 * pointRadius; // Largeur effective pour les points

    dataSet.forEach((val, i) => {
        const x = pointRadius + (i / (barsCount - 1)) * effectiveWidth; // Ajuster pour le rayon du point
        const y = Math.max(pointRadius, Math.min(baseHeight - val * amplifier, baseHeight)); // Limiter y entre pointRadius et baseHeight
        points.push({ x, y, value: val });
    });

    return points;
}

const generateLinePoints = (dataSet, width, height, barsCount, amplifier, pointRadius) => {
    const points = [];
    const effectiveWidth = width - 2 * pointRadius;

    dataSet.forEach((val, i) => {
        const x = pointRadius + (i / (barsCount - 1)) * effectiveWidth;
        const y1 = height; // Point de départ en bas
        const y2 = Math.max(pointRadius, Math.min(height - val * amplifier, height)); // Point d'arrivée, même calcul que pour les cercles
        points.push({ x, y1, y2, value: val });
    });

    return points;
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

const AudioSoundScape = ({ dataFrequencyLeft, dataFrequencyRight }) => {
    const stageRef = useRef(null);
    // Première groupe
    const barsCount = 150;
    const history = 81;
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
    const dataLeftCurrent = transformArray(movingAverage(dataFrequencyLeft, 60), 10, 1850, barsCount, "normal");  // max 2048
    const dataRightCurrent = transformArray(movingAverage(dataFrequencyRight, 60), 10, 1850, barsCount, "reverse"); // max 2048
    
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
    const amplifier = height / 350; // 160 ? Ajustez cette valeur pour contrôler l'amplitude verticale
    const borderWidth = 1; // Épaisseur de la bordure

    // Générer les points pour différentes couches
    const generatePoints = (data) => {
        return generateCirclePoints(data, width, height, barsCount, amplifier, pointRadius);
    };

    const linePoints = generateLinePoints(dataLeftProcessed[0], width, height, barsCount, amplifier, pointRadius);
    const pointsCurrent = generatePoints(dataLeftProcessed[0]);
    // const pointsPrev1 = generatePoints(dataLeftProcessed[2]);
    // const pointsPrev2 = generatePoints(dataLeftProcessed[4]);
    // const pointsPrev3 = generatePoints(dataLeftProcessed[6]);
    // const pointsPrev4 = generatePoints(dataLeftProcessed[8]);
    // const pointsPrev5 = generatePoints(dataLeftProcessed[10]);
    // const pointsPrev6 = generatePoints(dataLeftProcessed[12]);
    // const pointsPrev7 = generatePoints(dataLeftProcessed[14]);
    // const pointsPrev8 = generatePoints(dataLeftProcessed[16]);
    // const pointsPrev9 = generatePoints(dataLeftProcessed[18]);
    // const pointsPrev10 = generatePoints(dataLeftProcessed[20]);
    // const pointsPrev11 = generatePoints(dataLeftProcessed[22]);
    // const pointsPrev12 = generatePoints(dataLeftProcessed[24]);
    // const pointsPrev13 = generatePoints(dataLeftProcessed[26]);
    // const pointsPrev14 = generatePoints(dataLeftProcessed[28]);
    // const pointsPrev15 = generatePoints(dataLeftProcessed[30]);
    // const pointsPrev16 = generatePoints(dataLeftProcessed[32]);
    // const pointsPrev17 = generatePoints(dataLeftProcessed[34]);
    // const pointsPrev18 = generatePoints(dataLeftProcessed[36]);
    // const pointsPrev19 = generatePoints(dataLeftProcessed[38]);
    // const pointsPrev20 = generatePoints(dataLeftProcessed[40]);

    const generateHistoricalPoints = (dataProcessed, count, generatePoints, width, height, barsCount, amplifier, pointRadius) => {
        const historicalPoints = [];
        for (let i = 0; i < count; i++) {
            // Utiliser un pas plus petit pour rapprocher les historiques
            const points = generatePoints(dataProcessed[i], width, height, barsCount, amplifier, pointRadius);
            
            // Ajuster l'offset pour un espacement plus serré
            const offset = i * 7; 
            
            // Ajuster l'opacité pour qu'elle décroisse de manière plus graduelle
            const opacity = Math.max(0, 1 - (i * 0.025)); // 0.025 au lieu de 0.045 pour une décroissance plus lente
            
            historicalPoints.push({ points, offset, opacity });
        }
        return historicalPoints;
    };
    
    // Utilisation :
    const historicalPoints = generateHistoricalPoints(dataLeftProcessed, 35, generatePoints, width, height, barsCount, amplifier, pointRadius);
    
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
                                        
                    
                    {/* Couches historiques */}
                    {historicalPoints.map((layer, layerIndex) => (
                        <Layer key={`layer-${layerIndex}`}>
                            {layer.points.map((point, index) => (
                                <Circle 
                                    key={`point-${layerIndex}-${index}`}
                                    x={point.x}
                                    y={point.y - layer.offset}
                                    radius={pointRadius}
                                    fill={generateHslaColor(260, 450, point.value, 1)}
                                    opacity={layer.opacity}
                                />
                            ))}
                        </Layer>
                    ))}

                    {/* Couche actuelle */}
                    <Layer>
                        {pointsCurrent.map((point, index) => (
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

                    {/* Couche de lignes */}
                    <Layer>
                        {linePoints.map((point, index) => (
                            <Line
                                key={`line-${index}`}
                                points={[point.x, point.y1, point.x, point.y2]}
                                stroke={"#000"}
                                strokeWidth={pointRadius * 2}
                            />
                        ))}
                    </Layer>

                </Stage>
            </CanvasContainer>
        </>
    );
};

AudioSoundScape.propTypes = {
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

export default AudioSoundScape;
