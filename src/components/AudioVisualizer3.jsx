//import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const barWidth = (bar) => {
    if (bar === 0) return 0.01 + "%"
    return (bar / 256 * 100) + "%"
}
const dotOpacity = (bar) => {
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

function AudioVisualizer3({ dataFrequencyLeft, dataFrequencyRight }){
   
    // These are the formatted data, used for graphics generation
    var dataLeftTop = dataFormat(dataFrequencyLeft, 200, true) 
    var dataLeftBottom = dataFormat(dataFrequencyLeft, 200, false) 
    var dataRightTop = dataFormat(dataFrequencyRight,200, true)
    var dataRightBottom = dataFormat(dataFrequencyRight,200, false)
    
    return( 
        <Visualizer>
            <VisuLeft className='top'>
                {dataLeftTop.length ?
                    <>
                        {dataLeftTop.map((bar, index) => (
                            <div className="bar-wrapper" key={index} style={{height:"1px"}}>
                                <div className="bar-wrapper__line" style={{height:"1px", width:barWidth(bar), position:"relative"}}>
                                    <div style={{height:"4px", width:"4px", borderRadius:"100%", backgroundColor:"white", marginTop:"-2px",marginLeft:"-2px", opacity:dotOpacity(bar)}}></div>
                                </div>
                            </div>
                        ))}
                    </>
                : <></>}
            </VisuLeft>
            <VisuLeft className='bottom'>
                {dataLeftBottom.length ?
                    <>
                        {dataLeftBottom.map((bar, index) => (
                            <div className="bar-wrapper" key={index} style={{height:"1px"}}>
                                <div className="bar-wrapper__line" style={{height:"1px", width:barWidth(bar), position:"relative"}}>
                                    <div style={{height:"4px", width:"4px", borderRadius:"100%", backgroundColor:"white", marginTop:"-2px",marginLeft:"-2px", opacity:dotOpacity(bar)}}></div>
                                </div>
                            </div>
                        ))}
                    </>
                : <></>}
            </VisuLeft>
            <VisuRight className='top'>
                {dataRightTop.length ?
                    <>
                        {dataRightTop.map((bar, index) => (
                            <div className="bar-wrapper" key={index} style={{height:"1px"}}>
                                <div className="bar-wrapper__line" style={{height:"1px", width:barWidth(bar), position:"relative"}}>
                                    <div style={{position:"absolute", right:'-2px', height:"4px", width:"4px", borderRadius:"100%", backgroundColor:"white", marginTop:"-2px", opacity:dotOpacity(bar)}}></div>
                                </div>
                            </div>
                        ))}
                    </>
                : <></>}
            </VisuRight>
            <VisuRight className='bottom'>
                {dataRightBottom.length ?
                    <>
                        {dataRightBottom.map((bar, index) => (
                            <div className="bar-wrapper" key={index} style={{height:"1px"}}>
                                <div className="bar-wrapper__line" style={{height:"1px", width:barWidth(bar), position:"relative"}}>
                                    <div style={{position:"absolute", right:'-2px', height:"4px", width:"4px", borderRadius:"100%", backgroundColor:"white", marginTop:"-2px", opacity:dotOpacity(bar)}}></div>
                                </div>
                            </div>
                        ))}
                    </>
                : <></>}
            </VisuRight>
        </Visualizer>
    )
}

export default AudioVisualizer3

AudioVisualizer3.propTypes = {
    dataFrequencyLeft: PropTypes.object,
    dataFrequencyRight: PropTypes.object,
}

const Visualizer = styled.div`
    position:absolute;
    width:calc(100vw - 6rem);
    height:calc(100vh - 6rem);
    background-color:black;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    z-index:-1;
    display:flex;
    flex-wrap: nowrap;
    justify-content:right;
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
        background: linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0) 100%); 
    }
`
const VisuRight = styled.div`
    position:absolute;
    width:50%;
    height:50%;
    right:0%;
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
        background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%); 
    }
`