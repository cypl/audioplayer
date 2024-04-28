import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const barWidth = (bar) => {
    if (bar === 0) return 0.01 + "%"
    return (bar / 256)
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
        const dataLeftTop = dataFormat(dataFrequencyLeft, 32, true);
        const dataLeftBottom = dataFormat(dataFrequencyLeft, 32, false);
        const dataRightTop = dataFormat(dataFrequencyRight, 32, true);
        const dataRightBottom = dataFormat(dataFrequencyRight, 32, false);

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
    }, [dataFrequencyLeft, dataFrequencyRight]);

    const initBarsLeftTop = () => (
        Array.from({ length: 32 }).map((_, index) => (
            <div className="bar-wrapper" key={index} ref={el => barRefsLeftTop.current[index] = el}>
                <div className="bar-wrapper__line" ref={el => lineRefsLeftTop.current[index] = el}>
                    <div className="bar-wrapper__dot" ref={el => dotRefsLeftTop.current[index] = el}></div>
                </div>
            </div>
        ))
    );

    const initBarsLeftBottom = () => (
        Array.from({ length: 32 }).map((_, index) => (
            <div className="bar-wrapper" key={index} ref={el => barRefsLeftBottom.current[index] = el}>
                <div className="bar-wrapper__line" ref={el => lineRefsLeftBottom.current[index] = el}>
                    <div className="bar-wrapper__dot" ref={el => dotRefsLeftBottom.current[index] = el}></div>
                </div>
            </div>
        ))
    );

    const initBarsRightTop = () => (
        Array.from({ length: 32 }).map((_, index) => (
            <div className="bar-wrapper" key={index} ref={el => barRefsRightTop.current[index] = el}>
                <div className="bar-wrapper__line" ref={el => lineRefsRightTop.current[index] = el}>
                    <div className="bar-wrapper__dot" ref={el => dotRefsRightTop.current[index] = el}></div>
                </div>
            </div>
        ))
    );

    const initBarsRightBottom = () => (
        Array.from({ length: 32 }).map((_, index) => (
            <div className="bar-wrapper" key={index} ref={el => barRefsRightBottom.current[index] = el}>
                <div className="bar-wrapper__line" ref={el => lineRefsRightBottom.current[index] = el}>
                    <div className="bar-wrapper__dot" ref={el => dotRefsRightBottom.current[index] = el}></div>
                </div>
            </div>
        ))
    );


    return( 
        <Visualizer>
            <VisuLeft className='top'>
                {initBarsLeftTop()}
            </VisuLeft>
            <VisuLeft className='bottom'>
                {initBarsLeftBottom()}
            </VisuLeft>
            <VisuRight className='top'>
                {initBarsRightTop()}
            </VisuRight>
            <VisuRight className='bottom'>
                {initBarsRightBottom()}
            </VisuRight>
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
const VisuLeft = styled.div`
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
        justify-content:right;
        align-items:center;
    }
    & .bar-wrapper__line{
        height: 3px;
        position: relative;
        width: 100%;
        transform:scaleX(1) scaleY(1);
        transform-origin:top right;
        opacity:0;
        background: linear-gradient(90deg, rgba(255,0,0,0.5) 0%, rgba(255,0,0,0) 50%, rgba(255,0,0,0) 100%); 
        transition:0.03s transform linear, 0.03s opacity linear;
        & .bar-wrapper__dot{
            height: 3px;
            width: 5px;
            border-radius: 100%;
            background-color: white;
            position: absolute;
            left: 0px;
            top: 0px;
            opacity:0;
            transition:0.03s opacity linear;
        }   
    }
`

const VisuRight = styled.div`
    position:absolute;
    width:50%;
    height:50%;
    left:50%;
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
        justify-content:left;
        align-items:center;
    }
    & .bar-wrapper__line{
        height: 3px;
        position: relative;
        width: 100%;
        transform:scaleX(1) scaleY(1);
        transform-origin:top left;
        opacity:0;
        background: linear-gradient(90deg, rgba(255,0,0,0) 0%, rgba(255,0,0,0) 50%, rgba(255,0,0,0.5) 100%); 
        transition:0.03s transform linear, 0.03s opacity linear;
        & .bar-wrapper__dot{
            height: 3px;
            width: 5px;
            border-radius: 100%;
            background-color: white;
            position: absolute;
            right: 0px;
            top: 0px;
            opacity:0;
            transition:0.03s opacity linear;
        }   
    }
`