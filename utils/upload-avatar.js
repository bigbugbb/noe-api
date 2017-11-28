const { promisify } = require('util');
const AWS = require('./aws-s3');

async function uploadAvatar(avatar, prefix) {
  const s3 = new AWS.S3({ params: { Bucket: process.env.AWS_BUCKET } });
  const decoded = decodeBase64Image(avatar);
  const extname = decoded.type.split('/')[1];
  const key = `${prefix}/avatar.${extname}`;
  const object = {
    Key: key,
    Body: decoded.data,
    ACL: 'public-read',
    ContentType: decoded.type,
    CacheControl: `max-age=${86400 * 365}`
  };
  return await promisify(s3.upload.bind(s3))(object);
}

function decodeBase64Image(dataString) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = Buffer.from(matches[2], 'base64');

  return response;
}

module.exports = { uploadAvatar, decodeBase64Image };
