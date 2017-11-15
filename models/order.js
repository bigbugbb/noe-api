const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var Schema = mongoose.Schema;

var OrderSchema = new mongoose.Schema({
  student: { type: Schema.ObjectId, ref: 'Student', index: true },
  business: { type: Schema.ObjectId, ref: 'Business', index: true },
  stripeCharge: { type: String, trim: true },
  status: { type: String, enum: ['created', 'cancelled', 'paid', 'refunded'], trim: true }
}, {
  timestamps: true,
  retainKeyOrder: true
});

var Order = mongoose.model('Order', OrderSchema);

module.exports = { Order };
