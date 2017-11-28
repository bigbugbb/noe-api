const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const { AWS } = require('../utils/aws-s3');
const { ObjectID } = require('mongodb');
const { Business } = require('../models/business');
const { authenticate } = require('../middleware/authenticate');

const defaultPage = 1;
const defaultLimit = 20;
const defaultQueryParams = JSON.stringify([{ status: 'active' }]);

router.post('/businesses', authenticate, async (req, res) => {
  let business = new Business(req.body);

  try {
    business = await business.save();
    res.send(business);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/businesses', authenticate, async (req, res) => {
  let page  = _.toInteger(_.get(req, 'query.page', defaultPage));
  let limit = _.toInteger(_.get(req, 'query.limit', defaultLimit));
  let params = _.get(req, 'query.params', defaultQueryParams);
  let skip = limit * (page - 1);

  try {
    params = _.first(JSON.parse(params));
  } catch (e) {
    console.log(e);
  }

  try {
    const total = await Business.count(params);
    const businesses = await Business
      .find(params).skip(skip).limit(limit).populate('orders');
    res.send({ total, page, limit, businesses });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/businesses/:id', authenticate, async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const business = await Business.findById(id).populate('orders');
    if (!business) {
      return res.status(404).send();
    }

    res.send({ business });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch('/businesses/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const body = _.omit(req.body, ['_id']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  let business = await Business.findById(id);
  if (!business) {
    return res.status(404).send();
  }

  try {
    if (body.avatar.startsWith('data:')) {
      const response = await business.uploadAvatar(body.avatar);
      // Add ETag so the browser reloads image even if we have cache control
      body.avatar = response.Location + `?ETag=${response.ETag}`;
    }
    business = await Business
      .findByIdAndUpdate(id, { $set: body }, { new: true })
      .populate('orders')

    res.send({ business });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete('/businesses/:id', authenticate, async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const business = await Business.findOneAndRemove({ _id: id });
    if (!business) {
      return res.status(404).send();
    }

    res.send({ business });
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;