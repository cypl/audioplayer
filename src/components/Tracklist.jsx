import PropTypes from 'prop-types'
import styled from 'styled-components'
import { colorsUI, sizesUI } from '../utils/UI'
import { formatDuration } from '../utils/formatDuration'

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
                                <span>{formatDuration(track.duration)}</span>
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
    width:100%;
    background:${colorsUI.background};
    border-radius:${sizesUI.radius};
`
const Track = styled.p`
    padding:0.75rem 0.6rem;
    font-size:0.85rem;
    line-height:1;
    margin:0;
    cursor:pointer;
    border-bottom:1px solid ${colorsUI.border};
    text-align:left;
    color:${colorsUI.textInactive};
    display:flex;
    justify-content:space-between;
    &:last-child{
        border-bottom:0;
    }
    &.active{
        color:${colorsUI.textActive};
    }
`