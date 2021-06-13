import React from 'react'
import PropTypes from 'prop-types'
import StateLoader from 'components/app-state-loader'

import Player from './player'
import PlayerHeader from './header'

export default class PlayerHLS extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      canPlay: false,
      state: 'Connecting'
    }
  }

  static get propTypes () {
    return {
      movie: PropTypes.object.isRequired
    }
  }

  handleProgress = () => {
    // abstract method just keep going
  }

  handleReady = () => {
    // abstract method just keep going
  }

  handleCanPlay = () => {
    this.setState({
      canPlay: true
    })
  }

  render () {
    return (
      <>
        {
          (
            !this.state.canPlay &&
              <div className='absolute full-width full-height player-overlay-loader'>
                <StateLoader stateText={this.state.state} statePercent={0} />
              </div>
          )
        }

        <section className='absolute full-height clearfix video-stream'>
          {/* Movie torrent info */}
          {this.state.canPlay && <PlayerHeader title={this.props.movie.title} />}

          {/* Main player */}
          <div className='full-height movie-box'>
            <Player
              movie={this.props.movie}
              subs={this.props.subs}
              canPlay={this.state.canPlay}
              onProgress={this.handleProgress}
              onReady={this.handleReady}
              onCanPlay={this.handleCanPlay}
            />
          </div>
        </section>
      </>
    )
  }
}
