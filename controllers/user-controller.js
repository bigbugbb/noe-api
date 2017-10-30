const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const { ObjectID } = require('mongodb');
const { User } = require('../models/user');
const { authenticate } = require('../middleware/authenticate');

router.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'phone', 'password', 'role', 'firstname', 'lastname']);
  const user = new User(body);

  user.save().then(() => {
    return user.createProfile(body);
  }).then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    User.findById(user.id).populate('profile').then((user) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

router.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

router.post('/users/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

router.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

router.get('/users', (req, res) => {
  User.find().then((users) => {
    res.send({ users });
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/users/:id', (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  User.findById(id).then((user) => {
    if (!user) {
      return res.status(404).send();
    }

    res.send({ user });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// DELETES A USER FROM THE DATABASE
router.delete('/users/:id', function (req, res) {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  User.findByIdAndRemove(id).then((user) => {
    res.send({ user });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// UPDATES A SINGLE USER IN THE DATABASE
router.put('/users/:id', function (req, res) {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  User.findByIdAndUpdate(id).then((user) => {
    res.send({ user });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

module.exports = router;
