const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const validator = require('validator');
const _ = require('lodash');

var Schema = mongoose.Schema;

var ThreadSchema = new mongoose.Schema({
  author: {
    type: Schema.ObjectId,
    ref: 'User',
    index: true,
    required: true
  },
  target: {
    type: Schema.ObjectId,
    ref: 'User',
    index: true,
    required: true
  },
  lastMessage: {
    type: String,
    required: true
  },
  authorLastAccess: {
    type: Date,
    required: true
  },
  targetLastAccess: {
    type: Date,
    required: true
  }
}, {
  timestamps: true,
  retainKeyOrder: true
});

ThreadSchema.path('lastMessage').validate(function (lastMessage) {
  return !_.isEmpty(lastMessage) && lastMessage.length <= 640;
}, 'Last message must be present but less than 640 characters');

ThreadSchema.pre('findOneAndUpdate', function (next) {
  this.options.runValidators = true;
  next();
});

class ThreadClass {
  updateLastAccess(userId) {
    if (userId === this.author.id) {
      this.authorLastAccess = Date.now();
    } else if (userId === this.target.id) {
      this.targetLastAccess = Date.now();
    }
  }
}
ThreadSchema.loadClass(ThreadClass);

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
