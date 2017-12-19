const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const { ObjectID } = require('mongodb');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const { User } = require('../models/user');
const { Thread } = require('../models/thread');
const { Message } = require('../models/message');
const { authenticate } = require('../middleware/authenticate');

router.post('/threads', authenticate, async (req, res) => {
  let { author, target, text } = req.body;

  if (!ObjectID.isValid(author) || !ObjectID.isValid(target)) {
    return res.status(404).send();
  }

  let jabbers = (await User.find({
    _id: { $in: [ author, target ].map(v => ObjectId(v)) }
  }).populate('profile')).map(user => {
    const { name, avatar } = user.profile;
    return { id: user._id, name, avatar, lastAccess: Date.now() };
  });

  try {
    const thread = await Thread.create({
      author: jabbers[0], target: jabbers[1], lastMessage: text
    });

    res.send({ thread });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/users/:userId/threads', authenticate, async (req, res) => {
  const userId = ObjectId(req.params.userId);

  if (!ObjectID.isValid(userId)) {
    return res.status(404).send();
  }

  try {
    const match = {
      $or: [{ 'author.id': userId }, { 'target.id': userId }]
    };
    const inputParams = {
      t_id: '$_id',
      t_authorId: '$author.id',
      t_authorLastAccess: '$author.lastAccess',
      t_targetLastAccess: '$target.lastAccess'
    };
    const conds = [
      { $eq: ['$thread', '$$t_id'] },
      { $ne: ['$author', userId] },
      { $gte: ['$sentAt', {
            $cond: {
              if: { $eq: ['$$t_authorId', userId] },
              then: '$$t_authorLastAccess',
              else: '$$t_targetLastAccess'
            }
          }
        ]
      }
    ];
    const lookup = {
      from: 'messages',
      let: inputParams,
      pipeline: [
        { $match: { $expr: { $and: conds } } },
        { $limit: 20 }
      ],
      as: 'messagesNotRead'
    };

    const threads = await Thread.aggregate([
      { $match: match },
      { $lookup: lookup },
      { $addFields: { messagesNotRead: { $size: '$messagesNotRead' } } }
    ]);

    res.send({ threads });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch('/users/:userId/threads/:threadId', authenticate, async (req, res) => {
  const { userId, threadId } = req.params;
  const { lastMessage } = req.body;

  if (!ObjectID.isValid(userId) || !ObjectID.isValid(threadId)) {
    return res.status(404).send();
  }

  if (_.isEmpty(lastMessage)) {
    return res.status(400).send();
  }

  try {
    const thread = await Thread.findById(threadId);
    if (!thread.isUserInvolved(userId)) {
      throw new Error("User wasn't involved in this thread.");
    }
    thread.lastMessage = lastMessage;
    thread.updateLastAccess(userId);
    thread.save();

    res.send({ thread });
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;