var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var options = {};
// schema
var moduleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        alias: "desc"
    },
    thumbnailPath: {
        type: String,
        alias: "thumb"
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

var Modules = mongoose.model('Modules', moduleSchema);
module.exports = Modules;