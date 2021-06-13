import React from 'react'

export default class PlayerVideo extends React.PureComponent {
  constructor (props) {
    super(props)
    this.video = null
  }

  static get defaultProps () {
    return {
      type: ''
    }
  }

  getRef = (node) => {
    this.video = node
  }

  render () {
    return (
      <video
        ref={this.getRef} autoPlay={false} controls playsInline
        className='vjs-theme-city video-js full-width full-height'
      >
        <source type={this.props.type} src={this.props.src} />
      </video>
    )
  }
}
