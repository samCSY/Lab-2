var tessel  = require('tessel');
var fs      = require('fs');
var rfidlib = require('rfid-pn532');
var rfid    = rfidlib.use(tessel.port['A']); 
var sdcardlib = require('sdcard');
var sdcard = sdcardlib.use(tessel.port['C']);

sdcard.on('ready', function() {
  sdcard.getFilesystems(function(err, fss) {
    var fst = fss[0];
    console.log('Writing...');
    fst.writeFile('someFile.txt', 'Hey Tessel SDCard!', function(err) {
      console.log('Write complete. Reading...');
      fst.readFile('someFile.txt', function(err, data) {
        console.log('Read:\n', data.toString());
      });
    });
  });
});
var DataBase;
function read_data(callback){
  fs.readFile('data.db', function (err, data) {
        if (err) return callback(err);
        callback(null, data);
    })
};
read_data(function(err, data){
  DataBase = Buffer_to_JSON(data);
  //console.log(DataBase.length);
});

var save_data = function(_id){
    var To_be_save_id = _id;
    console.log(DataBase.length);
    DataBase[DataBase.length] = To_be_save_id;
    fs.writeFile('data.db',new Buffer(JSON.stringify(DataBase)),function(err){
      if (err) throw err;
      console.log('append success!');
    });
    return; 
};


rfid.on('ready', function (version) {
  console.log('Ready to read RFID card');
  console.log(DataBase);
  rfid.on('data', function(card) {
      console.log('UID:', card.uid.toString('hex'));
      save_data(card.uid.toString('hex'));
    });
  });
  rfid.on('error', function (err) {
    console.error(err);
  });

var Buffer_to_JSON = function(_buffer){
  var StringDecoder = require('string_decoder').StringDecoder;
  var myDecoder = new StringDecoder('utf8');    
  var _Jstring = myDecoder.write(_buffer);
  return JSON.parse(_Jstring);
};