const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var Schema = mongoose.Schema;

var SchoolSchema = new mongoose.Schema({
  // basic info
  name: { type: String, trim: true, required: true },
  type: { type: String, trim: true, required: true },
  religion: { type: String, trim: true, required: true },
  grade: { type: String, trim: true, required: true },
  builtAt: { type: Number, min: 1800, max: 2050 },
  students: { type: Number, min: 1, max: 100000 },
  avgClassSize: { type: Number, min: 1, max: 1000 },
  teachers: { type: Number, min: 1, max: 20000 },
  advTeachers: { type: Number, min: 1, max: 20000 },
  overseaStudents: { type: Number, min: 0, max: 50000 },
  accommodation: { type: String, trim: true },
  introduction: { type: String, trim: true },
  // location
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  zipcode: { type: Number },
  country: { type: String, trim: true },
  weather: { type: String, trim: true },
  airport: { type: String, trim: true },
  // international student tuition
  tuition: { type: Number, min: 0, max: 1000000 },
  applicationFee: { type: Number, min: 0 },
  i20Fee: { type: Number, min: 0 },
  guidanceFee: { type: Number, min: 0 },

}, {
  timestamps: true,
  retainKeyOrder: true
});

var School = mongoose.model('School', SchoolSchema);

module.exports = { School };
