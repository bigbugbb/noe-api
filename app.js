const express = require('express');
const app = express();
const cors = require('./middleware/cors');

app.use(cors());
app.use('/api/v1', require('./controllers/user-controller'));

module.exports = app;

