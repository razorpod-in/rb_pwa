var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var options = {};
// schema
var questionSchema = new Schema({
    text: {
        type: String,
        alias: "questionText"
    },
    audio: {
        type: String,
        alias: "audioPath"
    },
    mid: {
        type: String,
        alias: "moduleId",
    },
    options: [{
        text: {
            type: String
        }
    }],
    answer: {
        type: String
    }
}, options);

var Modules = mongoose.model('Modules', moduleSchema);
module.exports = Modules;