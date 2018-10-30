const osa = require('osa2')
const youtubedl = require('youtube-dl')
const axios = require('axios')
const exec = require('child_process').exec;


osa(() => {
  return Application('iTunes').currentTrack.name() + ' ' + Application('iTunes').currentTrack.artist()
})().then(async (q) => {
  const youtubeApiKey = 'AIzaSyD9MRuCFYkMOKeJn_bv78e59oF5IxgFKQQ'

  axios.get(`https://www.googleapis.com/youtube/v3/search`, {
    params: {
      part: 'snippet',
      key: youtubeApiKey,
      q: `${q} video`
    }
  }).then(({ data }) => {
    const { items } = data
    const noResults = items.length === 0

    if (noResults) return;

    const firstResult = items[0]
    const { videoId } = firstResult.id
    const video = youtubedl(`http://www.youtube.com/watch?v=${videoId}`,
      ['--format=18'],
      { cwd: __dirname }
    );

    video.on('info', ({ url }) => {
      exec(`/Applications/IINA.app/Contents/MacOS/iina-cli "${url}"`)
    });
  })
}).then(() => {}).catch(console.error)
