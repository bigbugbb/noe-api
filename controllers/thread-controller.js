const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const { ObjectID } = require('mongodb');

const { Thread } = require('../models/thread');
const { authenticate } = require('../middleware/authenticate');

router.post('/threads', authenticate, async (req, res) => {
  let { author, target, text } = req.body;

  if (!ObjectID.isValid(author) || !ObjectID.isValid(target)) {
    return res.status(404).send();
  }

  try {
    let thread = await Thread.findOne({ $or: [{ author, target }, { target, author }] });
    if (_.isEmpty(thread)) {
      thread = await Thread.create({
        author, target, lastMessage: text,
        authorThreadState: { state: 'opened', messagesNotRead: 0 },
        targetThreadState: { state: 'closed', messagesNotRead: 1 }
      });
    } else {
      thread.lastMessage = text;
      thread.computeMessagesNotRead(author, target);
      await thread.save();
    }
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

router.patch('/threads/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const { user, state } = req.body;

  if (!ObjectID.isValid(id) || !ObjectID.isValid(user)) {
    return res.status(404).send();
  }
  if (_.isEmpty(state)) {
    return res.status(400).send();
  }

  try {
    let thread = await Thread.findById(id)
      .populate('author')
      .populate('target');
    await thread.updateState(user, state);

    res.send({ thread });
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;