var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var options = {};

// GET CURRENT TIME

function getCurrentTime() {
    var current_date = new Date();
    return current_date.toString();
}

// schema
var moduleEventSchema = new Schema({
    evt: {
        type: String,
        enum: ["Module Started", "Module Finished", "Module Visited"],
        alias: "eventType"
    },
    mid: {
        type: String,
        alias: "moduleId"
    },
    ip: {
        type: String,
        alias: "ipAddress"
    },
    uid: {
        type: String,
        alias: "userId"
    },
    bid: {
        type: String,
        alias: "browserId"
    },
    ca: {
        type: String,
        default: getCurrentTime(),
        alias: "createdAt"
    }
}, options);

var ModuleEvents = mongoose.model('ModuleEvents', moduleEventSchema);
module.exports = ModuleEvents;