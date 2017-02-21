const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    asset_type: { 
        type: String, 
        enum: ['House', 'Vehicle'] 
    },
    model: String,
    purchase_price: {
        type: Number,
        required: true
    },
    current_value: Number,
    monthly_appreciation_percentage: { type: Number, required: false }
});

const Asset = mongoose.model('Asset', schema);
module.exports = Asset;