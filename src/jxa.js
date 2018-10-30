var Application = require('jxa').Application;

var iTunes = Application('iTunes');

var name   = iTunes.currentTrack.name();
var artist = iTunes.currentTrack.artist();

console.log(name + ' by ' + artist);
// Pay No Mind (feat. Passion Pit) by Madeon

iTunes.pause();
// Music pauses

iTunes.play();
// Music plays
