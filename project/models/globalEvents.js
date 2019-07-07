var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var options = {};

// GET CURRENT TIME

function getCurrentTime() {
    var current_date = new Date();
    return current_date.toString();
}

// schema
var globalEventSchema = new Schema({
    evt: {
        alias: "eventType",
        type: String,
        enum: ["Pick Screen Visited","Registration Page Visited","Registration Submitted","Home Page Visited","Library Visited","Resources Visited","Profile Visited", "Rewards Visited"]
    },
    uid: {
        type: String,
        alias: "userId"
    },
    bid: {
        type: String,
        alias: "browserId"
    },
    ip: {
        type: String,
        alias: 'ipAddress'
    },
    ca: {
        type: String,
        default: getCurrentTime(),
        alias: "createdAt"
    },
}, options);

var GlobalEvents = mongoose.model('GlobalEvents', globalEventSchema);
module.exports = GlobalEvents;