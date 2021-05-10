import React from 'react'

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

export default class AppMainUpdater extends React.PureComponent {
    constructor(props) {
        super(props);
        this.mRef = null;
    }

    componentDidMount() {
        // Check for updates
        ipcRenderer.removeAllListeners('update_available');
        ipcRenderer.on('update_available', () => {
            this.mRef.innerText = 'A new update is available. The app it is being updated and will restart on completion...';
            this.mRef.classList.remove('hidden');
        });

    }


    getMRef = (r) => {
        this.mRef = r
    }


    render() {
        return <strong ref={this.getMRef} className={'white-text hidden bold'} />
    }
}
