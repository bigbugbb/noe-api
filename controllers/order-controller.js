const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const { ObjectID } = require('mongodb');
const { Student } = require('../models/student');
const { Business } = require('../models/business');
const { Order } = require('../models/order');
const { authenticate } = require('../middleware/authenticate');
// const stripe = require('stripe')(process.env.STRIPE_API_KEY);

const defaultPage = 1;
const defaultLimit = 20;
const defaultQueryParams = "[{}]";

router.post('/orders', authenticate, (req, res) => {
  const { studentId, businessId } = req.body;

  Order.create({
    student: studentId, business: businessId, status: 'created'
  }).then(order => {
    const studentUpdate = Student
      .findByIdAndUpdate({ _id: studentId }, { $push: { orders: order } }, { new: true })
      .populate('orders');
    const businessUpdate = Business
      .findByIdAndUpdate({ _id: businessId }, { $push: { orders: order } }, { new: true })
      .populate('orders');
    return Promise.all([ order, studentUpdate, businessUpdate ]);
  }).then(values => {
    let order = values[0];
    order.student = values[1];
    order.business = values[2];
    res.send(order);
  }).catch(e => {
    res.status(400).send(e);
  });
});

router.get('/orders', authenticate, (req, res) => {
  let total = 0;
  let page  = _.toInteger(_.get(req, 'query.page', defaultPage));
  let limit = _.toInteger(_.get(req, 'query.limit', defaultLimit));
  let params = _.get(req, 'query.params', defaultQueryParams);

  try {
    params = _.first(JSON.parse(params));
  } catch (e) {
    console.log(e);
  }

  Order.count(params).then((count) => {
    total = count;
    return Order
      .find(params)
      .skip(limit * (page - 1))
      .limit(limit)
      .populate('student')
      .populate('business')
      .exec();
  }).then(orders => {
    res.send({ total, page, limit, orders });
  }, e => {
    res.status(400).send(e);
  });
});

router.get('/orders/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Order
    .findOne({ _id: id })
    .populate('student')
    .populate('business')
    .then(order => {
      if (!order) {
        return res.status(404).send();
      }

      res.send({ order });
    }, e => {
      res.status(400).send(e);
    });
});

router.patch('/orders/:id', authenticate, (req, res) => {
  const id = req.params.id;
  const body = _.omit(req.body, ['_id']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Order
    .findByIdAndUpdate({ _id: id }, { $set: body }, { new: true })
    .populate('student')
    .populate('business')
    .then(order => {
      if (!order) {
        return res.status(404).send();
      }

      res.send({ order });
    }).catch(e => {
      res.status(400).send(e);
    });
});

// router.delete('/orders/:id', authenticate, (req, res) => {
//   const id = req.params.id;

//   if (!ObjectID.isValid(id)) {
//     return res.status(404).send();
//   }

//   Order.findOneAndRemove({ _id: id }).then(order => {
//     if (!order) {
//       return res.status(404).send();
//     }

//     res.send({ order });
//   }).catch(e => {
//     res.status(400).send();
//   });
// });

module.exports = router;