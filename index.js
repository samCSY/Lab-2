var tessel  = require('tessel');
var fs      = require('fs');
var rfidlib = require('rfid-pn532');
var rfid    = rfidlib.use(tessel.port['A']); 
var audio   = require('audio-vs1053b').use(tessel.port['D']);

var playing = false;

rfid.on('ready', function (version) {
  console.log('Ready to read RFID card');
  
  rfid.on('data', function(card) {
    //console.log('UID:', card.uid.toString('hex'));
    if (card.uid.toString('hex')=='02408403')
    {
      if (!playing)
      {
        playing = true;
        console.log('playing~~~~~');
        setImmediate(playSound());
      }
      else
      {
        console.log('music is playing, please wait');
      }
    }
    else
    {
      console.log('invalid card ID');
    }
  });
});
rfid.on('error', function (err) {
  console.error(err);
});

//default card ID 02408403





var audioFile = 'master.mp3';

audio.on('ready', function() {
  console.log("Audio module connected! Setting volume...");
  // Set the volume in decibels. Around 20 is good; smaller is louder.
  audio.setVolume(100, function(err) {
    if (err) {
      return console.log(err);
    }
  });
});

function playSound() {
	// Get the song
    console.log('Retrieving file...');
    var song = fs.readFileSync('./'+audioFile);
    // Play the song
    console.log('Playing ' + audioFile + '...');
    audio.play(song, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Done playing', audioFile);
        playing = false;
      }
    });
}
// If there is an error, report it
audio.on('error', function(err) {
  console.log(err);
});