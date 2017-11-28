const AWS = require('aws-sdk');

const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;

AWS.config.update({
  accessKeyId,
  secretAccessKey,
  region
});

module.exports = AWS;
