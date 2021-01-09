<template>
  <div class="e-nuxt-container">
    <div class="video-container">
      <video :src="videoUrl" autoplay controls />
      <!-- <div class="e-nuxt-system-info">
        <system-information />
      </div>   -->
    </div>
    <h1>
      {{ trackInfo.artist }} - {{ trackInfo.name }}
    </h1>
  </div>
</template>

<script>
import fs from 'fs'
import { systemPreferences } from 'electron'
import axios from 'axios'
import runJxa from 'run-jxa'
import youtubedl from 'youtube-dl'

// import SystemInformation from '@/components/SystemInformation.vue'

// Prompt to access System Preferences by setting the prompt "true"
console.log({ systemPreferences })
const isTrusted = systemPreferences.isTrustedAccessibilityClient(true)

// console.log('Does the client have accessibility permissions?', isTrusted)

// https://console.cloud.google.com/apis/api/youtube.googleapis.com/credentials?project=compluter-viz-299905
// quota exceeded:
// https://stackoverflow.com/questions/63211098/
const youtubeSearchApiUrl = 'https://www.googleapis.com/youtube/v3/search'
const youtubeApiKey = 'AIzaSyDbri-wOFed1-1capJC7dUyH2k9GS0lBdc'

export default {
  components: {
    // SystemInformation
  },
  data () {
    return {
      trackInfo: {},
      videoId: '',
      videoDuration: '',
      videoUrl: ''
    }
  },
  watch: {
    'trackInfo.databaseID': {
      handler (databaseID, oldDatabaseID) {
        if (databaseID === oldDatabaseID) return
        this.getVideoId(this.trackInfo)
      }
    },
    videoId: {
      handler (videoId, oldVideoId) {
        if (videoId === oldVideoId) return
        this.getVideoUrl(videoId)
      }
    }
  },
  async created () {
    // await this.getTrackInfo()
    // this.getVideoUrl(this.trackInfo)
    setInterval(this.getTrackInfo, 200)

    console.log({ systemPreferences }, this.$electron)
  },
  beforeDestroy () {
    // clearInterval(this.getTrackInfoInterval)
  },
  methods: {
    // openURL (url) {
    //   remote.shell.openExternal(url)
    // },

    async getTrackInfo () {
      // ! if 'undefined undefined' or falsy, try Spotify
      // also check for iTunes / Music initially. or mac os version

      this.trackInfo = await runJxa(`
        const Music = Application('Music')

        try {
          Music.currentTrack.name()
        } catch(e) {
          return ''
        }

        const artist = Music.currentTrack.artist()
        const name = Music.currentTrack.name()
        const duration = Music.currentTrack.duration()
        const databaseID = Music.currentTrack.databaseID()

        return { artist, name, duration, databaseID }
      `, [])
    },

    // async getVideoId (trackInfo: object) {
    async getVideoId (trackInfo) {
      console.log(`get video id for: ${trackInfo.artist} ${trackInfo.name}`)

      const { data: { items } } = await axios.get(youtubeSearchApiUrl, {
        params: {
          part: 'snippet',
          key: youtubeApiKey,
          q: `${trackInfo.artist} ${trackInfo.name} video`
        }
      })

      if (!items.length) {
        this.videoUrl = null
        return
      }

      const { videoId } = items[0].id

      this.videoId = videoId
    },

    async getVideoUrl (videoId) {
      console.log(`play video for: ${videoId}`)

      const video = youtubedl(`http://www.youtube.com/watch?v=${videoId}`,
        ['--format=best'], {
          cwd: __dirname
        }
      )

      video.on('info', ({ duration, url }) => {
        this.videoDuration = duration
        this.videoUrl = url
      })

      video.pipe(fs.createWriteStream('viz.mp4'))
    },

    playheadSync () {
      // If audio track is shorter than the video,
      // pause the audio track, allowing it to 'catch up' to the video.

      // If the audio track is longer, skip ahead n seconds?

      // ! playhead positioned a few seconds ahead,
      // so that when next track starts, viz can fetch the next video
      // ahead of time, detect that the current one is about to end
    }
  }
}
</script>

<style>
.e-nuxt-container {
  font-family: Helvetica, sans-serif;
}

.video-container {
  display: flex;
}

.video-container video {
  width: 100vw;
  height: 100vh;
}

.e-nuxt-system-info {
  padding: 20px;
  border-top: 1px solid #397c6d;
  border-bottom: 1px solid #397c6d;
}
</style>
