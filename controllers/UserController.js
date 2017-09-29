const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bodyParser = require('body-parser');
const db = require('../db');
const {ObjectID} = require('mongodb');

router.use(bodyParser.json());
const User = require('../models/User');

router.post('/', (req, res) => {
  const body = _.pick(req.body, ['email', 'phone', 'password', 'firstname', 'lastname']);
  const user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

router.get('/', (req, res) => {
  User.find().then((users) => {
    res.send({users});
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/:id', (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  User.findById(id).then((user) => {
    if (!user) {
      return res.status(404).send();
    }

    res.send({user});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// DELETES A USER FROM THE DATABASE
router.delete('/:id', function (req, res) {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  User.findByIdAndRemove(id).then((user) => {    
    res.send({user});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// UPDATES A SINGLE USER IN THE DATABASE
router.put('/:id', function (req, res) {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  User.findByIdAndUpdate(id).then((user) => {
    res.send({user});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

module.exports = router;
