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
  avatar: { type: String, trim: true, default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIAAgMAAACJFjxpAAAADFBMVEXFxcX////p6enW1tbAmiBwAAAFiElEQVR4AezAgQAAAACAoP2pF6kAAAAAAAAAAAAAAIDbu2MkvY0jiuMWWQoUmI50BB+BgRTpCAz4G6C8CJDrC3AEXGKPoMTlYA/gAJfwETawI8cuBs5Nk2KtvfiLW+gLfK9m+r3X82G653+JP/zjF8afP1S//y+An4/i51//AsB4aH+/QPD6EQAY/zwZwN8BAP50bh786KP4+VT+3fs4/noigEc+jnHeJrzxX+NWMDDh4g8+EXcnLcC9T8U5S/CdT8bcUeBEIrwBOiI8ki7Ba5+NrePgWUy89/nYyxQ8Iw3f+pWY4h1gb3eAW7sDTPEOsLc7wK1TIeDuDB+I/OA1QOUHv/dFsZQkhKkh4QlEfOULYz2nGj2/Nn1LmwR/86VxlCoAW6kCsHRGANx1RgCMo5Qh2EsZgrXNQZZShp5Liv7Il8eIc5C91EHY2hxk6bwYmNscZIReDBwtCdhbErC1JGBpScBcOgFMLQsZMQs5Whayd+UQsLYsZGlZyNyykKllISNmIUfAwifw8NXvTojAjGFrdYi11SGWVoeYWx1i6lmQCiEjFkKOVgjZ+xxIhZCtFULWHkCqxCw9gNQKmP9vNHzipdEPrRcxtVbAeDkAvve0iM2QozVD9hfjhp4YP/UrkJYDbD2AtBxgfSkAvvHEeNcDSAsilgtAWxIy91J8AXgZAJ5e33+4tuACcAG4AFwALgBXRXQB6AFcB5MXAuA6nl9/0Vx/011/1V5/1/dfTPJvRtdnu/zL6beeFO/7r+fXBYbrEkt/j+i6ytXfpuvvE/ZXOnsA/a3a/l5xf7O6v1t+Xe/vOyz6HpO8yyboM8o7rfJes77bru83THk48p7TvOs27zvOO6/73vO++z7l4cgnMPQzKPopHC0N9noSSz6LJp/Gk88jyicy5TOp6qlc+VyyfDJbPpuuns6XzyfMJzTmMyrrKZ35nNJ8Ums+q7af1tvPK+4nNodEnPKp3fnc8npyez67/qVP7+/fL8hfcMjfsOhf8cjfMclfcnn9+BkOnLECP8Q58OYeyJ40eoyF6Ee/En/JHlP6mIlRVXprF4BxtAvArV0AxtEuALd2ARhHuwDc2gVgHPX/hFv9fMBddjIGeKg/WCxlCsI46u+Ga5mCcJd+sIG9UkGAW32ZbApFAHhod4Bb3eo04h3god0BbiUHYApVCNjbHeBW+QDAXT4a7qg7r7e214057vg0QhkEHkoSwq0kIdydXw4/Q3H8hjYJ3vL0WConBJhCHQaOToeBrU0BljYFmEoVgHGUKgAPnREAt84IgLuqFgAYSUEOAHszDwuAtSkHAZhLGYIpdCLgKGUIHtocZG1zkLmUIRhxDnJU1RDA1uYga5uDzKUOwhTnIEfnxcDe5iBrcyQAYGlzkKkUYhhxDrKXQgxbSwLWUohhbknA1JKAEZOAvSUBW0sC1pYEzC0JmFoSMMJyCDhaFrK3JGDtyiFgaVnI3LKQqWUhI2YhR8tC9paFrC0LWVoWMrcsZGpZyIhZyNGykL2rSIGtlQHWVgZYWhlgbmWAqZUBRiwDHK0MsLcywNbKAGsOoNUhllaHmFsdYmp1iBHrEEerQ+w5gFYI2VodYm11iKXVIeYcQCuETK0QMmIh5MgBtELI3gohWyuErDmAVolZWiFkzgG0SszUKjGjfj6gVmKOVonZcwCtFbB9HQC+ozWDbz1bvGu9iKW1AuYcQOtFTLEX1GbIaFegN0OOHEBrhuw5gNYM2XIArRuz5gDacoB3bTnAEktxXQ4wfw0AvveM8b4tiJjSJOwLIsbXsAKeNeKCiOO3D+AVbUl0AfjGs8ZPbUnIdgFoa1LWC0BblfMuB9AeC1j6gqQE0J9LmC8AOYD2ZMb7i4bt2ZTpWoHfPoB7Tj2fXzT8N1X41vkq/QHOAAAAAElFTkSuQmCC' },
  firstname: { type: String, trim: true },
  lastname: { type: String, trim: true },
  avatar: { type: String, trim: true },
  education: { type: String, trim: true },
  school: { type: String, trim: true },
  gender: { type: String, enum: ['male', 'female'], default: 'male' },
  country: { type: String, trim: true },
  birthday: { type: String, trim: true },
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
