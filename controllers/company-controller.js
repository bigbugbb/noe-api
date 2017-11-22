const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const { ObjectID } = require('mongodb');
const { Company } = require('../models/company');
const { authenticate } = require('../middleware/authenticate');

const defaultPage = 1;
const defaultLimit = 20;
const defaultQueryParams = "[{}]";

router.post('/companies', authenticate, (req, res) => {
  const company = new Company(req.body);

  company.save().then(doc => {
    res.send(doc);
  }).catch(e => {
    res.status(400).send(e);
  });
});

router.get('/companies', authenticate, (req, res) => {
  let total = 0;
  let page  = _.toInteger(_.get(req, 'query.page', defaultPage));
  let limit = _.toInteger(_.get(req, 'query.limit', defaultLimit));
  let params = _.get(req, 'query.params', defaultQueryParams);

  try {
    params = _.first(JSON.parse(params));
  } catch (e) {
    console.log(e);
  }

  Company.count(params).then(count => {
    total = count;
    return Company.find(params)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
  }).then(companies => {
    res.send({ total, page, limit, companies });
  }, e => {
    res.status(400).send(e);
  });
});

router.get('/companies/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Company
    .findOne({ _id: id })
    .then(company => {
      if (!company) {
        return res.status(404).send();
      }

      res.send({ company });
    }, (e) => {
      res.status(400).send(e);
    });
});

router.patch('/companies/:id', authenticate, (req, res) => {
  const id = req.params.id;
  const body = _.omit(req.body, ['_id']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Company
    .findByIdAndUpdate({ _id: id }, { $set: body }, { new: true })
    .then(company => {
      if (!company) {
        return res.status(404).send();
      }

      res.send({ company });
    }).catch(e => {
      res.status(400).send(e);
    });
});

router.delete('/companies/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Company.findOneAndRemove({ _id: id }).then(company => {
    if (!company) {
      return res.status(404).send();
    }

    res.send({ company });
  }).catch(e => {
    res.status(400).send();
  });
});

module.exports = router;