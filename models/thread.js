const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const validator = require('validator');
const _ = require('lodash');

var Schema = mongoose.Schema;

var ThreadSchema = new mongoose.Schema({
  author: { type: Schema.ObjectId, ref: 'User', required: true },
  target: { type: Schema.ObjectId, ref: 'User', required: true },
  lastMessage: { type: Schema.ObjectId, ref: 'Message' }
}, {
  timestamps: true,
  retainKeyOrder: true
});

ThreadSchema.pre('findOneAndUpdate', function (next) {
  this.options.runValidators = true;
  next();
});

ThreadSchema.plugin(mongoosastic);

let Thread = mongoose.model('Thread', ThreadSchema);
let stream = Thread.synchronize(), count = 0;

stream.on('data', function(err, doc) {
  count++;
});

stream.on('close', function() {
  console.log('indexed ' + count + ' thread documents!');
});

stream.on('error', function(err) {
  console.log(err);
});

module.exports = { Thread };
