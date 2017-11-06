const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var Schema = mongoose.Schema;

var ActivitySchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  type: { type: String, trim: true, required: true },
  summary: { type: String, trim: true, required: true },
  price: { type: Number, required: true },
  startTime: { type: Date, required: true },
  stopTime: { type: Date, required: true },
  itinerary: { type: String },
  email: {
    type: String, required: true, trim: true, minlength: 3, unique: true,
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

var Activity = mongoose.model('Activity', ActivitySchema);

module.exports = { Activity };
