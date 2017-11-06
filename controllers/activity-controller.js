const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const { ObjectID } = require('mongodb');
const { Activity } = require('../models/activity');
const { authenticate } = require('../middleware/authenticate');

const defaultPage = 1;
const defaultLimit = 20;
const defaultQueryParams = "[{}]";

router.post('/activities', authenticate, (req, res) => {
  const activity = new Activity(req.body);

  activity.save().then(doc => {
    res.send(doc);
  }).catch(e => {
    res.status(400).send(e);
  });
});

router.get('/activities', authenticate, (req, res) => {
  let total = 0;
  let page  = _.toInteger(_.get(req, 'query.page', defaultPage));
  let limit = _.toInteger(_.get(req, 'query.limit', defaultLimit));
  let params = _.get(req, 'query.params', defaultQueryParams);

  try {
    params = _.first(JSON.parse(params));
  } catch (e) {
    console.log(e);
  }

  Activity.count(params).then(count => {
    total = count;
    return Activity.find(params).skip(limit * (page - 1)).limit(limit).exec();
  }).then(activities => {
    res.send({ total, page, limit, activities });
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/activities/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Activity.findOne({ _id: id }).then(activity => {
    if (!activity) {
      return res.status(404).send();
    }

    res.send({ activity });
  }, e => {
    res.status(400).send(e);
  });
});

router.patch('/activities/:id', authenticate, (req, res) => {
  const id = req.params.id;
  const body = _.omit(req.body, ['_id']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Activity.findByIdAndUpdate({ _id: id }, { $set: body }, { new: true }).then(activity => {
    if (!activity) {
      return res.status(404).send();
    }

    res.send({ activity });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

router.delete('/activities/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Activity.findOneAndRemove({ _id: id }).then(activity => {
    if (!activity) {
      return res.status(404).send();
    }

    res.send({ activity });
  }).catch((e) => {
    res.status(400).send();
  });
});

module.exports = router;