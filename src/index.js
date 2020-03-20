const youtubedl = require('youtube-dl')
const axios = require('axios')
const exec = require('child_process').exec
const jxa = require('jxa')
var Application = jxa.Application
const Music = Application('Music')
const QuickTime = Application('QuickTime Player')

const youtubeSearchApiUrl = 'https://www.googleapis.com/youtube/v3/search'
const youtubeApiKey = 'AIzaSyAiMxG_IKPU_mQvis-M5c0tK7_9T91yu74'
let currentTrack = ''

const currentTrackArtist = () => Music.currentTrack.artist()
const currentTrackName = () => Music.currentTrack.name()
const getCurrentTrack = () => `${currentTrackName()} ${currentTrackArtist()}`
const updateCurrentTrack = () => currentTrack = getCurrentTrack()

updateCurrentTrack()

const playVideo = async currentTrack => {
  console.log(`play video for: ${currentTrack}`)
  const { data: { items } } = await axios.get(youtubeSearchApiUrl, {
    params: {
      part: 'snippet',
      key: youtubeApiKey,
      q: `${currentTrack} video`
    }
  })

  const noResults = items.length === 0
  if (noResults) return

  const firstResult = items[0]
  const { videoId } = firstResult.id

  console.log(`found video id ${videoId}`)

  const video = youtubedl(`http://www.youtube.com/watch?v=${videoId}`,
    ['--format=22,17,18'],
    { cwd: __dirname }
  )

  video.on('info', ({ url }) => {
    console.log('got video info. opening quicktime...')
    // exec(`/Applications/IINA.app/Contents/MacOS/iina-cli "${url}"`)
    QuickTime.openURL(url)
    // Bring QuickTime to the forefront
    // setTimeout(() => QuickTime.activate(), 200)
  })
}

const stopCurrentVideo = () => {
  QuickTime.windows[0].document.close()
}

playVideo(currentTrack)

setInterval(() => {
  if (currentTrack === getCurrentTrack()) return

  console.log(`track changed: ${getCurrentTrack()}`)
  updateCurrentTrack()

  stopCurrentVideo()
  playVideo(currentTrack)
}, 1000)