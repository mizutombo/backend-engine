const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    jobType: {
        type: String,
        enum: ['Unskilled', 'Blue Collar', 'White Collar'],
        required: true
    },
    jobLevel: {
        type: String,
        enum: ['Entry', 'Mid-level', 'Senior'],
        required: true
    },
    monthlySalary: {
        type: Number,
        required: true
    },
    promotionInterval: {
        type: Number,
        required: true
    }
});

const Job = mongoose.model('Job', schema);
module.exports = Job;