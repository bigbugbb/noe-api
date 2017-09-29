const express = require('express');
const app = express();

const UserController = require('./controllers/user-controller');
app.use('/api/users', UserController);

module.exports = app;

