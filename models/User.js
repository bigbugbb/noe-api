const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const { Student } = require('./student');

const Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    unique: true,
    lowercase: true,
    validate: {
      validator: value => validator.isEmail(value),
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 64
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }],
  role: {
    type: String,
    enum: ['Student', 'School', 'Company'],
    default: 'Student',
    required: true
  },
  profile: {
    type: Schema.ObjectId,
    refPath: 'role'
  }
}, {
  timestamps: true,
  retainKeyOrder: true,
  runSettersOnQuery: true, // Mongoose will not automatically lowercase the email in your queries
});

class UserClass {
  toJSON() {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email', 'role', 'profile']);
  }

  createProfile() {
    var user = this;
    const RoleClass = { Student };
    var profile = new RoleClass[user.role](_.pick(user, ['email', 'phone', 'firstname', 'lastname']));

    return profile.save().then(() => {
      return user.update({ $set: { profile: profile._id }});
    });
  }

  generateAuthToken() {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString();

    user.tokens.push({ access, token });

    return user.save().then(() => token);
  }

  removeToken(token) {
    var user = this;

    return user.update({
      $pull: {
        tokens: { token }
      }
    });
  }

  static findByToken(token) {
    var User = this;
    var decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return Promise.reject();
    }

    return User.findOne({
      '_id': decoded._id,
      'tokens.token': token,
      'tokens.access': 'auth'
    })
    .populate('profile');
  }

  static findByCredentials(email, password) {
    var User = this;

    return User.findOne({ email }).populate('profile').then((user) => {
      if (!user) {
        return Promise.reject();
      }

      return new Promise((resolve, reject) => {
        // Use bcrypt.compare to compare password and user.password
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
            resolve(user);
          } else {
            reject();
          }
        });
      });
    });
  }
}

UserSchema.loadClass(UserClass);

UserSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = { User };