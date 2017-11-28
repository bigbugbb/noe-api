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

router.post('/schools', authenticate, async (req, res) => {
  let school = new School(req.body);

  try {
    school = await school.save();
    res.send(doc);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/schools', authenticate, async (req, res) => {
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
    const total = await School.count(params);
    const schools = await School.find(params).skip(skip).limit(limit);
    res.send({ total, page, limit, schools });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/schools/:id', authenticate, async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const school = await School.findById(id);
    if (!school) {
      return res.status(404).send();
    }

    res.send({ school });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch('/schools/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const body = _.omit(req.body, ['_id']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  let school = await School.findById(id);
  if (!school) {
    return res.status(404).send();
  }

  try {
    if (body.avatar.startsWith('data:')) {
      const response = await school.uploadAvatar(body.avatar);
      // Add ETag so the browser reloads image even if we have cache control
      body.avatar = response.Location + `?ETag=${response.ETag}`;
    }
    school = await School
      .findByIdAndUpdate(id, { $set: body }, { new: true })

    res.send({ school });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete('/schools/:id', authenticate, async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const school = await School.findOneAndRemove({ _id: id });
    if (!school) {
      return res.status(404).send();
    }

    res.send({ school });
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;