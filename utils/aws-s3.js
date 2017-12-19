const AWS = require('aws-sdk');

const region = process.env.AWS_REGION;
const credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: process.env.IDENTITY_POOL_ID });

AWS.config.update({ region, credentials });

module.exports = AWS;
