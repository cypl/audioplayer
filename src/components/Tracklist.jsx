import PropTypes from 'prop-types'
import styled from 'styled-components'
import { GetData } from '../api'

const getMinutes = (seconds) => {
    return Math.round(seconds / 60)
}
const getSeconds = (seconds) => {
    const minutes = Math.round(seconds / 60)
    return seconds - (minutes * 60)
}

function Tracklist({audioSrc, setAudioSrc}){

    const tracklist = GetData("data/tracklist.json")
    const showTracklist = tracklist.dataFetched.length > 0 && !tracklist.isDataLoading && tracklist.isError == null
    const tracks = tracklist.dataFetched

    return(
        <>
            <TracksWrapper>
                {showTracklist &&
                    <>
                        {tracks.map((track) => (
                            <Track key={track.id} onClick={() => setAudioSrc(track.source)} className={audioSrc === track.source ? "active" : ""}>
                                <span>{track.artist} - {track.song} {getMinutes(track.duration)}:{getSeconds(track.duration)}</span>
                            </Track>
                        ))}
                    </>
                }
            </TracksWrapper>
        </>
    )
}

export default Tracklist

Tracklist.propTypes = {
    setAudioSrc: PropTypes.func,
    audioSrc: PropTypes.string,
}

const TracksWrapper = styled.div`
    width:20rem;
    background-color:#111;
    border-radius:0.3rem;
`
const Track = styled.p`
    padding:0.75rem 0.6rem;
    font-size:0.85rem;
    line-height:1;
    margin:0;
    cursor:pointer;
    border-bottom:1px solid rgba(255,255,255,0.1);
    text-align:left;
    color:rgba(255,255,255,0.6);
    &:last-child{
        border-bottom:0;
    }
    &.active{
        color:rgba(255,255,255,1);
    }
`