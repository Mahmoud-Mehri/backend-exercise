const express = require('express');

const { jobRouter } = require('./route/route-job.js');
const { contractRouter } = require('./route/route-contract.js');
const { profileRouter } = require('./route/route-profile.js');
const { balanceRouter } = require('./route/route-balance.js');
const { adminRouter } = require('./route/route-admin.js');

const { profileAuthenticator } = require('./middleware/authentication.js');
const { paramValidator } = require('./middleware/param-validator.js');
const { errorHandler, catch404 } = require('./middleware/error-handlers.js');

const app = express();

app.use(express.json());

app.use(profileAuthenticator);
app.use(paramValidator);

app.use('/jobs/', jobRouter)
app.use('/contracts/', contractRouter);
app.use('/profiles/', profileRouter);
app.use('/balances/', balanceRouter);
app.use('/admin/', adminRouter);

app.use(catch404);
app.use(errorHandler);

module.exports = app;