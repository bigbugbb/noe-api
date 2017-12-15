const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const validator = require('validator');
const _ = require('lodash');

var Schema = mongoose.Schema;

var JabberSchema = new mongoose.Schema({
  id: {
    type: Schema.ObjectId,
    ref: 'User',
    index: true,
    required: true
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
  avatar: {
    type: String,
    trim: true,
    required: true
  },
  lastAccess: {
    type: Date,
    required: true
  }
}, {
  _id: false
})

var ThreadSchema = new mongoose.Schema({
  author: {
    type: JabberSchema,
    required: true
  },
  target: {
    type: JabberSchema,
    required: true
  },
  lastMessage: {
    type: String,
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
  isUserInvolved(userId) {
    return userId === this.author.id.toHexString() ||
      userId === this.target.id.toHexString();
  }

  updateLastAccess(userId) {
    if (userId === this.author.id.toHexString()) {
      this.author.lastAccess = Date.now();
    } else if (userId === this.target.id.toHexString()) {
      this.target.lastAccess = Date.now();
    } else {
      throw new Error("User wasn't involved in this thread.");
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
