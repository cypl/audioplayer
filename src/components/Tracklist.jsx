import PropTypes from 'prop-types'
import styled from 'styled-components'

// const getMinutes = (seconds) => {
//     return Math.round(seconds / 60)
// }
// const getSeconds = (seconds) => {
//     const minutes = Math.round(seconds / 60)
//     return seconds - (minutes * 60)
// }

function Tracklist({data, audioSrc, launchTrack}){

    const showTracklist = data.dataFetched.length > 0 && !data.isDataLoading && data.isError == null
    const tracks = data.dataFetched

    return(
        <>
            <TracksWrapper>
                {showTracklist ?
                    <>
                        {tracks.map((track) => (
                            <Track key={track.id} onClick={() => launchTrack(track.source)} className={audioSrc === track.source ? "active" : ""}>
                                <span>{track.artist} - {track.song}</span>
                            </Track>
                        ))}
                    </>
                    :
                    <>
                        <Track>En cours de chargement...</Track>
                    </>
                }
            </TracksWrapper>
        </>
    )
}

export default Tracklist

Tracklist.propTypes = {
    data: PropTypes.object,
    audioSrc: PropTypes.string,
    launchTrack: PropTypes.func,
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