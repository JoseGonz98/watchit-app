import React from 'react'
// import PropTypes from 'prop-types'
import BoxLoader from 'components/util-box-loader'
import ReactPlayer from 'react-player';
import ReactModal from 'react-modal';

ReactModal.setAppElement('#root');
export default class AppMovieDetailTrailer extends React.PureComponent {
	
	constructor(props) {
		super(props);
		
		this.state = {
			ready_to_play: false
		}
		
		//Conf for modal
		this.modalStyle = {
			overlay: {
				position: 'fixed',
				top: 0, left: 0,
				right: 0, bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.8)'
			}, content: {
				position: 'absolute',
				top: '50%', left: '50%',
				right: 'auto', bottom: 'auto',
				transform: 'translate(-50%, -50%)',
				border: 'none', background: 'transparent',
				overflow: 'auto',
				WebkitOverflowScrolling: 'touch',
				borderRadius: '4px', outline: 'none',
				padding: '20px'
				
			}
		};
	}
	
	
	onReady = () => this.setState({
		ready_to_play: true
	})
	
	onClose = () => {
		this.props.onClose
		&& this.props.onClose()
	}
	
	render() {
		return <ReactModal isOpen={true} style={this.modalStyle}>
			{
				<button
					className="btn btn-small btn-floating top-0 right-5 absolute white"
					onClick={this.onClose}>
					<i className="icon-cross black-text"/>
				</button>
			}
			{
				!this.state.ready_to_play &&
				<div className="full-width full-height black">
					<BoxLoader size={100}/>
				</div>
			}
			
			<ReactPlayer
				onReady={this.onReady}
				url={`https://www.youtube.com/watch?v=${this.props.trailer}`}
				playing controls config={{youtube: {playerVars: {showinfo: 0, disablekb: 1}}}}
			/>
		</ReactModal>
	}
	
}
