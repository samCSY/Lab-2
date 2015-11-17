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

var mode_nub = 0;
var modes = [ "Read mode" , "Register mode", "Remove mode" , "Show ID mode"];
var playing = false;

var led_Arr = [tessel.led[0].output(1),tessel.led[1].output(0),tessel.led[2].output(0),tessel.led[3].output(0)]

/*
var led0  = tessel.led[0].output(1);
var led1  = tessel.led[1].output(0);
var err   = tessel.led[2].output(0);
var conn  = tessel.led[3].output(0);
*/

tessel.button.on('press', function(){
  led_Arr[mode_nub].toggle();
  mode_nub += 1;
  if (mode_nub==4) mode_nub -= 4;
  led_Arr[mode_nub].toggle();
  console.log(modes[mode_nub]);
});

rfid.on('ready', function (version) {
  console.log('Read mode');
  rfid.on('data', function(card) {
      //console.log('UID:', card.uid.toString('hex'));
    var _getId = card.uid.toString('hex');
    if(mode_nub==0){
      //console.log('Ready to read RFID card');
      if (!playing){
        if (check_access(_getId)){
          console.log('Access permission');
          setImmediate(playSound('permission.mp3'));
        }
        else{
          console.log('ERROR : Invalid card (000)');
          setImmediate(playSound('denied.mp3'));
        }
      }
      else{
          console.log('Please hold on');
      }
    }
    else if (mode_nub==1){
      //_getId = card.uid.toString('hex');
      if (check_access(_getId)){
        console.log('ERROR : Invalid card (001)');
      }
      else{
        DataBase[DataBase.length]=_getId;
        console.log('Card ID ' + _getId + ' registered');
      }
    }
    else if (mode_nub==2){
      if (check_access(_getId)){
        for (i=0; i<DataBase.length; i++)
          if(DataBase[i]==_getId){
            DataBase.splice(i,1);
            break;
          }
        console.log('Card ID ' + _getId + ' is removed');
      }
      else{
        console.log("ERROR : Invalid card (002)");
      }
      
    }
    else if (mode_nub==3){
      console.log("Card ID : " + _getId);
    }
    else{
      console.log("ERROR 500");
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