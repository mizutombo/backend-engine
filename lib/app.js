const app = require('express')();
const morgan = require('morgan')('dev');
const errorHandler = require('./error-handler')();
const userRouter = require('./routes/user.routes');
const ensureAuth = require('./auth/ensure-auth');


app.use(morgan);

app.use('/user', userRouter);

// do not add any app.* below this line ...
app.use(errorHandler);


module.exports = app;