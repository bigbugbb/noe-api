const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const { ObjectID } = require('mongodb');
const { School } = require('../models/school');
const { authenticate } = require('../middleware/authenticate');

const defaultPage = 1;
const defaultLimit = 20;
const defaultQueryParams = "[{}]";

router.post('/schools', authenticate, (req, res) => {
  const school = new School(req.body);

  school.save().then((doc) => {
    res.send(doc);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

router.get('/schools', authenticate, (req, res) => {
  let total = 0;
  let page  = _.toInteger(_.get(req, 'query.page', defaultPage));
  let limit = _.toInteger(_.get(req, 'query.limit', defaultLimit));
  let params = _.get(req, 'query.params', defaultQueryParams);

  try {
    params = _.first(JSON.parse(params));
  } catch (e) {
    console.log(e);
  }

  School.count(params).then((count) => {
    total = count;
    return School.find(params).skip(limit * (page - 1)).limit(limit).exec();
  }).then((schools) => {
    res.send({ total, page, limit, schools });
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/schools/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  School.findOne({
    _id: id
  }).then((school) => {
    if (!school) {
      return res.status(404).send();
    }

    res.send({ school });
  }, (e) => {
    res.status(400).send(e);
  });
});

router.patch('/schools/:id', authenticate, (req, res) => {
  const id = req.params.id;
  const body = _.omit(req.body, ['_id']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  School.findByIdAndUpdate({ _id: id }, { $set: body }, { new: true }).then((school) => {
    if (!school) {
      return res.status(404).send();
    }

    res.send({ school });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

router.delete('/schools/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  School.findOneAndRemove({ _id: id }).then((school) => {
    if (!school) {
      return res.status(404).send();
    }

    res.send({ school });
  }).catch((e) => {
    res.status(400).send();
  });
});

module.exports = router;