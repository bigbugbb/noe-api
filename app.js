const config = require('./config/config');
const express = require('express');
const app = express();
const cors = require('./middleware/cors');
const bodyParser = require('body-parser');

const models = [
  'user', 'student', 'school', 'company', 'business', 'order'
];

app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));

models.forEach(model => {
  app.use('/api/v1', require(`./controllers/${model}-controller`));
});

module.exports = app;
