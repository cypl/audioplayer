import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colorsUI } from '../utils/UI';
import { sumThisArray, reduceSizeArray } from '../utils/arrayUtils';

const barWidth = (bar) => {
    if (bar === 0) return 0.01 + "%"
    return (bar / 256) // 256 correspond à la valeur maximal d'un élément du tableau
}
// const progressiveOpacity = (bar) => {
//     if (bar === 0) return 0
//     if (bar > 0 && bar < 25) return 0.2
//     if (bar > 25 && bar < 75) return 0.4
//     if (bar > 75 && bar < 125) return 0.6
//     if (bar > 125 && bar < 175) return 0.75
//     if (bar > 175 && bar < 225) return 0.85
//     if (bar > 225) return 1
// }
// const progressiveOpacity = (bar) => {
//     return Math.min(bar / 256, 1);
// }
const progressiveOpacity = (bar) => {
    if (bar <= 0) return 0;
    if (bar >= 256) return 1;
    const ranges = [
        { threshold: 25, value: 0.45 },
        { threshold: 75, value: 0.6 },
        { threshold: 125, value: 0.7 },
        { threshold: 175, value: 0.8 },
        { threshold: 225, value: 0.9 },
        { threshold: 256, value: 1 }  // Ajout du dernier seuil pour simplifier la logique
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

const dataFormat = (dataUint8Array, size, reverse) => {
    let result = Array.from(dataUint8Array).filter((element, index) => index < size); // on ne conserve que les valeurs comprise entre 0 et size
    return reverse ? result.reverse() : result
} 



// Define intensity of Sound based on stereo output
const intensityRatio = (array1, array2, maxValue) => { 
    // array1 length must be equal to array2 length
    // maxValue = arraylength * 256 * 2 (256 is the max value of an element, and 2 is beceause there is arrays)
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


function AudioVisualizer4({ dataFrequencyLeft, dataFrequencyRight }){

    let barsCount = 42
    const barsColor = useRef("")

    const barRefsLeftTop = useRef([])
    const lineRefsLeftTop = useRef([])
    const dotRefsLeftTop = useRef([])

    const barRefsLeftBottom = useRef([])
    const lineRefsLeftBottom = useRef([])
    const dotRefsLeftBottom = useRef([])

    const barRefsRightTop = useRef([])
    const lineRefsRightTop = useRef([])
    const dotRefsRightTop = useRef([])

    const barRefsRightBottom = useRef([])
    const lineRefsRightBottom = useRef([])
    const dotRefsRightBottom = useRef([])

    const [grid, setGrid] = useState(false)

    useEffect(() => {
        const dataLeftTop = dataFormat(reduceSizeArray(dataFrequencyLeft, barsCount *2), barsCount, true);
        const dataLeftBottom = dataFormat(reduceSizeArray(dataFrequencyLeft, barsCount *2), barsCount, false);
        const dataRightTop = dataFormat(reduceSizeArray(dataFrequencyRight, barsCount *2), barsCount, true);
        const dataRightBottom = dataFormat(reduceSizeArray(dataFrequencyRight, barsCount *2), barsCount, false);

        // Mettre à jour les styles des lignes et des points
        dataLeftTop.forEach((bar, index) => {
            if (lineRefsLeftTop.current[index] && dotRefsLeftTop.current[index]) {
                lineRefsLeftTop.current[index].style.transform = `scaleX(`+ barWidth(bar) + `) scaleY(1)`
                lineRefsLeftTop.current[index].style.opacity = progressiveOpacity(bar)
                dotRefsLeftTop.current[index].style.opacity = progressiveOpacity(bar) 
            }
        })
        dataLeftBottom.forEach((bar, index) => {
            if (lineRefsLeftBottom.current[index] && dotRefsLeftBottom.current[index]) {
                lineRefsLeftBottom.current[index].style.transform = `scaleX(`+ barWidth(bar) + `) scaleY(1)` 
                lineRefsLeftBottom.current[index].style.opacity = progressiveOpacity(bar)
                dotRefsLeftBottom.current[index].style.opacity = progressiveOpacity(bar) 
            }
        })
        dataRightTop.forEach((bar, index) => {
            if (lineRefsRightTop.current[index] && dotRefsRightTop.current[index]) {
                lineRefsRightTop.current[index].style.transform = `scaleX(`+ barWidth(bar) + `) scaleY(1)`
                lineRefsRightTop.current[index].style.opacity = progressiveOpacity(bar)
                dotRefsRightTop.current[index].style.opacity = progressiveOpacity(bar) 
            }
        })
        dataRightBottom.forEach((bar, index) => {
            if (lineRefsRightBottom.current[index] && dotRefsRightBottom.current[index]) {
                lineRefsRightBottom.current[index].style.transform = `scaleX(`+ barWidth(bar) + `) scaleY(1)`
                lineRefsRightBottom.current[index].style.opacity = progressiveOpacity(bar)
                dotRefsRightBottom.current[index].style.opacity = progressiveOpacity(bar) 
            }
        })

        let intensityOfSound = intensityRatio(dataLeftTop, dataRightTop, dataLeftTop.length * 256 * 2)
        barsColor.current = defineColorFromIntensityOfSound(arrayOfColors, intensityOfSound)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataFrequencyLeft, dataFrequencyRight]);

    const initBars = (barsCount, barRefs, lineRefs, dotRefs) => (
        Array.from({ length: barsCount }).map((_, index) => (
            <div className="bar-wrapper" key={index} ref={el => barRefs.current[index] = el}>
                <div className="bar-wrapper__line" ref={el => lineRefs.current[index] = el}>
                    <div className="bar-wrapper__dot" ref={el => dotRefs.current[index] = el}></div>
                </div>
            </div>
        ))
    )

    return( 
        <Visualizer>
            <VisualizerPart className='top left' barscolor={barsColor.current}>
                {initBars(barsCount, barRefsLeftTop, lineRefsLeftTop, dotRefsLeftTop)}
            </VisualizerPart>
            <VisualizerPart className='bottom left' barscolor={barsColor.current}>
                {initBars(barsCount, barRefsLeftBottom, lineRefsLeftBottom, dotRefsLeftBottom)}
            </VisualizerPart>
            <VisualizerPart className='top right' barscolor={barsColor.current}>
                {initBars(barsCount, barRefsRightTop, lineRefsRightTop, dotRefsRightTop)}
            </VisualizerPart>
            <VisualizerPart className='bottom right' barscolor={barsColor.current}>
                {initBars(barsCount, barRefsRightBottom, lineRefsRightBottom, dotRefsRightBottom)}
            </VisualizerPart>
            <VisualizerGridTrigger onClick={() => setGrid(!grid)}></VisualizerGridTrigger>
            {grid &&
                <VisualizerGrid>
                    <div className='grid-part top left'></div>
                    <div className='grid-part top right'></div>
                    <div className='grid-part bottom left'></div>
                    <div className='grid-part bottom right'></div>
                </VisualizerGrid>
            }
        </Visualizer>
    )
}

export default AudioVisualizer4

AudioVisualizer4.propTypes = {
    dataFrequencyLeft: PropTypes.object,
    dataFrequencyRight: PropTypes.object,
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
const VisualizerGridTrigger = styled.div`
    position:absolute;
    bottom:-2.3rem;
    left:-4.3rem;
    height:10px;
    width:10px;
    border-radius:100%;
    cursor:pointer;
    background-color:${colorsUI.border};
`
const VisualizerGrid = styled.div`
    position:absolute;
    width:100%;
    height:100%;
    border:1px solid ${colorsUI.border};
    & .grid-part{
        width:50%;
        height:50%;
        position:absolute;
        &.top{
            top:0;
            border-bottom:1px solid ${colorsUI.border};
        }
        &.bottom{
            top:50%;
        }
        &.left{
            left:0;
        }
        &.right{
            left:50%;
            border-left:1px solid ${colorsUI.border};
        }
    }
`
const VisualizerPart = styled.div`
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
                border-radius: 0.2vh;
                background-color: white;
                position: absolute;
                top: 0px;
                opacity:0;
                transition:0.01s opacity linear;
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
            }
        }
    }
`