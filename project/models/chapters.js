var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var options = {};
// schema
var chapterSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        alias:'description'
    },
    thumb: {
        type: String,
        alias: 'thumbnailPath'
    },
    img: {
        type: String,
        alias: 'contentImagePath'
    },
    aud: {
        type: String,
        alias: 'contentAudioPath'
    },
    vid: {
        type: String,
        alias: 'contentVideoPath'
    },
    code: {
        type: String,
        alias: 'shortCode'
    },
    mid: {
        type: String,
        alias: 'moduleId',
    },
    createdAt: {
        type: String
    },
    updatedAt: {
        type: String
    },
    lastUpdatedBy: {
        type: String
    }
}, options);

var Chapters = mongoose.model('Chapters', chapterSchema);
module.exports = Chapters;