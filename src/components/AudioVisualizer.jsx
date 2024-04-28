import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const barWidth = (bar) => {
    if (bar === 0) return 0.01 + "%"
    return (bar / 256) // 256 correspond à la valeur maximal d'un élément du tableau
}
const progressiveOpacity = (bar) => {
    if (bar === 0) return 0
    if (bar > 0 && bar < 25) return 0.2
    if (bar > 25 && bar < 75) return 0.4
    if (bar > 75 && bar < 125) return 0.6
    if (bar > 125 && bar < 175) return 0.75
    if (bar > 175 && bar < 225) return 0.85
    if (bar > 225) return 1
}
const dataFormat = (dataUint8Array, size, reverse) => {
    let result = Array.from(dataUint8Array).filter((element, index) => index < size); // on ne conserve que les valeurs comprise entre 0 et size
    return reverse ? result.reverse() : result
} 

// function reduceArray(originalArray, numberOfElements) {
//     const newArray = [];
//     const segmentSize = Math.floor(originalArray.length / numberOfElements);
    
//     for (let i = 0; i < numberOfElements; i++) {
//         // Calculer le début et la fin du segment
//         let start = i * segmentSize;
//         let end = start + segmentSize;

//         // Si on est au dernier segment, s'assurer d'inclure tous les éléments restants
//         if (i === numberOfElements - 1) {
//             end = originalArray.length;
//         }

//         // Extraire le segment et calculer la moyenne
//         const segment = originalArray.slice(start, end);
//         const average = segment.reduce((acc, val) => acc + val, 0) / segment.length;
        
//         // Ajouter la moyenne calculée au nouveau tableau
//         newArray.push(average);
//     }

//     return newArray;
// }

function AudioVisualizer4({ dataFrequencyLeft, dataFrequencyRight }){

    let barsCount = 32

    const barRefsLeftTop = useRef([]);
    const lineRefsLeftTop = useRef([]);
    const dotRefsLeftTop = useRef([]);

    const barRefsLeftBottom = useRef([]);
    const lineRefsLeftBottom = useRef([]);
    const dotRefsLeftBottom = useRef([]);

    const barRefsRightTop = useRef([]);
    const lineRefsRightTop = useRef([]);
    const dotRefsRightTop = useRef([]);

    const barRefsRightBottom = useRef([]);
    const lineRefsRightBottom = useRef([]);
    const dotRefsRightBottom = useRef([]);

    useEffect(() => {
        const dataLeftTop = dataFormat(dataFrequencyLeft, barsCount, true);
        const dataLeftBottom = dataFormat(dataFrequencyLeft, barsCount, false);
        const dataRightTop = dataFormat(dataFrequencyRight, barsCount, true);
        const dataRightBottom = dataFormat(dataFrequencyRight, barsCount, false);

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
            <VisualizerPart className='top left'>
                {initBars(barsCount, barRefsLeftTop, lineRefsLeftTop, dotRefsLeftTop)}
            </VisualizerPart>
            <VisualizerPart className='bottom left'>
                {initBars(barsCount, barRefsLeftBottom, lineRefsLeftBottom, dotRefsLeftBottom)}
            </VisualizerPart>
            <VisualizerPart className='top right'>
                {initBars(barsCount, barRefsRightTop, lineRefsRightTop, dotRefsRightTop)}
            </VisualizerPart>
            <VisualizerPart className='bottom right'>
                {initBars(barsCount, barRefsRightBottom, lineRefsRightBottom, dotRefsRightBottom)}
            </VisualizerPart>
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
    z-index:-1;
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
            height: 0.3vh;
            position: relative;
            width: 100%;
            transform:scaleX(1) scaleY(1);
            opacity:0;
            transition:0.03s transform linear, 0.03s opacity linear;
            & .bar-wrapper__dot{
                height: 0.3vh;
                width: 6px;
                border-radius: 100%;
                background-color: white;
                position: absolute;
                top: 0px;
                opacity:0;
                transition:0.03s opacity linear;
            } 
        }
    }
    &.left{
        & .bar-wrapper{
            justify-content:right;
            & .bar-wrapper__line{
                transform-origin:top right;
                background: linear-gradient(90deg, rgba(255,0,0,0.5) 0%, rgba(255,0,0,0) 50%, rgba(255,0,0,0) 100%);
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
                background: linear-gradient(90deg, rgba(255,0,0,0) 0%, rgba(255,0,0,0) 50%, rgba(255,0,0,0.5) 100%);
                & .bar-wrapper__dot{
                    right: 0px;
                }
            }
        }
    }
`