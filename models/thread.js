const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const validator = require('validator');
const _ = require('lodash');

var Schema = mongoose.Schema;

var ThreadStateSchema = new mongoose.Schema({
  state: {
    type: String,
    enum: ['opened', 'closed'],
    required: true
  },
  messagesNotRead: {
    type: Number,
    min: 0,
    required: true
  }
});

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
  authorThreadState: ThreadStateSchema,
  targetThreadState: ThreadStateSchema
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
  computeMessagesNotRead(author, target) {
    const ats = this.authorThreadState;
    const tts = this.targetThreadState;
    const authorString = this.author.toHexString();

    if (author === authorString) {
      tts.messagesNotRead += _.isEqual(tts.state, 'closed') ? 1 : 0;
    } else if (target === authorString) {
      ats.messagesNotRead += _.isEqual(ats.state, 'closed') ? 1 : 0;
    }
  }

  async updateState(user, state) {
    const { author, target } = this;

    if (user === author.id) {
      this.authorThreadState = { state, messagesNotRead: 0 };
    } else if (user === target.id) {
      this.targetThreadState = { state, messagesNotRead: 0 };
    }

    await this.save();
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
