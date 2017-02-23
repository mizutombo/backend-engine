const app = require('express')();
const morgan = require('morgan')('dev');

// CONSTANTS with routes
const assets = require('./routes/assets.routes');
const errorHandler = require('./error-handler')();
const userRouter = require('./routes/user.routes');
const ensureAuth = require('./auth/ensure-auth')();
const ensureRole = require('./auth/ensure-roles')();
const jobs = require('./routes/jobs.routes');
const activities = require('./routes/activities.routes');
const education = require('./routes/education.routes');

app.use(morgan);
app.use('/assets', ensureAuth, assets);
app.use('/jobs', jobs);
app.use('/education', education);
app.use('/user', userRouter);
app.use('/activities', ensureAuth, activities);

// do not add any app.* below this line ...
app.use(errorHandler);


module.exports = app;