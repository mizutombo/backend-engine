const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    job_type: {
        type: String,
        enum: ['Unskilled', 'Blue Collar', 'White Collar'],
        required: true
    },
    job_level: {
        type: String,
        enum: ['Entry', 'Mid-level', 'Senior'],
        required: true
    },
    monthly_salary: {
        type: Number,
        required: true
    },
    promotion_interval: {
        type: Number,
        required: true
    }
});

const Job = mongoose.model('Job', schema);
module.exports = Job;