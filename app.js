const config = require('./config/config');
const express = require('express');
const app = express();
const cors = require('./middleware/cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());

app.use('/api/v1', require('./controllers/user-controller'));
app.use('/api/v1', require('./controllers/student-controller'));

module.exports = app;
