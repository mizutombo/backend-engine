const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//don't forget to require in other necessary models files

const schema = new Schema({
    username: String,
    retired: Boolean,
    age: Number,
    bank_account: Number,
    networth: Number,
    assets: [{type: Schema.Types.ObjectId, ref: 'Asset'}] //this may be wonky
    original_signup: Date,
    time_since_last_signin: Number
    //job: [{type: Schema.types.ObjectId, ref: 'Job'}]
    //education: [{type: Schema.types.ObjectId, ref: 'Education'}]
    //activities
});

const User = mongoose.model('User', schema);
module.exports = User;