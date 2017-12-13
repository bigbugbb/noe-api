const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const { ObjectID } = require('mongodb');

const { Thread } = require('../models/thread');
const { authenticate } = require('../middleware/authenticate');

router.post('/threads', authenticate, async (req, res) => {
  let { author, target, text } = req.body;

  try {
    // upserting a thread rather than creating one so we can do data populating
    const thread = await Thread
      .findByIdAndUpdate(
        'non_existent', // use non-existent id to trigger the upsert
        {
          $set: {
            author,
            target,
            lastMessage: text,
            authorLastAccess: Date.now(),
            targetLastAccess: Date.now()
          }
        },
        { upsert: true, new: true }
      )
      .populate('author')
      .populate('target');

    res.send({ thread });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/users/:userId/threads', authenticate, async (req, res) => {
  const { userId } = req.params.userId;

  if (!ObjectID.isValid(userId)) {
    return res.status(404).send();
  }

  try {
    const threads = await Thread
      .find({ $or: [{ author: userId }, { target: userId }] })
      .populate('author')
      .populate('target');
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
    const thread = await Thread.findById(threadId)
      .populate('author')
      .populate('target');
    thread.lastMessage = lastMessage;
    thread.updateLastAccess(userId);

    res.send({ thread });
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;