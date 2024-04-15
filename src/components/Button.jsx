import PropTypes from 'prop-types'
import styled from 'styled-components'
import { colorsUI } from '../utils/UI'

function Button({action, centered, icon}){
    
    return(
        <Wrapper onClick={action} className={centered ? "centered" : ""}>
            {icon}
        </Wrapper>
    )
}

export default Button

Button.propTypes = {
    action: PropTypes.func,
    centered: PropTypes.bool,
    icon: PropTypes.element,
}

const Wrapper = styled.button`
    border-radius: 0;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    line-height:1;
    font-weight: 500;
    font-family: inherit;
    background:${colorsUI.background};
    cursor: pointer;
    transition: border-color 0.25s;
    margin:0;
    height:2.2rem;
    width:3.4rem;
    display:inline-block;
    &.inactive{
        opacity:0.5;
        pointer-events: none;
    }
    &.centered{
        border-left:1px solid ${colorsUI.border};
        border-right:1px solid ${colorsUI.border};
      }
`