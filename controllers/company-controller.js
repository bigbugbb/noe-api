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

router.post('/companies', authenticate, async (req, res) => {
  let company = new Company(req.body);

  try {
    company = await company.save();
    res.send(company);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/companies', authenticate, async (req, res) => {
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
    const total = await Company.count(params);
    const companies = await Company.find(params).skip(skip).limit(limit);
    res.send({ total, page, limit, companies });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/companies/:id', authenticate, async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).send();
    }

    res.send({ company });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch('/companies/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const body = _.omit(req.body, ['_id']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  let company = await Company.findById(id);
  if (!company) {
    return res.status(404).send();
  }

  try {
    if (body.avatar.startsWith('data:')) {
      const response = await company.uploadAvatar(body.avatar);
      // Add ETag so the browser reloads image even if we have cache control
      body.avatar = response.Location + `?ETag=${response.ETag}`;
    }
    company = await Company
      .findByIdAndUpdate(id, { $set: body }, { new: true });

    res.send({ company });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete('/companies/:id', authenticate, async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const company = await Company.findOneAndRemove({ _id: id });
    if (!company) {
      return res.status(404).send();
    }

    res.send({ company });
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;