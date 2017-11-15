const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var Schema = mongoose.Schema;

var OrderSchema = new mongoose.Schema({
  student: { type: Schema.ObjectId, ref: 'Student' },
  business: { type: Schema.ObjectId, ref: 'Business' },
  stripeCharge: { type: String, trim: true },
  status: { type: String, enum: ['created', 'paid'], trim: true }
}, {
  timestamps: true,
  retainKeyOrder: true
});

var Order = mongoose.model('Order', OrderSchema);

module.exports = { Order };
