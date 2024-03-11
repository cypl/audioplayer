import PropTypes from 'prop-types'
import styled from 'styled-components'

function Button({action, inactive, icon}){
    return(
        <Wrapper onClick={action} className={inactive ? "inactive" : ""}>
            {icon}
        </Wrapper>
    )
}

export default Button

Button.propTypes = {
    action: PropTypes.func,
    inactive: PropTypes.bool,
    icon: PropTypes.element,
}

const Wrapper = styled.button`
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    line-height:1;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    cursor: pointer;
    transition: border-color 0.25s;
    margin:0 0.5rem;
    &.inactive{
        opacity:0.5;
        pointer-events: none;
    }
`