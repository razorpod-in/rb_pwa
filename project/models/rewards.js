var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var options = {};
// schema
var rewardSchema = new Schema({
    title:{
        type: String
    },
    description:{
        type: String
    },
    link:{
        type: String
    },
    thumbnail: {
        type: String
    },
    mid: {
        type: String
    },
    createdAt:{
        type: String
    },
    updatedAt:{
        type: String
    },
    lastUpdatedBy:{
        type: String
    }
}, options);

var Rewards = mongoose.model('Rewards', rewardSchema);
module.exports = Rewards;