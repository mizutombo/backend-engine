const app = require('express')();
const morgan = require('morgan')('dev');

app.use(morgan);

module.exports = app;