const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const { ObjectID } = require('mongodb');
const { Message } = require('../models/message');
const { Thread } = require('../models/thread');
const { authenticate } = require('../middleware/authenticate');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const defaultPage = 1;
const defaultLimit = 30;

router.post('/messages', authenticate, async (req, res) => {
  let { author, target, text, thread } = req.body;

  if (!ObjectID.isValid(author) || !ObjectID.isValid(target)) {
    return res.status(404).send();
  }

  try {
    let message = await Message.create({ author, target, text, thread });
    res.send({ message });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/threads/:threadId/messages', authenticate, async (req, res) => {
  let query = _.get(req, 'query', {});
  let limit = _.toInteger(_.get(query, 'limit', defaultLimit));
  let lastTime = _.toInteger(_.get(query, 'lastTime', Date.now()));
  let threadId = ObjectId(req.params.threadId);

  if (!ObjectID.isValid(threadId)) {
    return res.status(404).send();
  }

  try {
    const conds = [{ $eq: ['$_id', '$$t_threadId'] }];
    const match = {
      thread: threadId,
      sentAt: { $lt: new Date(lastTime) }
    };

    const count = await Message.count(match);
    const messages = await Message.aggregate([
      { $match: match },
      { $skip: Math.max(0, count - limit) },
      { $lookup: {
          from: 'threads',
          let: { t_threadId: '$thread' },
          pipeline: [{ $match: { $expr: { $and: conds } } }],
          as: 'thread'
        }
      },
      { $unwind: '$thread' }
    ]);

    res.send({ messages });
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;