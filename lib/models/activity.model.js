const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    purchasePrice: {
        type: Number,
        required: true
    },
    rewardOdds: {
        type: Number,
        required: true
    },
    rewardAmount: {
        type: Number,
        required: true
    },
    rewardMessage: {
        type: String,
        required: true
    }
});

const Activity = mongoose.model('Activity', schema);
module.exports = Activity;