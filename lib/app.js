const app = require('express')();
const morgan = require('morgan')('dev');

// CONSTANTS with routes
const assets = require('./routes/assets.routes');
const errorHandler = require('./error-handler')();

app.use(morgan);
app.use('/assets', assets);

// do not add any app.* below this line ...
app.use(errorHandler);

module.exports = app;