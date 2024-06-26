import { formatDuration } from "../utils/formatDuration";
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { sizesUI } from "../utils/UI";


function TimeControler({currentTime, duration, control}){
    return(
        <TimeControllerWrapper>
            <TimeControllerChrono className="current">{duration ? formatDuration(currentTime) : "-:--"}</TimeControllerChrono>
            <TimeControllerBar>
                <div className="bar-wrapper">
                    <div className="bar-wrapper-progression" style={{width: duration ? currentTime/duration*100 + "%" : "0%"}}></div>
                </div>
                <input type="range" min="0" max={duration} value={currentTime} onChange={control} />
            </TimeControllerBar>
            <TimeControllerChrono className="total-duration">{duration ? "-" + formatDuration(duration - currentTime) : "-:--"}</TimeControllerChrono>
        </TimeControllerWrapper>
    )
}

export default TimeControler


TimeControler.propTypes = {
    currentTime: PropTypes.number,
    duration: PropTypes.number,
    control: PropTypes.func,
}

const TimeControllerWrapper = styled.div`
    display:flex;
    padding:0.6rem 0;
`
const TimeControllerBar = styled.div`
    width:calc(100% - 5rem);
    height:2rem;
    position:relative;
    display:flex;
    align-items:center;
    & input{
        height:2rem;
        width:100%;
        line-height:2rem;
        margin:0;
        opacity:0;
        cursor:pointer;
    }
    & .bar-wrapper{
        height:0.2rem;
        width:100%;
        background-color:rgba(255,255,255,0.2);
        position:absolute;
        border-radius:0.2rem;
        & .bar-wrapper-progression{
            position:absolute;
            top:0;
            height:100%;
            width:50%;
            background-color:rgba(255,255,255,1);
            border-radius:0.2rem;
            &::after{
                content:"";
                position:absolute;
                display:block;
                width:0.5rem;
                height:0.5rem;
                border-radius:50%;
                right:0;
                background-color:rgba(255,255,255,1);
                top:50%;
                transform:translate(50%,-50%);
            }
        }
    }
`
const TimeControllerChrono = styled.p`
    width:2.5rem;
    text-align:center;
    font-size:${sizesUI.textSmall};
    line-height:2rem;
    margin:0;
    &.current{
        text-align:right;
        padding-right:0.5rem;
    }
    &.total-duration{
        text-align:left;
        padding-left:0.5rem;
    }
`