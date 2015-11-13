var pt = require("./"),
    fs = require('fs');


var b = new Buffer(512);
b.fill(0);
b[0x1FE] = 0x55;
b[0x1FF] = 0xAA;
pt.parse(b);

var IMAGE_PATH = process.argv[2];

fs.open(IMAGE_PATH, 'r', function (e,fd) {
    if (e) throw e;
    else fs.read(fd, Buffer(512), 0, 512, 0, function (e,n,d) {
        if (e) throw e;
        else console.log(pt.parse(d));
    });
});
