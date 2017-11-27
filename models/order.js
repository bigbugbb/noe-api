const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var Schema = mongoose.Schema;

var OrderSchema = new mongoose.Schema({
  customer: { type: Schema.ObjectId, ref: 'User', index: true },
  business: { type: Schema.ObjectId, ref: 'Business', index: true },
  price: { type: Number, min: 0, max: 100000000 },
  charge: { type: String, trim: true },
  refund: { type: String, trim: true },
  events: [{
    time: { type: Date, default: Date.now },
    name: { type: String, trim: true }
  }],
  status: { type: String, enum: ['created', 'paid', 'canceled', 'refunded'], trim: true }
}, {
  timestamps: true,
  retainKeyOrder: true
});

var Order = mongoose.model('Order', OrderSchema);

module.exports = { Order };
