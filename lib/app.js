const app = require('express')();
const morgan = require('morgan')('dev');
const errorHandler = require('./error-handler')();

app.use(morgan);

// do not add any app.* below this line ...
app.use(errorHandler);

module.exports = app;