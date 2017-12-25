const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const validator = require('validator');
const _ = require('lodash');

var Schema = mongoose.Schema;

// Later sometime we may seprate the contact feature
// out of the api server, so try to interact little
// with collections except for threads.
var MessageSchema = new mongoose.Schema({
  author: { type: Schema.ObjectId, required: true }, // ref: 'User'
  target: { type: Schema.ObjectId, required: true }, // ref: 'User'
  text: { type: String, required: true },
  sentAt: { type: Date, index: true, default: Date.now },
  thread: { type: Schema.ObjectId, index: true, required: true }
}, {
  retainKeyOrder: true
});

MessageSchema.path('text').validate(function (text) {
  return !_.isEmpty(text) && text.length <= 640;
}, 'Text must be present but less than 640 characters');

MessageSchema.pre('findOneAndUpdate', function (next) {
  this.options.runValidators = true;
  next();
});

MessageSchema.plugin(mongoosastic);

let Message = mongoose.model('Message', MessageSchema);
let stream = Message.synchronize(), count = 0;

stream.on('data', function(err, doc) {
  count++;
});

stream.on('close', function() {
  console.log('indexed ' + count + ' message documents!');
});

stream.on('error', function(err) {
  console.log(err);
});

module.exports = { Message };
