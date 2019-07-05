var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var options = {};
// schema
var userSchema = new Schema({
    fullName: {
        type: String
    },
    phone: {
        type: String
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
    createdAt: {
        type: String
    },
    updatedAt: {
        type: String
    }
}, options);

var Users = mongoose.model('Users', userSchema);
module.exports = Users;