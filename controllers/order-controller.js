const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const { ObjectID } = require('mongodb');
const { Student } = require('../models/student');
const { Business } = require('../models/business');
const { Order } = require('../models/order');
const { authenticate } = require('../middleware/authenticate');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

const defaultPage = 1;
const defaultLimit = 20;

router.post('/orders', authenticate, async (req, res) => {
  const { customerId, businessId, price } = req.body;

  try {
    const order = await Order.create({
      customer: customerId, business: businessId, price, status: 'created'
    });
    order.business = await Business
      .findByIdAndUpdate({ _id: businessId }, { $push: { orders: order } }, { new: true })
      .populate({ path: 'customer', populate: { path: 'profile' } })
      .populate('orders');
    res.send(order);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/orders/:id/charges', authenticate, async (req, res) => {
  const id = req.params.id;
  const source = _.get(req.body, 'source', '');
  const email = _.get(req.body, 'email', '');

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isEmpty(source) || _.isEmpty(email)) {
    return res.status(400).send();
  }

  try {
    let order = await Order.findById(id).populate('business');
    if (!order) {
      return res.status(404).send();
    }

    const charge = await stripe.charges.create({
      source,
      amount: order.business.price,
      currency: order.business.currency,
      description: "Charge for " + email,
      metadata: { order: id }
    });
    order.charge = charge.id;
    order.status = 'paid';
    order = await order.save();

    res.send({ order });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/orders/:id/charges/:chargeId/refunds', authenticate, async (req, res) => {
  const id = req.params.id;
  const chargeId = req.params.chargeId;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const refund = await stripe.refunds.create({
      charge: chargeId, metadata: { order: id }
    });
    const update = { refund: refund.id, status: 'refunded' };
    const order = await Order
      .findByIdAndUpdate({ _id: id }, { $set: update }, { new: true })
      .populate({ path: 'customer', populate: { path: 'profile' } })
      .populate('business');
    res.send({ order });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/orders', authenticate, async (req, res) => {
  let query = _.get(req, 'query', {});
  let page  = _.toInteger(_.get(query, 'page', defaultPage));
  let limit = _.toInteger(_.get(query, 'limit', defaultLimit));
  let owner = _.get(query, 'owner', '');
  let skip = limit * (page - 1);

  query = _.omit(query, ['page', 'limit', 'owner']);

  try {
    if (!_.isEmpty(owner)) {
      const values = await Business.find({ owner }).select('_id');
      _.set(query, 'business', { $in: values });
    }
    const total = await Order.count(query);
    const orders = await Order.find(query).skip(skip).limit(limit)
      .populate({ path: 'customer', populate: { path: 'profile' } })
      .populate('business');
    res.send({ total, page, limit, orders });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/orders/:id', authenticate, async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const order = await Order.findById(id)
      .populate({ path: 'customer', populate: { path: 'profile' } })
      .populate('business');
    if (!order) {
      return res.status(404).send();
    }
    res.send({ order });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch('/orders/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const body = _.omit(req.body, ['_id']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const order = await Order
      .findByIdAndUpdate({ _id: id }, { $set: body }, { new: true })
      .populate({ path: 'customer', populate: { path: 'profile' } })
      .populate('business');
    if (!order) {
      return res.status(404).send();
    }
    res.send({ order });
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;