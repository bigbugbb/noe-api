const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const { ObjectID } = require('mongodb');
const { Student } = require('../models/student');
const { authenticate } = require('../middleware/authenticate');

const defaultPage = 1;
const defaultLimit = 20;
const defaultQueryParams = "[{}]";

router.post('/students', authenticate, (req, res) => {
  const student = new Student(req.body);

  student.save().then(doc => {
    res.send(doc);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

router.get('/students', authenticate, (req, res) => {
  let total = 0;
  let page  = _.toInteger(_.get(req, 'query.page', defaultPage));
  let limit = _.toInteger(_.get(req, 'query.limit', defaultLimit));
  let params = _.get(req, 'query.params', defaultQueryParams);

  try {
    params = _.first(JSON.parse(
      params.replace(/\"min\"/g, '\"$gte\"').replace(/\"max\"/g, '\"$lte\"')
    ));
  } catch (e) {
    console.log(e);
  }

  Student.count(params).then((count) => {
    total = count;
    return Student
      .find(params)
      .skip(limit * (page - 1))
      .limit(limit)
      .populate('orders')
      .exec();
  }).then(students => {
    res.send({ total, page, limit, students });
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/students/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Student.findOne({ _id: id }).populate('orders').then(student => {
    if (!student) {
      return res.status(404).send();
    }

    res.send({ student });
  }, (e) => {
    res.status(400).send(e);
  });
});

router.patch('/students/:id', authenticate, (req, res) => {
  const id = req.params.id;
  const body = _.omit(req.body, ['_id']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Student
    .findByIdAndUpdate({ _id: id }, { $set: body }, { new: true })
    .populate('orders')
    .then(student => {
      if (!student) {
        return res.status(404).send();
      }

      res.send({ student });
    }).catch((e) => {
      res.status(400).send(e);
    });
});

router.delete('/students/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Student.findOneAndRemove({ _id: id }).then(student => {
    if (!student) {
      return res.status(404).send();
    }

    res.send({ student });
  }).catch((e) => {
    res.status(400).send();
  });
});

module.exports = router;