import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { sumThisArray, reduceSizeArray } from '../utils/arrayUtils';
import Grid from './Grid';


const progressiveOpacity = (bar) => {
    if (bar <= 0) return 0;
    if (bar >= 100) return 1;
    const ranges = [
        { threshold: 5, value: 0.5 },
        { threshold: 25, value: 0.6 },
        { threshold: 50, value: 0.7 },
        { threshold: 70, value: 0.8 },
        { threshold: 85, value: 0.9 },
        { threshold: 100, value: 1 }  // Ajout du dernier seuil pour simplifier la logique
    ];

    for (let i = 0; i < ranges.length - 1; i++) {
        if (bar <= ranges[i].threshold) {
            let previousThreshold = (i === 0) ? 0 : ranges[i - 1].threshold;
            let previousValue = (i === 0) ? 0 : ranges[i - 1].value;
            // Interpolation linéaire entre les seuils
            return previousValue + (bar - previousThreshold) * (ranges[i].value - previousValue) / (ranges[i].threshold - previousThreshold);
        }
    }
}

// const dataFormat = (dataUint8Array, size, reverse) => {
//     let result = Array.from(dataUint8Array).filter((element, index) => index < size); // on ne conserve que les valeurs comprise entre 0 et size
//     return reverse ? result.reverse() : result
// } 

const dataFormat2 = (dataUint8Array, size, reverse) => {
    let result = Array.from(dataUint8Array).map(transformTo100).filter((element, index) => index < size);
    return reverse ? result.reverse() : result
} 
function transformTo100(value) {
    return (value / 256) * 100;
}



// Define intensity of Sound based on stereo output
const intensityRatio = (array1, array2, maxValue) => { 
    // array1 length must be equal to array2 length
    // maxValue = arraylength * 256 * 2 (256 is the max value of an element, and 2 is because there is 2 arrays)
    let arraysSum = sumThisArray(array1) + sumThisArray(array2)
    return arraysSum / maxValue // from 0 to 1
}
// Define a color based on sound intensity
const defineColorFromIntensityOfSound = (colors, intensity) => { // colors is an sarray of 10 values
    if(intensity >= 0 && intensity <= 0.1){ return colors[0]}
    if(intensity > 0.1 && intensity <= 0.2){ return colors[1]}
    if(intensity > 0.2 && intensity <= 0.3){ return colors[2]}
    if(intensity > 0.3 && intensity <= 0.4){ return colors[3]}
    if(intensity > 0.4 && intensity <= 0.5){ return colors[4]}
    if(intensity > 0.5 && intensity <= 0.6){ return colors[5]}
    if(intensity > 0.6 && intensity <= 0.7){ return colors[6]}
    if(intensity > 0.7 && intensity <= 0.8){ return colors[7]}
    if(intensity > 0.8 && intensity <= 0.9){ return colors[8]}
    if(intensity > 0.9 && intensity <= 0.95){ return colors[9]}
}
const arrayOfColors = [
    "114, 71, 223",
    "135, 60, 221",
    "158, 38, 213",
    "183, 32, 165",
    "196, 35, 81",
    "196, 35, 81",
    "196, 35, 81",
    "196, 35, 81",
    "196, 35, 81",
    "196, 35, 81",
]

const getTranslateVariation = (current, previous, maxRatio, sizeVw, side) => {
    let ratio = current / previous
    if (ratio > 1) {
        // Plus on est proche de maxRatio et plus la valeur retournée doit être proche de "sizeVw"
        // Au-delà de maxRatio, la valeur retournée est forcément de "sizeVw"
        if (ratio >= maxRatio) {
            // return `-${sizeVw}vw`
            return side === "left" ? `-${sizeVw}vw` : `${sizeVw}vw`
        } else {
            // Interpolation entre 1 et maxRatio, de 0vw à sizeVw
            let interpolatedValue = sizeVw * (ratio - 1) / (maxRatio - 1);
            //return `-${interpolatedValue}vw`;
            return side === "left" ? `-${interpolatedValue}vw` : `${interpolatedValue}vw`
        }
    } else if (ratio === 1) {
        // La valeur retournée est "0"
        return "0vw";
    } else {
        // Plus on est proche de 0 et plus la valeur retournée doit être proche de "sizeVw"
        // Interpolation entre 0 et 1, de sizeVw à 0vw
        let interpolatedValue = sizeVw * (1 - ratio)
        // return `${interpolatedValue}vw`
        return side === "left" ? `${interpolatedValue}vw` : `-${interpolatedValue}vw`

    }
}

// Fonction pour mettre à jour l'historique
function updateHistory(ref, newData) {
    ref.current.unshift(newData); // Ajoute au début
    if (ref.current.length > 10) {
        ref.current.pop(); // Supprime le dernier élément si la taille dépasse 5
    }
}

function AudioVisualizerParticles({ dataFrequencyLeft, dataFrequencyRight, showGrid }){

    let barsCount = 12
    const barsColor = useRef("")

    const barRefsLeftTop = useRef([])
    const lineRefsLeftTop = useRef([])
    const dotRefsLeftTop = useRef([])
    const dotVariationRefsLeftTop = useRef([])

    const barRefsLeftBottom = useRef([])
    const lineRefsLeftBottom = useRef([])
    const dotRefsLeftBottom = useRef([])
    const dotVariationRefsLeftBottom = useRef([])

    const barRefsRightTop = useRef([])
    const lineRefsRightTop = useRef([])
    const dotRefsRightTop = useRef([])
    const dotVariationRefsRightTop = useRef([])

    const barRefsRightBottom = useRef([])
    const lineRefsRightBottom = useRef([])
    const dotRefsRightBottom = useRef([])
    const dotVariationRefsRightBottom = useRef([])


    // Références pour stocker les historiques
    const historyDataLeftTop = useRef([]);
    const historyDataLeftBottom = useRef([]);
    const historyDataRightTop = useRef([]);
    const historyDataRightBottom = useRef([]);


    useEffect(() => {
        
        // données courantes
        const dataLeftTop = dataFormat2(reduceSizeArray(dataFrequencyLeft, barsCount *2), barsCount, true)
        const dataLeftBottom = dataFormat2(reduceSizeArray(dataFrequencyLeft, barsCount *2), barsCount, false)
        const dataRightTop = dataFormat2(reduceSizeArray(dataFrequencyRight, barsCount *2), barsCount, true)
        const dataRightBottom = dataFormat2(reduceSizeArray(dataFrequencyRight, barsCount *2), barsCount, false)

        // Mise à jour de l'historique en ajoutant les nouvelles données au début et en limitant à 5 éléments
        updateHistory(historyDataLeftTop, dataLeftTop);
        updateHistory(historyDataLeftBottom, dataLeftBottom);
        updateHistory(historyDataRightTop, dataRightTop);
        updateHistory(historyDataRightBottom, dataRightBottom);

        // Vérification que l'élément historique existe
        const selectedHistoricDataLeftTop = historyDataLeftTop.current[9] || new Array(42).fill(0); // Remplir de 0 si pas encore disponible
        const selectedHistoricDataLeftBottom = historyDataLeftBottom.current[9] || new Array(42).fill(0); // Remplir de 0 si pas encore disponible
        const selectedHistoricDataRightTop = historyDataRightTop.current[9] || new Array(42).fill(0); // Remplir de 0 si pas encore disponible
        const selectedHistoricDataRightBottom = historyDataRightBottom.current[9] || new Array(42).fill(0); // Remplir de 0 si pas encore disponible

        // Création de l'objet dataLeftTopPair avec des paires de données actuelles et historiques
        const dataLeftTopPair = dataLeftTop.map((currentValue, index) => {
            return [currentValue, selectedHistoricDataLeftTop[index]]; // Crée une paire pour chaque élément
        });
        const dataLeftBottomPair = dataLeftBottom.map((currentValue, index) => {
            return [currentValue, selectedHistoricDataLeftBottom[index]]; // Crée une paire pour chaque élément
        });
        const dataRightTopPair = dataRightTop.map((currentValue, index) => {
            return [currentValue, selectedHistoricDataRightTop[index]]; // Crée une paire pour chaque élément
        });
        const dataRightBottomPair = dataRightBottom.map((currentValue, index) => {
            return [currentValue, selectedHistoricDataRightBottom[index]]; // Crée une paire pour chaque élément
        });


        // Mettre à jour les styles des lignes et des points
        dataLeftTopPair.forEach((bar, index) => {
            if (lineRefsLeftTop.current[index] && dotRefsLeftTop.current[index]) {
                lineRefsLeftTop.current[index].style.transform = `scaleX(`+ bar[0] / 100 + `) scaleY(1)`
                lineRefsLeftTop.current[index].style.opacity = progressiveOpacity(bar[0])
                dotRefsLeftTop.current[index].style.opacity = progressiveOpacity(bar[0]) 
                dotVariationRefsLeftTop.current[index].style.opacity = progressiveOpacity(bar[0]) 
                dotVariationRefsLeftTop.current[index].style.transform = `translateX(` + getTranslateVariation(bar[0], bar[1], 1.5, 20, "left") + `)` 
            }
        })
        
        dataLeftBottomPair.forEach((bar, index) => {
            if (lineRefsLeftBottom.current[index] && dotRefsLeftBottom.current[index]) {
                lineRefsLeftBottom.current[index].style.transform = `scaleX(`+ bar[0] / 100  + `) scaleY(1)` 
                lineRefsLeftBottom.current[index].style.opacity = progressiveOpacity(bar[0])
                dotRefsLeftBottom.current[index].style.opacity = progressiveOpacity(bar[0]) 
                dotVariationRefsLeftBottom.current[index].style.opacity = progressiveOpacity(bar[0]) 
                dotVariationRefsLeftBottom.current[index].style.transform = `translateX(` + getTranslateVariation(bar[0], bar[1], 1.5, 20, "left") + `)` 
            }
        })
        dataRightTopPair.forEach((bar, index) => {
            if (lineRefsRightTop.current[index] && dotRefsRightTop.current[index]) {
                lineRefsRightTop.current[index].style.transform = `scaleX(`+ bar[0] / 100  + `) scaleY(1)`
                lineRefsRightTop.current[index].style.opacity = progressiveOpacity(bar[0])
                dotRefsRightTop.current[index].style.opacity = progressiveOpacity(bar[0]) 
                dotVariationRefsRightTop.current[index].style.opacity = progressiveOpacity(bar[0])
                dotVariationRefsRightTop.current[index].style.transform = `translateX(` + getTranslateVariation(bar[0], bar[1], 1.5, 20, "right") + `)` 
            }
        })
        dataRightBottomPair.forEach((bar, index) => {
            if (lineRefsRightBottom.current[index] && dotRefsRightBottom.current[index]) {
                lineRefsRightBottom.current[index].style.transform = `scaleX(`+ bar[0] / 100  + `) scaleY(1)`
                lineRefsRightBottom.current[index].style.opacity = progressiveOpacity(bar[0])
                dotRefsRightBottom.current[index].style.opacity = progressiveOpacity(bar[0]) 
                dotVariationRefsRightBottom.current[index].style.opacity = progressiveOpacity(bar[0])
                dotVariationRefsRightBottom.current[index].style.transform = `translateX(` + getTranslateVariation(bar[0], bar[1], 1.5, 20, "right") + `)` 
            }
        })

        // On définit l'intensité sonore globale (stéréo), pour permettre de modifier la couleur des barres en fonction
        let intensityOfSound = intensityRatio(dataLeftTop, dataRightTop, dataLeftTop.length * 100 * 2)
        barsColor.current = defineColorFromIntensityOfSound(arrayOfColors, intensityOfSound)
        
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataFrequencyLeft, dataFrequencyRight]);

    

    const initBars = (barsCount, barRefs, lineRefs, dotRefs, dotVariationRefs) => (
        Array.from({ length: barsCount }).map((_, index) => (
            <div className="bar-wrapper" key={index} ref={el => barRefs.current[index] = el}>
                <div className="bar-wrapper__line" ref={el => lineRefs.current[index] = el}>
                    <div className="bar-wrapper__dot" ref={el => dotRefs.current[index] = el}></div>
                    <div className="bar-wrapper__dot__variation" ref={el => dotVariationRefs.current[index] = el}></div>
                </div>
            </div>
        ))
    )
    return( 
        <Visualizer>
            <VisualizerPart className='top left' barscolor={barsColor.current}>
                {initBars(barsCount, barRefsLeftTop, lineRefsLeftTop, dotRefsLeftTop, dotVariationRefsLeftTop)}
            </VisualizerPart>
            <VisualizerPart className='bottom left' barscolor={barsColor.current}>
                {initBars(barsCount, barRefsLeftBottom, lineRefsLeftBottom, dotRefsLeftBottom, dotVariationRefsLeftBottom)}
            </VisualizerPart>
            <VisualizerPart className='top right' barscolor={barsColor.current}>
                {initBars(barsCount, barRefsRightTop, lineRefsRightTop, dotRefsRightTop, dotVariationRefsRightTop)}
            </VisualizerPart>
            <VisualizerPart className='bottom right' barscolor={barsColor.current}>
                {initBars(barsCount, barRefsRightBottom, lineRefsRightBottom, dotRefsRightBottom, dotVariationRefsRightBottom)}
            </VisualizerPart>
            {showGrid && <Grid/>}
        </Visualizer>
    )
}

export default AudioVisualizerParticles

AudioVisualizerParticles.propTypes = {
    dataFrequencyLeft: PropTypes.object,
    dataFrequencyRight: PropTypes.object,
    showGrid: PropTypes.bool,
}

const Visualizer = styled.div`
    position:absolute;
    width:calc(100vw - 10rem);
    height:calc(100vh - 6rem);
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    z-index:0;
`
const VisualizerPart = styled.div`
    overflow-x:hidden;
    position:absolute;
    width:50%;
    height:50%;
    left:0%;
    display:flex;
    flex-wrap: wrap;
    align-items:center;
    &.top{
        top:0;
    }
    &.bottom{
        bottom:0;
    }
    & .bar-wrapper{
        width:100%;
        display:flex;
        flex-wrap: wrap;
        align-items:center;
        & .bar-wrapper__line{
            height: 0.4vh;
            position: relative;
            width: 100%;
            border-radius: 0.2vh;
            transform:scaleX(1) scaleY(1);
            opacity:0;
            transition:0.01s transform linear, 0.01s opacity linear, , 0.01s background linear;
            & .bar-wrapper__dot{
                height: 0.4vh;
                width: 1vh;
                transform:scaleX(1) scaleY(1);
                border-radius: 0.2vh;
                background-color: white;
                position: absolute;
                top: 0px;
                opacity:0;
                transition:0.01s opacity linear;
            }
            & .bar-wrapper__dot__variation{
                height: 2vh;
                width: 15vw;
                transform:scaleX(1) scaleY(1);
                border-radius: 1vh;
                position: absolute;
                top: 50%;
                margin-top:-1vh;
                opacity:1;
                z-index:-1;
                transition:0.01s opacity linear, 0.01s transform linear;
            }
        }
    }
    &.left{
        & .bar-wrapper{
            justify-content:right;
            & .bar-wrapper__line{
                transform-origin:top right;
                background: ${props => `linear-gradient(90deg, rgba(${props.barscolor},1) 0%, rgba(${props.barscolor},0) 50%, rgba(${props.barscolor},0) 100%)`};
                & .bar-wrapper__dot{
                    left: 0px;
                }
                & .bar-wrapper__dot__variation{
                    left:0;
                    background: linear-gradient(90deg, rgba(87, 90, 255,1) 0%, rgba(87, 90, 255,0.2) 80%, rgba(87, 90, 255,0) 100%);
                } 
            }
        }
    }
    &.right{
        left:50%;
        & .bar-wrapper{
            justify-content:left;
            & .bar-wrapper__line{
                transform-origin:top left;
                background: ${props => `linear-gradient(90deg, rgba(${props.barscolor},0) 0%, rgba(${props.barscolor},0) 50%, rgba(${props.barscolor},1) 100%)`};
                & .bar-wrapper__dot{
                    right: 0px;
                }
                & .bar-wrapper__dot__variation{
                    right:0;
                    background: linear-gradient(90deg, rgba(87, 90, 255,0) 0%, rgba(87, 90, 255,0.2) 20%, rgba(87, 90, 255,1) 100%);
                }
            }
        }
    }
`