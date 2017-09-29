const express = require('express');
const app = express();

var UserController = require('./controllers/UserController');
app.use('/users', UserController);

module.exports = app;

