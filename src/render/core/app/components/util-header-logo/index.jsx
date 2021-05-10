import React from 'react'
import icon from 'render/media/icons/icon.png'
import styled, {keyframes} from 'styled-components';

export default class Logo extends React.Component {

    static get defaultProps() {
        return {
            show: true,
            absolute: false,
            big: false,
        }
    }

    render() {
        return (
            <LogoContainer show={this.props.show} absolute={this.props.absolute} big={this.props.big}>
                <LogoImg src={icon} alt="Logo" width={50} height={50}/>
                <LogoMiddleText>ATCH</LogoMiddleText>
                <LogoEndText>IT</LogoEndText>
            </LogoContainer>
        )
    }
}

const LogoContainer = styled.h5`
  position: ${props => props.absolute ? 'absolute' : 'relative'};
  margin: 0;
  transform: ${props => props.big ? 'scale(3) translateY(-2.7rem)' : 'scale(1)'};
  letter-spacing: 2px;
  font-family: "Oswald", Arial, sans-serif;
  display: ${props => props.show ? 'inline-block' : 'none'};

  @media (min-width: 300px) {
    font-size: 1.5rem !important;
  }
  
  @media (min-width: 992px) {
    font-size: 2rem !important;
  }
  
  @media (min-width: 2000px) {
    font-size: 3rem !important;
  }
`;

const LogoImg = styled.img`
  width: 50px;
  height: 50px;
  margin-right: -3px;

  @media (min-width: 300px) {
    width: 40px;
    height: 40px;
  }
  
  @media (min-width: 992px) {
    width: 50px;
    height: 50px;
  }
  
  @media (min-width: 2000px) {
    width: 70px;
    height: 70px;
  }
`;

const LogoMiddleText = styled.span`
  position: relative;
  color: #fff;
  top: -9px;
  font-weight: 600;

  @media (min-width: 2000px) {
    top: -12px;
  }
`;

const Colors = keyframes`
  0% {
    color: rgb(251, 211, 1);
  }
  25% {
    color: rgb(255, 50, 112);
  }
  50% {
    color: rgb(32, 139, 241);
  }
  75% {
    color: rgb(175, 225, 2);
  }
  100% {
    color: rgb(251, 211, 1);
  }
`;

const LogoEndText = styled.span`
  font-weight: bold;
  position: relative;
  top: -9px;
  animation: ${Colors} 4.6s ease infinite;
  
  @media (min-width: 2000px) {
    top: -12px;
  }
`;