const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const validator = require('validator');
const _ = require('lodash');

var Schema = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
  author: { type: Schema.ObjectId, ref: 'User', required: true },
  target: { type: Schema.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
}, {
  timestamps: true,
  retainKeyOrder: true
});

MessageSchema.path('text').validate(function (text) {
  return !_.isEmpty(text) && text.length <= 2048;
}, 'Text must be present but less than 2048 characters');

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
