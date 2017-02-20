const mongoose = require('mongoose');
mongoose.Promise = Promise;

const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/dbSimsPDX';

module.exports = mongoose.connect(dbUri);

mongoose.connection.on('connected', () => {
	console.log('connected to mongodb !!!');
});