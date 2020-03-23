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
import { remote } from 'electron'
import axios from 'axios'
import runJxa from 'run-jxa'
import youtubedl from 'youtube-dl'

// import SystemInformation from '@/components/SystemInformation.vue'

// Prompt to access System Preferences by setting the prompt "true"
const isTrusted = remote.systemPreferences.isTrustedAccessibilityClient(true)

console.log('Does the client have accessibility permissions?', isTrusted)

const youtubeSearchApiUrl = 'https://www.googleapis.com/youtube/v3/search'
const youtubeApiKey = ''

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
  },
  methods: {
    openURL (url) {
      remote.shell.openExternal(url)
    },

    async getTrackInfo () {
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
