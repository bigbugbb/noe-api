const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const { ObjectID } = require('mongodb');
const { Service } = require('../models/service');
const { authenticate } = require('../middleware/authenticate');

const defaultPage = 1;
const defaultLimit = 20;
const defaultQueryParams = "[{}]";

router.post('/services', authenticate, (req, res) => {
  const service = new Service(req.body);

  service.save().then(doc => {
    res.send(doc);
  }).catch(e => {
    res.status(400).send(e);
  });
});

router.get('/services', authenticate, (req, res) => {
  let total = 0;
  let page  = _.toInteger(_.get(req, 'query.page', defaultPage));
  let limit = _.toInteger(_.get(req, 'query.limit', defaultLimit));
  let params = _.get(req, 'query.params', defaultQueryParams);

  try {
    params = _.first(JSON.parse(params));
  } catch (e) {
    console.log(e);
  }

  Service.count(params).then(count => {
    total = count;
    return Service.find(params).skip(limit * (page - 1)).limit(limit).exec();
  }).then(services => {
    res.send({ total, page, limit, services });
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/services/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Service.findOne({ _id: id }).then(service => {
    if (!service) {
      return res.status(404).send();
    }

    res.send({ service });
  }, e => {
    res.status(400).send(e);
  });
});

router.patch('/services/:id', authenticate, (req, res) => {
  const id = req.params.id;
  const body = _.omit(req.body, ['_id']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Service.findByIdAndUpdate({ _id: id }, { $set: body }, { new: true }).then(service => {
    if (!service) {
      return res.status(404).send();
    }

    res.send({ service });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

router.delete('/services/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Service.findOneAndRemove({ _id: id }).then(service => {
    if (!service) {
      return res.status(404).send();
    }

    res.send({ service });
  }).catch((e) => {
    res.status(400).send();
  });
});

module.exports = router;