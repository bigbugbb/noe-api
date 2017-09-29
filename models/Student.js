const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var StudentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    default: 'male'
  },
  gpa: {
    type: Number    
  },
  toefl: {
    type: Number
  },
  tuition: {
    type: Number
  },
  introduction: {
    type: String,
    required: true
  },
  skills: [{
    skill: {
      type: String
    }
  }],
  prizes: [{
    prize: {
      type: String
    }
  }]
});

var Student = mongoose.model('Student', StudentSchema);

module.exports = {Student};
