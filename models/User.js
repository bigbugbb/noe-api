const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { Student } = require('./student');
const { School } = require('./school');
const { Company } = require('./company');

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
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true,
  retainKeyOrder: true,
  runSettersOnQuery: true, // Mongoose will not automatically lowercase the email in your queries
});

class UserClass {
  toJSON() {
    const user = this;
    const userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email', 'role', 'profile']);
  }

  createProfile(data) {
    const user = this;
    const RoleClass = { Student, School, Company };
    const profile = new RoleClass[user.role](_.pick(data, ['email', 'phone']));

    return profile.save().then(() => {
      const updates = {
        $set: {
          profile: profile._id
        }
      };
      return user.update(updates, { runValidators: true });
    });
  }

  generateAuthToken() {
    const user = this;
    const access = 'auth';
    const token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString();

    user.tokens.push({ access, token });

    return user.save().then(() => token);
  }

  sendEmailForPasswordReset() {
    const { email, resetPasswordToken } = this;

    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'hacfzha2kmduzch6@ethereal.email',
        pass: 'ehpTdaMdNdQpB9vErr'
      }
    });

    var mailOptions = {
      to: email,
      from: 'no-replay@e.noe.com',
      subject: 'Reset password',
      text: `
        You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://localhost:4200/auth/reset-password/${resetPasswordToken}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.
      `
    };

    return transporter.sendMail(mailOptions);
  }

  removeToken(token) {
    const user = this;
    const updates = {
      $pull: {
        tokens: { token }
      }
    };
    return user.update(updates, { runValidators: true });
  }

  static findByToken(token) {
    const User = this;
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return Promise.reject();
    }

    return User.findOne({
      '_id': decoded._id,
      'tokens.token': token,
      'tokens.access': 'auth'
    }).populate('profile');
  }

  static findByCredentials(email, password) {
    const User = this;

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