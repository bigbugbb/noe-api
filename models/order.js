const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const validator = require('validator');
const _ = require('lodash');

var Schema = mongoose.Schema;

var OrderEventSchema = new mongoose.Schema({
  creator: {
    type: String,
    enum: ['customer', 'business'],
    default: 'customer'
  },
  name: String,
  time: {
    type: Date,
    default: Date.now
  }
})

var OrderSchema = new mongoose.Schema({
  customer: {
    type: Schema.ObjectId,
    ref: 'User',
    require: true,
    es_indexed: true
  },
  business: { type: Schema.ObjectId, ref: 'Business', es_indexed: true },
  price: { type: Number, min: 0, max: 100000000, es_indexed: true },
  charge: { type: String, es_indexed: true },
  refund: { type: String, es_indexed: true },
  events: {
    type: [OrderEventSchema],
    es_indexed: true,
    es_type: 'nested',
    es_include_in_parent: true
  },
  status: {
    type: String,
    enum: ['created', 'paid', 'canceled', 'refunded', 'served'],
    es_indexed: true
  }
}, {
  timestamps: true,
  retainKeyOrder: true,
  usePushEach: true
});

OrderSchema.pre('findOneAndUpdate', function (next) {
  this.options.runValidators = true;
  next();
});

OrderSchema.plugin(mongoosastic);

let Order = mongoose.model('Order', OrderSchema);
let stream = Order.synchronize(), count = 0;

stream.on('data', function(err, doc) {
  count++;
});

stream.on('close', function() {
  console.log('indexed ' + count + ' order documents!');
});

stream.on('error', function(err) {
  console.log(err);
});

module.exports = { Order };
