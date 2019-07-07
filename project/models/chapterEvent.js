var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var options = {};

// GET CURRENT TIME

function getCurrentTime(){
    var current_date = new Date();
    return current_date.toString();
}

// schema
var chapterEventSchema = new Schema({
    evt: {
        type: String,
        enum: ["Chapter Started", "Chapter Finished", "Chapter Visited"],
        alias: "eventType"
    },
    cid:{
        type: String,
        alias: "chapterId"
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

var ChapterEvents = mongoose.model('ModuleEvents', chapterEventSchema);
module.exports = ChapterEvents;