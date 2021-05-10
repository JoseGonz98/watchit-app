import React from 'react'

export default class MainLoader extends React.Component {
    shouldComponentUpdate() {
        return false
    }

    render() {
        return (
            <div className="absolute full-height full-width loading-box has-main-background valign-wrapper">
                <div className="center-block valign">
                    <div className="z-index-middle">
                        <img className="width-80-p" alt="" src="/src/render/media/img/spinner/audio.svg"
                             {...this.props}/>
                    </div>
                </div>
            </div>
        )
    }
}
