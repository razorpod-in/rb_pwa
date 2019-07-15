var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var options = {};
// schema
var userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    lastModuleVisited: {
        type: String
    },
    lastChapterVisited: {
        type: String
    },
    points: {
        type: String
    },
    rewards: [
        {
            type: String,
            enum:[]
        }
    ],
    bid: {
        type: String,
        alias: "browserId",
        required: true
    },
    createdAt: {
        type: String
    },
    updatedAt: {
        type: String
    }
}, options);

var Users = mongoose.model('Users', userSchema);
module.exports = Users;