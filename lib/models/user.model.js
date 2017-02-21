const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

//don't forget to require in other necessary models files

const schema = new Schema({
    username: { type: String, required: true },
    hash: { type: String, required: true },
    retired: Boolean,
    age: Number,
    bank_account: Number,
    networth: Number,
    assets: [{ type: Schema.Types.ObjectId, ref: 'Asset' }], //this may be wonky
    original_signup: Date,
    time_since_last_signin: Number
    //job: [{type: Schema.types.ObjectId, ref: 'Job'}]
    //education: [{type: Schema.types.ObjectId, ref: 'Education'}]
    //activities
});

schema.virtual('password').set(function(password) {
    this.hash = bcrypt.hashSync(password, 8);
});

schema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.hash);
};

const User = mongoose.model('User', schema);
module.exports = User;
