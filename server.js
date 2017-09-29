require('./config/config');

const app = require('./app');
const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});