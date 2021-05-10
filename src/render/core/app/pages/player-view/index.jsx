import React from 'react'
import AppMoviesPlayerTorrent from "components/app-movie-player-torrent";
import AppMoviesPlayerHLS from "components/app-movie-player-hls";
import MainLoader from 'components/util-main-loader'
import BtnClose from 'components/util-btn-close'
import Movie from 'resource/movies'
import cryptHelper from 'helpers/crypt'
import log from 'logger'

// Access to main process bridge prop
const broker = window.bridge.Broker;

//Movie player pages class
export default class MoviePlayer extends React.Component {
    constructor(props) {
        super(props);

        //Movie init local db
        this.movie = new Movie(broker);
        //Decode string and pass to json object
        this.state = {
            stopped: false,
            toggle_screen: false
        };

    }

    componentDidMount() {
        //Decode param
        let _movieInfo = JSON.parse(
            cryptHelper.fromBase64(
                this.props.match.params.resource
            )
        );

        //Set subs from movie if exists
        this.movie.get(_movieInfo.id).then((res) => {
            //Set new subs
            this.setState({
                movieInfo: {..._movieInfo, ...{title: res.title}},
                movieSubs: {}//this.subs(res)
            });

        }).catch((e) => {
            log.error('Error in movie get', e)
        })
    }


    switchPlayer = (type) => {
        const types = {
            'torrent': AppMoviesPlayerTorrent,
            'hls': AppMoviesPlayerHLS
        }

        if (type in types)
            return types[type]
    }

    render() {
        return (
            <div className="movie-player full-width full-height">
                <BtnClose action={`#/app/movies`}/>

                {
                    (
                        this.state.movieInfo && React.createElement(
                            this.switchPlayer(this.state.movieInfo.type), {
                                movie: this.state.movieInfo,
                                subs: this.state.movieSubs
                            }
                        )
                    )
                }
                {/*Loader box*/}
                {this.state.stopped && <MainLoader/>}
            </div>
        )
    }
}

