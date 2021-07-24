import React from 'react'
import PropTypes from 'prop-types'
import Background from '@components/app-background/'
import BarLoader from '@components/app-bar-loader/'
import BtnClose from '@components/util-btn-close/'
import Footer from '@components/app-footer/'

export default class PlayerLoader extends React.PureComponent {
  static get propTypes () {
    return {
      stateText: PropTypes.string.isRequired,
      statePercent: PropTypes.number.isRequired
    }
  }

  render () {
    return (
      <div className='output-process valign-wrapper full-width full-height'>
        <div className='app_loader'>
          {this.props.onClose && <BtnClose onClick={this.props.onClose} />}
          <Background absolute />
          <BarLoader stateText={this.props.stateText} statePercent={this.props.statePercent} />
          <Footer />
        </div>
      </div>
    )
  }
}
