import React from 'react'
import AppMovies from 'layout/app-movies-list/'
import AppMovieDetails from 'layout/app-movie-details/'
import AppNav from 'components/app-movies-nav-bar/'
import AppSearch from 'components/app-movies-search/'
import AppLoader from 'components/app-movie-player-loader'
import StatsValue from "components/util-stats";
import BoxLoader from 'components/util-box-loader'
import Movie from 'resource/movies'

import storageHelper from 'helpers/storage';
import util from 'helpers/util'
import log from 'logger'

// Access to main process bridge prop
const key = window.bridge.Key
const broker = window.bridge.Broker
const DEFAULT_INIT_LOAD = 100;


//Login pages class
export default class MovieIndex extends React.Component {
    constructor(props) {
        super(props);
        // It cached or loaded initial chunk
        const itCached = this.cached || this.loaded;
        log.warn(`Init with cached:${!!this.cached} and loaded:${!!this.loaded}`)

        // Initial state
        this.state = {
            state: 'Bootstrapping', percent: 0, peers: this.peers, count: DEFAULT_INIT_LOAD,
            ready: itCached, loading: !itCached, movies: [], screen: this.getRecalculatedScreen(),
            lock: false, // Avoid re-render movies list
            finishLoad: false, showDetailsFor: false, logout: false
        };

        //Max movies for initial request
        this.movie = new Movie(broker);
        this.renderTimeout = null;
        this.resizeTimeout = null;
        this.sort = {
            sort_by: 'year',
            order: 'desc'
        };

    }


    _index(i) {
        // Else try get from key file and save
        let _storage = key.readFromStorage() || {}
        return (i in _storage && _storage[i]) || 0
    }

    get loaded() {
        return +this._index('chunk') > 0;
    }

    get cached() {
        return this._index('cached')
    }

    startRunning = (cb = null) => {
        this.setState({
            ready: true,
            loading: false
        }, cb)
    }

    getRecalculatedScreen = () => {
        const width = Math.min(window.innerWidth, window.screen.width),
            height = Math.min(window.innerHeight, window.screen.height),
            defaults = util.calcScreenSize({width, height});
        log.info(`Recalculating Screen W:${width}, H:${height}`);
        return defaults
    }

    removeExtraRow = (movies, chunk) => {
        return movies.filter((i) => Object.is(i.length, chunk));
    }

    recalculateScreen = () => {
        if (!this.state.movies.length) return;
        const defaults = this.getRecalculatedScreen(),
            chunkSize = defaults.chunkSize,
            moviesArrays = this.state.movies,
            movies = moviesArrays.flat(1),
            moviesNewStructure = this.moviesToRow(movies, chunkSize),
            cleanedMovies = this.removeExtraRow(moviesNewStructure, chunkSize);

        this.setState({
            loading: false, lock: false,
            movies: cleanedMovies,
            screen: defaults,
        });
    }

    handleResize = () => {
        if (!this.state.loading) this.setState({loading: true});
        this.resizeTimeout && clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(this.recalculateScreen, 500);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        broker.removeAllListeners();
    }

    componentDidMount() {
        // Set initial screen
        window.addEventListener('resize', this.handleResize);

        // Start ingest if not
        if (this.cached) {
            log.info('Running Cache');
            broker.removeAllListeners();
            broker.stopIpcEvents();
            broker.listenForNewPeer();
            broker.listenForPartyRock();
            broker.startSeed()
            broker.on('chaos', this.chaos)
            return;
        }

        // Start ingestion
        this.runIngest();
    }

    onClickMovie = (id) => {
        this.setState({
            showDetailsFor: id,
            lock: true
        })
    }

    onClickCloseMovie = (e) => {
        e.preventDefault();
        this.setState({
            showDetailsFor: false
        })
    }

    chaos = () => {
        // Wait for redirect to app login
        log.warn('Redirecting...')
        setImmediate(() => window.location.href = '#/')
    }

    runIngest() {
        // Init ingest
        broker.removeAllListeners().on('progress', (state) => {
            this.setState({state: state})
        }).on('start', async () => {
            log.info('STARTING');
            // if (!this.loaded) localStorage.clear();

        }).on('ready', () => {
            //Start filtering set cache synced movies
            log.info('LOADED FROM LOCAL');
            this.startRunning()

        }).on('error', (msg = 'Waiting Network') => {
            if (this.state.ready) return;
            this.setState({state: msg, ready: false});

        }).on('done', () => {
            log.info('LOAD DONE')
        }).on('chaos', this.chaos).load()

    }

    filterMovies(filter = {}, clear = false, chunks = null, cb = null) {

        //Get from cache filters
        if (storageHelper.get().from.mainNavFilters())
            filter = {...filter, ...storageHelper.get().from.mainNavFilters()}


        //Clean all.. invalid
        if ('genres' in filter) {
            if (filter['genres'] === 'All') {
                delete filter['genres']
            }
        }

        // Add limit to filters
        filter = {...{limit: this.state.screen.limit}, ...filter};
        if ('to' in filter && 'start' in filter) {
            filter.limit = filter.to - filter.start;
            filter.skip = filter.start;
            log.info('Skip:', filter.skip);
            log.info('Chunk:', filter.limit);
        }

        //Get movies
        this.movie.filter(filter).then((movies) => {
            //Chunk and concat movies
            log.warn('Movies filtered')
            let _chunk = chunks || this.state.screen.chunkSize;
            let _movies = this.moviesToRow(movies, _chunk);

            // Handle sizes
            let _size = _movies.length;
            let _new_movies = [...this.state.movies, ..._movies];
            let _current = _new_movies.length;

            this.setState({
                scrolling: false, loading: false,
                count: !_size ? _current : (_current + 10),
                finishLoad: !clear ? !_size : false,
                movies: clear ? _movies : _new_movies,
                lock: false
            });

            // Send state in cb
            cb && cb(this.state)
        })
    }

    loadOrder = (start, to, size = this.state.screen.chunkSize) => {
        start = start * size;
        to = to * size;
        log.warn('Fetching movies from db')
        return new Promise((resolve) => {
            //Throttling
            this.renderTimeout && clearTimeout(this.renderTimeout)
            this.renderTimeout = setTimeout(() => {
                this.filterMovies({...{start, to}, ...this.sort},
                    false, false, (state) => {
                        log.info('Infinite movies loaded');
                        resolve(state)
                    }
                )
            }, 500)
        })
    }

    moviesToRow(_movies, l) {
        return new Array(Math.ceil(_movies.length / l)).fill(0)
            .map((_, n) => _movies.slice(n * l, n * l + l));
    }

    initialNavVar(genres, sort) {
        //Has sort cache?
        if (storageHelper.get().from.mainNavFilters()) {
            //Get cache from localStorage
            let _sort_cache = storageHelper.get().from.mainNavFilters();
            let _hash = {'genres': genres, 'sort_by': sort};

            //For each key in cache
            for (let key_ in _hash) {
                //Check for genres in cache filter
                if (key_ in _sort_cache) {
                    //Iterate over element lists
                    for (let item in _hash[key_]) {
                        //Clean default
                        if ('default' in _hash[key_][item])
                            delete _hash[key_][item]['default'];

                        //Set new default
                        if (Object.is(_hash[key_][item].action, _sort_cache[key_])) {
                            _hash[key_][item]['default'] = true;
                        }
                    }
                }
            }
        }

        //Return initial
        return {
            genres: genres,
            sort: sort
        }
    }

    onChange = (sort, by) => {
        //If by?
        if ((storageHelper.get().from.mainNavFilters())) {
            this.sort = Object.assign(
                {}, this.sort,
                storageHelper.get().from.mainNavFilters(),
                {[sort]: by.action}
            );
        } else {
            if (by.action) {
                this.sort = Object.assign(
                    {}, this.sort, {[sort]: by.action}
                );
            } else {
                if (sort in this.sort) {
                    delete this.sort[sort]
                }
            }
        }


        //Reset limit
        log.warn(`Sorting by ${by.action}`)
        storageHelper.add(this.sort).to.mainNavFilters();
        this.setState({loading: true}, () => {
            //Set cache filters
            setImmediate(() => this.filterMovies(this.sort, true));
        });

    }

    signOut = (event) => {
        event.preventDefault();
        localStorage.clear();
        broker.flush();
        this.setState({
            ready: false, logout: true,
            state: 'Please Wait'
        })
    }


    render() {
        return (
            <>
                {
                    this.state.showDetailsFor &&
                    <AppMovieDetails
                        id={this.state.showDetailsFor}
                        onClick={this.onClickCloseMovie}
                    />
                }

                {
                    (!this.state.ready &&
                        <div className={`movie-player full-width full-height loading`}>
                            <AppLoader
                                stateText={this.state.state}
                                statePercent={this.state.percent}
                                onClose={!this.state.logout && this.signOut}
                            />
                        </div>
                    ) ||
                    <div className="relative full-height main-view">
                        {/*Top main nav*/}
                        <section className="row full-height">
                            <div className="clearfix full-height">
                                <header
                                    className="no-margin vertical-padding transparent z-depth-1 d-flex align-items-center justify-content-between header_search">
                                    <div className="col l6 m6 relative input-black-box">
                                        <AppSearch movies={this.movie} onClick={this.onClickMovie}/>
                                    </div>

                                    <div className="top-right-small-menu">
                                        <strong className={'white-text right'}>
                                            <StatsValue handler={this._index}/>
                                            <a onClick={this.signOut} className="logout" href={'/'}>
                                                <i className="icon-log-out font-size-1-rem white-text"/>
                                            </a>
                                        </strong>
                                    </div>
                                </header>

                                {/*Top main nav*/}
                                <nav className="col l12 m12 transparent z-depth-0">
                                    <AppNav
                                        onChange={this.onChange}
                                        setInitialNavVar={this.initialNavVar}
                                    />
                                </nav>

                                {/* Movies section lists */}
                                <section className="row movies-box clearfix">
                                    {
                                        (!this.state.loading &&
                                            <AppMovies
                                                movies={this.state.movies} loadOrder={this.loadOrder}
                                                count={this.state.count} loading={this.state.lock}
                                                end={this.state.finishLoad} chunkSize={this.state.screen.chunkSize}
                                                onClick={this.onClickMovie} screen={this.state.screen}
                                            />) || <BoxLoader size={100}/>
                                    }
                                </section>
                            </div>
                        </section>
                    </div>
                }
            </>
        )
    }
}
