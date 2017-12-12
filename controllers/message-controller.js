const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const { ObjectID } = require('mongodb');
const { Message } = require('../models/message');
const { Thread } = require('../models/thread');
const { authenticate } = require('../middleware/authenticate');

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
  let threadId = req.params.threadId;

  if (!ObjectID.isValid(threadId)) {
    return res.status(404).send();
  }

  try {
    const messages = await Message.find({
      thread: threadId,
      sentAt: { $lt: lastTime }
    }).limit(limit).sort({ sentAt: 1 });

    res.send({ messages });
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;