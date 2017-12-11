const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const { ObjectID } = require('mongodb');
const { Message } = require('../models/message');
const { Thread } = require('../models/thread');
const { authenticate } = require('../middleware/authenticate');

const defaultPage = 1;
const defaultLimit = 20;

router.post('/messages', authenticate, async (req, res) => {
  let { author, target, text } = req.body;

  if (!ObjectID.isValid(author)) {
    return res.status(404).send();
  }
  if (!ObjectID.isValid(target)) {
    return res.status(404).send();
  }

  try {
    let message = await Message.create({ author, target, text });
    message = await Message.findById(message._id)
      .populate({ path: 'author', populate: { path: 'profile' } })
      .populate({ path: 'target', populate: { path: 'profile' } });
    let thread = await Thread.findOne({ author, target });
    if (_.isEmpty(thread)) {
      thread = await Thread.create({ author, target, message });
    } else {
      thread.lastMessage = message;
      await thread.save();
    }
    res.send({ message, thread });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/messages', authenticate, async (req, res) => {
  // let query = _.get(req, 'query', {});
  // let page  = _.toInteger(_.get(query, 'page', defaultPage));
  // let limit = _.toInteger(_.get(query, 'limit', defaultLimit));
  // let owner = _.get(query, 'owner', '');
  // let skip = limit * (page - 1);

  // query = _.omit(query, ['page', 'limit', 'owner']);

  // try {
  //   if (!_.isEmpty(owner)) {
  //     const values = await Business.find({ owner }).select('_id');
  //     _.set(query, 'business', { $in: values });
  //   }
  //   const total = await Order.count(query);
  //   const messages = await Order.find(query).skip(skip).limit(limit)
  //     .populate({ path: 'customer', populate: { path: 'profile' } })
  //     .populate('business');
  //   res.send({ total, page, limit, messages });
  // } catch (e) {
  //   res.status(400).send(e);
  // }
});

module.exports = router;