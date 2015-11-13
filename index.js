var tessel  = require('tessel');
var fs      = require('fs');
var rfidlib = require('rfid-pn532');
var rfid    = rfidlib.use(tessel.port['A']); 
var audio   = require('audio-vs1053b').use(tessel.port['B']);

var DataBase;
function read_data(callback){
  fs.readFile('./data.db', function (err, data) {
        if (err) return callback(err);
        callback(null, data);
    })
};
read_data(function(err, data){
  DataBase = Buffer_to_JSON(data);
});

var read_mode = true;
var playing = false;
var led1 = tessel.led[0].output(1);
var led2 = tessel.led[1].output(0);

tessel.button.on('press', function(){
  read_mode=!read_mode;
  if (read_mode) console.log('Read mode');
  else console.log('Register mode');
  led1.toggle();
  led2.toggle();
});

rfid.on('ready', function (version) {
  console.log('read mode');
  rfid.on('data', function(card) {
      //console.log('UID:', card.uid.toString('hex'));
    if(read_mode){
      //console.log('Ready to read RFID card');
      if (!playing){
        if (check_access(card.uid.toString('hex'))){
          console.log('Access permission');
          //playing = true;
          setImmediate(playSound('permission.mp3'));
        }
        else{
          console.log('Invalid card');
          setImmediate(playSound('denied.mp3'));
        }
      }
      else{
          console.log('Please hold on');
      }
    }
    else{
      //console.log('Ready to register RFID card');
      _getId = card.uid.toString('hex');
      if (check_access(_getId)){
        console.log('Card ID has been registered')
      }
      else{
        DataBase[DataBase.length]=_getId;
        console.log('Card ID ' + _getId + ' registered');
      }
    }
  });    
});
rfid.on('error', function (err) {
  console.error(err);
});


//default card ID 02408403

//var audioFile = 'translate_tts.mp3';

audio.on('ready', function() {
  //console.log("Audio module connected! Setting volume...");
  // Set the volume in decibels. Around 20 is good; smaller is louder.
  audio.setVolume(100, function(err) {
    if (err) {
      return console.log(err);
    }
  });
});

function playSound(audioFile) {
	// Get the song
  playing = true;
  var song = fs.readFileSync('./'+audioFile);
    // Play the song
  audio.play(song, function(err) {
    if (err) {
      console.log(err);
    }
    else {
      //console.log('Done playing', audioFile);
      playing = false;
    }
  });
}
// If there is an error, report it
audio.on('error', function(err) {
  console.log(err);
});


var Buffer_to_JSON = function(_buffer){
  var StringDecoder = require('string_decoder').StringDecoder;
  var myDecoder = new StringDecoder('utf8');    
  var _Jstring = myDecoder.write(_buffer);
  return JSON.parse(_Jstring);
};
  
var check_access = function(_id){
  for (i=0; i<DataBase.length; i++)
    if(_id==DataBase[i])
      return true;
  return false;
};