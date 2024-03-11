import PropTypes from 'prop-types'
import styled from 'styled-components'

function Volume({ volume, setVolume }){
    return(
        <Wrapper>
            <Mute onClick={() => setVolume(0)} className={volume === 0 && "muted"}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.72361 1.05279C7.893 1.13749 8 1.31062 8 1.5V13.5C8 13.6894 7.893 13.8625 7.72361 13.9472C7.55421 14.0319 7.35151 14.0136 7.2 13.9L3.33333 11H1.5C0.671573 11 0 10.3284 0 9.5V5.5C0 4.67158 0.671573 4 1.5 4H3.33333L7.2 1.1C7.35151 0.986371 7.55421 0.968093 7.72361 1.05279ZM7 2.5L3.8 4.9C3.71345 4.96491 3.60819 5 3.5 5H1.5C1.22386 5 1 5.22386 1 5.5V9.5C1 9.77614 1.22386 10 1.5 10H3.5C3.60819 10 3.71345 10.0351 3.8 10.1L7 12.5V2.5ZM14.8536 5.14645C15.0488 5.34171 15.0488 5.65829 14.8536 5.85355L13.2071 7.5L14.8536 9.14645C15.0488 9.34171 15.0488 9.65829 14.8536 9.85355C14.6583 10.0488 14.3417 10.0488 14.1464 9.85355L12.5 8.20711L10.8536 9.85355C10.6583 10.0488 10.3417 10.0488 10.1464 9.85355C9.95118 9.65829 9.95118 9.34171 10.1464 9.14645L11.7929 7.5L10.1464 5.85355C9.95118 5.65829 9.95118 5.34171 10.1464 5.14645C10.3417 4.95118 10.6583 4.95118 10.8536 5.14645L12.5 6.79289L14.1464 5.14645C14.3417 4.95118 14.6583 4.95118 14.8536 5.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </Mute>
            <Range>
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))}></input>
                <span className="bar-volume">
                    <span className="bar-volume--bg">
                        <span className="bar-volume--data" style={{width: volume*100 + "%"}}></span>
                    </span>
                </span>
            </Range>
            <Indicator>
                {
                    volume > 0.8 &&
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.46968 1.05085C7.64122 1.13475 7.75 1.30904 7.75 1.5V13.5C7.75 13.691 7.64122 13.8653 7.46968 13.9492C7.29813 14.0331 7.09377 14.0119 6.94303 13.8947L3.2213 11H1.5C0.671571 11 0 10.3284 0 9.5V5.5C0 4.67158 0.671573 4 1.5 4H3.2213L6.94303 1.10533C7.09377 0.988085 7.29813 0.966945 7.46968 1.05085ZM6.75 2.52232L3.69983 4.89468C3.61206 4.96294 3.50405 5 3.39286 5H1.5C1.22386 5 1 5.22386 1 5.5V9.5C1 9.77615 1.22386 10 1.5 10H3.39286C3.50405 10 3.61206 10.0371 3.69983 10.1053L6.75 12.4777V2.52232ZM10.2784 3.84804C10.4623 3.72567 10.7106 3.77557 10.833 3.95949C12.2558 6.09798 12.2558 8.90199 10.833 11.0405C10.7106 11.2244 10.4623 11.2743 10.2784 11.1519C10.0944 11.0296 10.0445 10.7813 10.1669 10.5973C11.4111 8.72728 11.4111 6.27269 10.1669 4.40264C10.0445 4.21871 10.0944 3.97041 10.2784 3.84804ZM12.6785 1.43044C12.5356 1.2619 12.2832 1.24104 12.1147 1.38386C11.9462 1.52667 11.9253 1.77908 12.0681 1.94762C14.7773 5.14488 14.7773 9.85513 12.0681 13.0524C11.9253 13.2209 11.9462 13.4733 12.1147 13.6161C12.2832 13.759 12.5356 13.7381 12.6785 13.5696C15.6406 10.0739 15.6406 4.92612 12.6785 1.43044Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                }
                {
                    volume <= 0.8 && volume >= 0.3 &&
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1.5C8 1.31062 7.893 1.13749 7.72361 1.05279C7.55421 0.968093 7.35151 0.986371 7.2 1.1L3.33333 4H1.5C0.671573 4 0 4.67158 0 5.5V9.5C0 10.3284 0.671573 11 1.5 11H3.33333L7.2 13.9C7.35151 14.0136 7.55421 14.0319 7.72361 13.9472C7.893 13.8625 8 13.6894 8 13.5V1.5ZM3.8 4.9L7 2.5V12.5L3.8 10.1C3.71345 10.0351 3.60819 10 3.5 10H1.5C1.22386 10 1 9.77614 1 9.5V5.5C1 5.22386 1.22386 5 1.5 5H3.5C3.60819 5 3.71345 4.96491 3.8 4.9ZM10.833 3.95949C10.7106 3.77557 10.4623 3.72567 10.2784 3.84804C10.0944 3.97041 10.0445 4.21871 10.1669 4.40264C11.4111 6.27268 11.4111 8.72728 10.1669 10.5973C10.0445 10.7813 10.0944 11.0296 10.2784 11.1519C10.4623 11.2743 10.7106 11.2244 10.833 11.0405C12.2558 8.90199 12.2558 6.09798 10.833 3.95949Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                }
                {
                    volume < 0.3 && 
                    <svg width="15" className={volume == 0 ? "muted" : ""} height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1.5C8 1.31062 7.893 1.13749 7.72361 1.05279C7.55421 0.968093 7.35151 0.986371 7.2 1.1L3.33333 4H1.5C0.671573 4 0 4.67158 0 5.5V9.5C0 10.3284 0.671573 11 1.5 11H3.33333L7.2 13.9C7.35151 14.0136 7.55421 14.0319 7.72361 13.9472C7.893 13.8625 8 13.6894 8 13.5V1.5ZM3.8 4.9L7 2.5V12.5L3.8 10.1C3.71345 10.0351 3.60819 10 3.5 10H1.5C1.22386 10 1 9.77614 1 9.5V5.5C1 5.22386 1.22386 5 1.5 5H3.5C3.60819 5 3.71345 4.96491 3.8 4.9ZM10.083 5.05577C9.96066 4.87185 9.71235 4.82195 9.52843 4.94432C9.3445 5.06669 9.2946 5.31499 9.41697 5.49892C10.2207 6.70693 10.2207 8.29303 9.41697 9.50104C9.2946 9.68496 9.3445 9.93326 9.52843 10.0556C9.71235 10.178 9.96066 10.1281 10.083 9.94418C11.0653 8.46773 11.0653 6.53222 10.083 5.05577Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                }
            </Indicator>
        </Wrapper>
    )
}

export default Volume

Volume.propTypes = {
    volume: PropTypes.number,
    setVolume: PropTypes.func,
}

const Wrapper = styled.div`
    width:14rem;
    margin:2rem auto;
    display:flex;
    display:none;
`
const Mute = styled.div`
    height:1rem;
    width:1rem;
    cursor:pointer;
    display:flex;
    & svg{
        height:1rem;
        color:#fff;
        opacity:0.3;
        transition:0.1s opacity ease-in-out;
    }
    &:hover{
        & svg{
            opacity:1;
            transition:0.1s opacity ease-in-out;
        }
    }
    &.muted{
        & svg{
            opacity:1;
            transition:0.1s opacity ease-in-out;
        }
    }
`
const Indicator = styled.div`
    height:1rem;
    width:1rem;
    display:flex;
    & svg{
        height:1rem;
        &.muted{
            opacity:0.3;
        }
    }
`
const Range = styled.span`
    position:relative;
    width:calc(14rem - 2rem);
    & input{
        width:calc(100% - 1rem);
        margin:auto;
        display:block;
        height:1rem;
        position:relative;
        z-index:1;
        opacity:0;
    }
    & .bar-volume{
        position:absolute;
        height:1rem;
        width:100%;
        top:0;
        left:0;
        display:flex;
        align-items:center;
        justify-content:center;
        & .bar-volume--bg{
            position:absolute;
            height:0.4rem;
            width:calc(100% - 1rem);
            border-radius:0.2rem;
            background-color:rgba(255,255,255,0.2);
            overflow:hidden;
            & .bar-volume--data{
                position:absolute;
                height:0.4rem;
                left:0;
                top:0;
                background-color:rgba(255,255,255,1);
            }
        }
    }
`