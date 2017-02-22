const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    job_type: {
        type: String,
        enum: [],
        required: true
    }
})