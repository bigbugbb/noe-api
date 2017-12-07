const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const validator = require('validator');
const s3Uploads = require('../utils/s3-uploads');
const _ = require('lodash');

// Schema
var Schema = mongoose.Schema;

var BusinessSchema = new mongoose.Schema({
  owner: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
    es_indexed: true
  },
  avatar: {
    type: String,
    required: true,
    default: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QCMRXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAAeCgAwAEAAAAAQAAAWgAAAAA/+0AOFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAAOEJJTQQlAAAAAAAQ1B2M2Y8AsgTpgAmY7PhCfv/AABEIAWgB4AMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8KCwkMEQ8SEhEPERATFhwXExQaFRARGCEYGhwdHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/3QAEAB7/2gAMAwEAAhEDEQA/APsuiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9D7LooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//R+y6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//0vsuiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9P7LooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//U+y6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//1fsuiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9b7LooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKRmCjLEAeppnnw/8APWP/AL6FAElFR+fD/wA9Y/8AvoUefD/z1j/76FAElFR+fD/z1j/76FHnw/8APWP/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AooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9f7LooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//Q+y6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//0fsuiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9L7LooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//T+y6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//1PsuiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9X7LooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//Z',
    es_indexed: true
  },
  name: {
    type: String,
    trim: true,
    required: true,
    default: 'Your business name',
    es_indexed: true,
    es_boost: 2.0,
    es_type: 'multi_field',
    es_fields: {
      multi_field: { type: 'string', index: 'analyzed' },
      untouched: { type: 'string', index: 'not_analyzed' }
    }
  },
  type: { // TODO: update validator
    type: String,
    trim: true,
    es_indexed: true
  },
  address: {
    type: String,
    trim: true,
    required: true,
    default: 'Your business address',
    es_indexed: true
  },
  country: {
    type: String,
    trim: true,
    es_indexed: true
  },
  summary: {
    type: String,
    trim: true,
    required: true,
    default: 'Your business summary',
    es_indexed: true
  },
  price: {
    type: Number,
    min: [0, 'Price must be larger than 0'],
    max: [1000000, 'Maximum allowed price is 1000000'],
    default: 0,
    required: true,
    es_indexed: true
  },
  currency: {
    type: String,
    default: 'usd',
    required: true,
    es_indexed: true
  },
  content: {
    type: String,
    trim: true,
    es_indexed: true
  },
  orders: [{
    type: Schema.ObjectId,
    ref: 'Order',
    es_indexed: true
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive'],
    default: 'draft',
    required: true,
    es_indexed: true
  },
  email: {
    type: String,
    trim: true,
    minlength: 3,
    es_indexed: true,
    validate: {
      validator: value => validator.isEmail(value),
      message: '{VALUE} is not a valid email'
    }
  },
  phone: {
    type: String,
    trim: true,
    default: '(000)0000000',
    required: true,
    es_indexed: true
  },
}, {
  timestamps: true,
  retainKeyOrder: true
});

// Validation
BusinessSchema.path('avatar').validate(function (avatar) {
  return /^data:image\//.test(avatar) || /^http/.test(avatar);
}, 'Image content or path not allowed');

BusinessSchema.path('name').validate(function (name) {
  name = name.trim();
  return !_.isEmpty(name) && name.length <= 160;
}, 'Business name must be present but less than 160 characters');

BusinessSchema.path('address').validate(function (address) {
  address = address.trim();
  return !_.isEmpty(address) && address.length <= 256;
}, 'Address must be present but less than 256 characters');

BusinessSchema.path('summary').validate(function (summary) {
  summary = summary.trim();
  return !_.isEmpty(summary) && summary.length <= 600;
}, 'Summary must be present but less than 600 characters');

BusinessSchema.path('currency').validate(function (currency) {
  currency = currency.trim();
  return !_.isEmpty(currency) && currency.length <= 8;
}, 'Currency not allowed');

BusinessSchema.path('content').validate(function (content) {
  content = content.trim();
  return !_.isEmpty(content) ? content.length <= 80 * 1024 : true;
});

// Virtual
BusinessSchema.virtual('avatarKeyPrefix').get(function () {
  const { _id, owner } = this;
  return `uploads/${owner}/businesses/${_id}/images`;
});

BusinessSchema.virtual('contentKeyPrefix').get(function () {
  const { _id, owner } = this;
  return `uploads/${owner}/businesses/${_id}/content`;
});

// Middleware
BusinessSchema.pre('findOneAndUpdate', function (next) {
  this.options.runValidators = true;
  next();
});

// Class
class BusinessClass {
  uploadAvatar(avatar) {
    return s3Uploads.uploadAvatar(avatar, this.avatarKeyPrefix);
  }

  uploadContent(content) {
    return s3Uploads.uploadContent(content, this.contentKeyPrefix);
  }
}
BusinessSchema.loadClass(BusinessClass);

BusinessSchema.plugin(mongoosastic);

let Business = mongoose.model('Business', BusinessSchema);
let stream = Business.synchronize(), count = 0;

stream.on('data', function(err, doc) {
  count++;
});

stream.on('close', function() {
  console.log('indexed ' + count + ' business documents!');
});

stream.on('error', function(err) {
  console.log(err);
});

module.exports = { Business };
