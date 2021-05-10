const ip = require('ip');
const log = require('logplease').create('DNLA')
const EventEmitter = require('events')

const DLNA_MAX_RETRIES = 10
const DLNA_TIMEOUT = 5000
module.exports = class Cast extends EventEmitter {
    constructor() {
        super()
        this.dnla = require('dlnacasts2')()

        this.subs = []
        this.players = []
        this.player = null;
        this.dlnaTimeout = null;
        this.dlnaRetry = DLNA_MAX_RETRIES

        this.dnla.on('update', (player) => {
            this.players = this.dnla.players
            this.player = this.players[0]
            this.emit('device', player)
        })

        this.dnla.on('status', (status) => {
            this.emit('status', status)
        })
    }

    requestUpdate() {
        log.warn('Request dlna');
        this.dnla.update();
        this.dlnaTimeout && clearTimeout(this.dlnaTimeout);
        // Try until retry exhausted and not found devices
        if (this.dlnaRetry > 0 && this.players.length === 0)
            this.dlnaTimeout = setTimeout(() => {
                log.warn(`Retrying DLNA # ${this.dlnaRetry--}`)
                this.requestUpdate()
            }, DLNA_TIMEOUT)
        return this;
    }

    stop() {
        // Stop server
        if (this.player && this.player.client)
            this.player.stop();
        // Clear attrs
        this.subs = [];
        this.dlnaRetry = DLNA_MAX_RETRIES;
        log.info('DLNA stopped');
    }


    get localIp() {
        return ip.address()
    }

    setPlayer(i) {
        this.player = this.players[i];
        log.info(`${this.player.name} set`);
    }

    setSub(sub) {
        this.subs = [sub]
    }

    play(title, stream) {
        // Use local lan address
        // Try start stream
        this.player.play(stream.replace('127.0.0.1', this.localIp), {
            title: title, type: 'video/mp4',
            dlnaFeatures: "DLNA.ORG_OP=01;DLNA.ORG_FLAGS=01100000000000000000000000000000", // this enables seeking in some dlna devices
            seek: 1, // start by seeking to this offset
            subtitles: this.subs, // subtitle track 1,
            autoSubtitles: true // enable first track if you provide subs
        })
    }
}


