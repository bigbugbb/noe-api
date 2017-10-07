const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId;

var SchoolLocationSchema = new mongoose.Schema({
  city: { type: String, trim: true },
  state: { type: String, trim: true }
});

var LanguageSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  level: { type: String, trim: true }
});

var GpaSchema = new mongoose.Schema({
  peroid: { type: String, trim: true },
  grade: { type: Number }
});

var ResourceSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  link: { type: String, trim: true }
});

var StdTestSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  score: { type: Number, min: 0 }
});

var StudentSchema = new mongoose.Schema({
  userId: { type: ObjectId, index: {unique: true}, required: true, ref: 'User' },
  firstname: { type: String, trim: true },
  lastname: { type: String, trim: true },
  avatar: { type: String, trim: true },
  gender: { type: String, enum: ['male', 'female'], default: 'male' },
  nationality: { type: String, trim: true },
  birthday: { type: Date },
  email: { type: String, required: true, trim: true, minlength: 3, unique: true,
    validate: {
      validator: value => validator.isEmail(value),
      message: '{VALUE} is not a valid email'
    }
  },
  phone: { type: String, trim: true },
  introduction: { type: String, trim: true, default: 'Enter your self-introduction.' },
  pictures: [ResourceSchema],
  videos: [ResourceSchema],
  currentGrade: { type: String, trim: true },
  gradeApplying: { type: String, trim: true },
  annualBudget: { type: Number, min: 0, max: 10000000 },
  skills: [{ type: String, trim: true }],
  interests: [{ type: String, trim: true }],
  passportScans: [ResourceSchema],
  preferSchoolType: { type: String, enum: ['coed', 'all_girl', 'all_boy'], default: 'coed' },
  preferSchoolLocation: [SchoolLocationSchema],
  preferAccommodation: { type: String, enum: ['boarding', 'day school', 'apartment'], default: 'boarding' },
  language: [LanguageSchema],
  gpa: [GpaSchema],
  recommendations: [ResourceSchema],
  transcripts: [ResourceSchema],
  stdTests: [StdTestSchema],
  supplements: [ResourceSchema],
  createdAt: Date,
  updatedAt: Date
});

StudentSchema.pre('save', function(next) {
  var student = this;

  student.updatedAt = new Date();
  if (!student.createdAt) {
    student.createdAt = student.updatedAt;
  }

  next();
})

var Student = mongoose.model('Student', StudentSchema);

module.exports = {Student};
