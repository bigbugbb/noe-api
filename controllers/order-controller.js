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
  const { customerId, businessId, price } = req.body;

  Order.create({
    customer: customerId, business: businessId, price, status: 'created'
  }).then(order => {
    const businessUpdate = Business
      .findByIdAndUpdate({ _id: businessId }, { $push: { orders: order } }, { new: true })
      .populate('orders');
    return Promise.all([ order, businessUpdate ]);
  }).then(values => {
    let order = values[0];
    order.business = values[1];
    res.send(order);
  }).catch(e => {
    res.status(400).send(e);
  });
});

router.post('/orders/:id/charges', authenticate, (req, res) => {
  const id = req.params.id;
  const source = _.get(req.body, 'source', '');
  const email = _.get(req.body, 'email', '');
  let doc;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isEmpty(source) || _.isEmpty(email)) {
    return res.status(400).send();
  }

  Order
    .findById(id)
    .populate('business').then(order => {
      if (!order) {
        return res.status(404).send();
      }
      doc = order;

      return stripe.charges.create({
        source,
        amount: order.business.price,
        currency: order.business.currency,
        description: "Charge for " + email,
        metadata: { order: id }
      });
    }).then(charge => {
      doc.stripeCharge = charge.id;
      doc.status = 'paid';
      return doc.save();
    }).then(order => {
      res.send({ order });
    }, (e) => {
      res.status(400).send(e);
    });
});

router.post('/orders/:id/charges/:chargeId/refunds', authenticate, (req, res) => {
  const id = req.params.id;
  const chargeId = req.params.chargeId;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  stripe.refunds.create({
    charge: chargeId, metadata: { order: id }
  }).then(refund => {
    const update = { refund: refund.id, status: 'refunded' };
    return Order
      .findByIdAndUpdate({ _id: id }, { $set: update }, { new: true })
      .populate('business');
  }).then(order => {
    res.send({ order });
  }, (e) => {
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