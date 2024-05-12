import styled from 'styled-components';
import { colorsUI } from '../utils/UI';

function Grid(){
    return(
        <VisualizerGrid>
            <div className='grid-part top left'></div>
            <div className='grid-part top right'></div>
            <div className='grid-part bottom left'></div>
            <div className='grid-part bottom right'></div>
        </VisualizerGrid>
    )
}

export default Grid

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