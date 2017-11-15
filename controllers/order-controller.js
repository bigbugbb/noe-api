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
const defaultQueryParams = "[{}]";

router.post('/orders', authenticate, (req, res) => {
  const { studentId, businessId } = req.body;
  let student, business;

  Promise.all([
    Student.findById(studentId), Business.findById(businessId)
  ]).then(values => {
    student = values[0]; business = values[1];
    return new Order({
      student: studentId, business: businessId, status: 'created'
    }).save();
  }).then(doc => {
    student.orders.push(doc); business.orders.push(doc);
    return Promise.all([ doc, student.save(), business.save() ]);
  }).then(values => {
    let doc = values[0];
    doc.student = values[1];
    doc.business = values[2];
    res.send(doc);
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
    return Order.find(params).skip(limit * (page - 1)).limit(limit).exec();
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

  Order.findOne({ _id: id }).then(order => {
    if (!order) {
      return res.status(404).send();
    }

    res.send({ order });
  }, (e) => {
    res.status(400).send(e);
  });
});

router.patch('/orders/:id', authenticate, (req, res) => {
  const id = req.params.id;
  const body = _.omit(req.body, ['_id']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Order.findByIdAndUpdate({ _id: id }, { $set: body }, { new: true }).then((order) => {
    if (!order) {
      return res.status(404).send();
    }

    res.send({ order });
  }).catch((e) => {
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