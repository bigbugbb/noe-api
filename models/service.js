const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var Schema = mongoose.Schema;

var ServiceSchema = new mongoose.Schema({
  companyId: { type: Schema.ObjectId, index: true },
  avatar: { type: String, trim: true, required: true },
  name: { type: String, trim: true, required: true },
  type: { type: String, trim: true, required: true },
  summary: { type: String, trim: true, required: true },
  media: [{ type: String, trim: true }],
  price: { type: Number, required: true },
  email: {
    type: String, trim: true, minlength: 3,
    validate: {
      validator: value => validator.isEmail(value),
      message: '{VALUE} is not a valid email'
    }
  },
  phone: { type: String, trim: true },
}, {
  timestamps: true,
  retainKeyOrder: true
});

var Service = mongoose.model('Service', ServiceSchema);

module.exports = { Service };
