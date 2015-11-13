// NOTE: for now just first partition in MBR
// TODO: all the things (multi-partitions, GUID, APM, etc.) http://en.wikipedia.org/wiki/Partition_table

var _ = require('struct-fu');

// see http://en.wikipedia.org/wiki/Master_Boot_Record#Sector_layout
// and http://www.cs.tcu.edu/people/professors/rinewalt/30103/MBR_GRUB.pdf

var _cylHeadSec = _.struct([
    _.ubit('head', 8),
    _.ubit('cylinder89', 2),
    _.ubit('sector', 6),
    _.ubit('cylinder07', 8),
]);

var mbrPartitionEntry = _.struct([
    _.uint8('status'),
    _.struct('start', [_cylHeadSec]),
    _.uint8('type'),
    _.struct('end', [_cylHeadSec]),
    _.uint32le('firstSector'),
    _.uint32le('numSectors')
]);

var partitionTypes = {
    0x00: 'empty',
    0x01: 'fat12',
    0x04: 'fat16',
    0x05: 'extpt',
    0x06: 'fat16',
    0x07: 'exfat',
    0x0b: 'fat32',
    0x0c: 'fat32',
    // TODO: …meh
};

exports.parse = function (bootSector) {
    if (bootSector[0x1FE] !== 0x55 || bootSector[0x1FF] !== 0xAA) throw Error("Invalid MBR");
    var entries = [],
        entryOffset = {bytes:0x1BE}
    for (var i = 0; i < 4; ++i) {
        var value = mbrPartitionEntry.valueFromBytes(bootSector, entryOffset);
        entries.push({
            firstSector: value.firstSector,
            numSectors: value.numSectors,
            type: partitionTypes[value.type] || '?????'
        });
    }
    return {
        sectorSize: 512,
        partitions: entries
    };
};