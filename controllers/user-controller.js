const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db = require('../db');
const crypto = require('crypto');
const { ObjectID } = require('mongodb');
const { User } = require('../models/user');
const { authenticate } = require('../middleware/authenticate');

router.post('/users', async (req, res) => {
  const body = _.pick(req.body, ['email', 'phone', 'password', 'role']);

  try {
    let user = await User.createUserWithProfile(body);
    const token = await user.generateAuthToken();
    user = await User.findById(user.id).populate('profile');
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/users/login', async (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  try {
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/users/forgot-password', async (req, res) => {
  try {
    let user = await User.findOneAndUpdate(
      { email: req.body.email },
      { $set: {
          resetPasswordToken: crypto.randomBytes(20).toString('hex'),
          resetPasswordExpires: Date.now() + 3600000
        }
      },
      { new: true }
    );
    user = await user.sendEmailForPasswordReset();
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/users/reset-password/:resetPasswordToken', async (req, res) => {
  const password = _.get(req.body, 'password', '');
  const resetPasswordToken = req.params.resetPasswordToken;

  if (_.isEmpty(password) || _.isEmpty(resetPasswordToken)) {
    return res.status(404).send();
  }

  try {
    const user = await User.findOne({
      resetPasswordToken, resetPasswordExpires: { $gt: Date.now() }
    }).populate('profile');

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const token = await user.generateAuthToken();

    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete('/users/me/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.send({ users });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/users/:id', async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const user = await User.findById(id).populate('profile');
    if (!user) {
      return res.status(404).send();
    }

    res.send({ user });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete('/users/:id', async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const user = await User.findByIdAndRemove(id);
    res.send({ user });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.put('/users/:id', async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const user = await User.findByIdAndUpdate(id).populate('profile');
    res.send({ user });
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
