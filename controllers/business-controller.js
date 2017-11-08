const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const { ObjectID } = require('mongodb');
const { Business } = require('../models/business');
const { authenticate } = require('../middleware/authenticate');

const defaultPage = 1;
const defaultLimit = 20;
const defaultQueryParams = "[{}]";

router.post('/businesses', authenticate, (req, res) => {
  const business = new Business(req.body);

  business.save().then(doc => {
    res.send(doc);
  }).catch(e => {
    res.status(400).send(e);
  });
});

router.get('/businesses', authenticate, (req, res) => {
  let total = 0;
  let page  = _.toInteger(_.get(req, 'query.page', defaultPage));
  let limit = _.toInteger(_.get(req, 'query.limit', defaultLimit));
  let params = _.get(req, 'query.params', defaultQueryParams);

  try {
    params = _.first(JSON.parse(params));
  } catch (e) {
    console.log(e);
  }

  Business.count(params).then(count => {
    total = count;
    return Business.find(params).skip(limit * (page - 1)).limit(limit).exec();
  }).then(businesses => {
    res.send({ total, page, limit, businesses });
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/businesses/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Business.findOne({ _id: id }).then(business => {
    if (!business) {
      return res.status(404).send();
    }

    res.send({ business });
  }, e => {
    res.status(400).send(e);
  });
});

router.patch('/businesses/:id', authenticate, (req, res) => {
  const id = req.params.id;
  const body = _.omit(req.body, ['_id']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Business.findByIdAndUpdate({ _id: id }, { $set: body }, { new: true }).then(business => {
    if (!business) {
      return res.status(404).send();
    }

    res.send({ business });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

router.delete('/businesses/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Business.findOneAndRemove({ _id: id }).then(business => {
    if (!business) {
      return res.status(404).send();
    }

    res.send({ business });
  }).catch((e) => {
    res.status(400).send();
  });
});

module.exports = router;