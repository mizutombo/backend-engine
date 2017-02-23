const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    educationLevel: {
        type: String,
        enum: ['High School', 'Vocational', 'College'],
        required: true
    },
    educationCost: {
        type: Number,
        enum: [0, 20000, 120000],
        required: true
    }
});

const Education = mongoose.model('Education', schema);
module.exports = Education;