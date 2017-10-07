const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const {ObjectID} = require('mongodb');
const {Student} = require('../models/student');
const {authenticate} = require('../middleware/authenticate');

router.post('/students', authenticate, (req, res) => {
  const userId = req.body.userId;

  if (!ObjectID.isValid(userId)) {
    return res.status(404).send();
  }
  // const body = _.pick(req.body, ['firstname', 'lastname']);
  const student = new Student(req.body);

  student.save().then(() => {
    res.send(student);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

module.exports = router;