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
    creator: { type: String, enum: ['customer', 'business'], default: 'customer', trim: true },
    name: { type: String, trim: true },
    time: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['created', 'paid', 'canceled', 'refunded', 'served'], trim: true }
}, {
  timestamps: true,
  retainKeyOrder: true
});

var Order = mongoose.model('Order', OrderSchema);

module.exports = { Order };
