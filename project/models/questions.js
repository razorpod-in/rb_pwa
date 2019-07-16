var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var options = {};
// schema
var questionSchema = new Schema({
    text: {
        type: String,
        alias: "questionText",
        required: true
    },
    aud: {
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
    },
    wrongText: {
        type: String,
        alias: "wt"
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

var Questions = mongoose.model('Questions', questionSchema);
module.exports = Questions;