const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    type: {type: String, enum: ['House', 'Vehicle']},
    model: String,

});