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

router.post('/students', authenticate, async (req, res) => {
  let student = new Student(req.body);

  try {
    student = await student.save();
    res.send(student);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/students', authenticate, async (req, res) => {
  let page  = _.toInteger(_.get(req, 'query.page', defaultPage));
  let limit = _.toInteger(_.get(req, 'query.limit', defaultLimit));
  let params = _.get(req, 'query.params', defaultQueryParams);
  let skip = limit * (page - 1);

  try {
    params = _.first(JSON.parse(
      params.replace(/\"min\"/g, '\"$gte\"').replace(/\"max\"/g, '\"$lte\"')
    ));
  } catch (e) {
    console.log(e);
  }

  try {
    const total = await Student.count(params);
    const students = await Student.find(params).skip(skip).limit(limit);
    res.send({ total, page, limit, students });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/students/:id', authenticate, async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).send();
    }

    res.send({ student });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch('/students/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const body = _.omit(req.body, ['_id']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const student = await Student
      .findByIdAndUpdate({ _id: id }, { $set: body }, { new: true });
    if (!student) {
      return res.status(404).send();
    }

    res.send({ student });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete('/students/:id', authenticate, async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const student = await Student.findOneAndRemove({ _id: id });
    if (!student) {
      return res.status(404).send();
    }

    res.send({ student });
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;