const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const validator = require('validator');
const avatarUtils = require('../utils/upload-avatar');
const _ = require('lodash');

var Schema = mongoose.Schema;

var StudentSchema = new mongoose.Schema({
  // basic intro
  avatar: { type: String, trim: true, default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIAAgMAAACJFjxpAAAADFBMVEXFxcX////p6enW1tbAmiBwAAAFiElEQVR4AezAgQAAAACAoP2pF6kAAAAAAAAAAAAAAIDbu2MkvY0jiuMWWQoUmI50BB+BgRTpCAz4G6C8CJDrC3AEXGKPoMTlYA/gAJfwETawI8cuBs5Nk2KtvfiLW+gLfK9m+r3X82G653+JP/zjF8afP1S//y+An4/i51//AsB4aH+/QPD6EQAY/zwZwN8BAP50bh786KP4+VT+3fs4/noigEc+jnHeJrzxX+NWMDDh4g8+EXcnLcC9T8U5S/CdT8bcUeBEIrwBOiI8ki7Ba5+NrePgWUy89/nYyxQ8Iw3f+pWY4h1gb3eAW7sDTPEOsLc7wK1TIeDuDB+I/OA1QOUHv/dFsZQkhKkh4QlEfOULYz2nGj2/Nn1LmwR/86VxlCoAW6kCsHRGANx1RgCMo5Qh2EsZgrXNQZZShp5Liv7Il8eIc5C91EHY2hxk6bwYmNscZIReDBwtCdhbErC1JGBpScBcOgFMLQsZMQs5Whayd+UQsLYsZGlZyNyykKllISNmIUfAwifw8NXvTojAjGFrdYi11SGWVoeYWx1i6lmQCiEjFkKOVgjZ+xxIhZCtFULWHkCqxCw9gNQKmP9vNHzipdEPrRcxtVbAeDkAvve0iM2QozVD9hfjhp4YP/UrkJYDbD2AtBxgfSkAvvHEeNcDSAsilgtAWxIy91J8AXgZAJ5e33+4tuACcAG4AFwALgBXRXQB6AFcB5MXAuA6nl9/0Vx/011/1V5/1/dfTPJvRtdnu/zL6beeFO/7r+fXBYbrEkt/j+i6ytXfpuvvE/ZXOnsA/a3a/l5xf7O6v1t+Xe/vOyz6HpO8yyboM8o7rfJes77bru83THk48p7TvOs27zvOO6/73vO++z7l4cgnMPQzKPopHC0N9noSSz6LJp/Gk88jyicy5TOp6qlc+VyyfDJbPpuuns6XzyfMJzTmMyrrKZ35nNJ8Ums+q7af1tvPK+4nNodEnPKp3fnc8npyez67/qVP7+/fL8hfcMjfsOhf8cjfMclfcnn9+BkOnLECP8Q58OYeyJ40eoyF6Ee/En/JHlP6mIlRVXprF4BxtAvArV0AxtEuALd2ARhHuwDc2gVgHPX/hFv9fMBddjIGeKg/WCxlCsI46u+Ga5mCcJd+sIG9UkGAW32ZbApFAHhod4Bb3eo04h3god0BbiUHYApVCNjbHeBW+QDAXT4a7qg7r7e214057vg0QhkEHkoSwq0kIdydXw4/Q3H8hjYJ3vL0WConBJhCHQaOToeBrU0BljYFmEoVgHGUKgAPnREAt84IgLuqFgAYSUEOAHszDwuAtSkHAZhLGYIpdCLgKGUIHtocZG1zkLmUIRhxDnJU1RDA1uYga5uDzKUOwhTnIEfnxcDe5iBrcyQAYGlzkKkUYhhxDrKXQgxbSwLWUohhbknA1JKAEZOAvSUBW0sC1pYEzC0JmFoSMMJyCDhaFrK3JGDtyiFgaVnI3LKQqWUhI2YhR8tC9paFrC0LWVoWMrcsZGpZyIhZyNGykL2rSIGtlQHWVgZYWhlgbmWAqZUBRiwDHK0MsLcywNbKAGsOoNUhllaHmFsdYmp1iBHrEEerQ+w5gFYI2VodYm11iKXVIeYcQCuETK0QMmIh5MgBtELI3gohWyuErDmAVolZWiFkzgG0SszUKjGjfj6gVmKOVonZcwCtFbB9HQC+ozWDbz1bvGu9iKW1AuYcQOtFTLEX1GbIaFegN0OOHEBrhuw5gNYM2XIArRuz5gDacoB3bTnAEktxXQ4wfw0AvveM8b4tiJjSJOwLIsbXsAKeNeKCiOO3D+AVbUl0AfjGs8ZPbUnIdgFoa1LWC0BblfMuB9AeC1j6gqQE0J9LmC8AOYD2ZMb7i4bt2ZTpWoHfPoB7Tj2fXzT8N1X41vkq/QHOAAAAAElFTkSuQmCC' },
  firstname: { type: String, trim: true, es_indexed: true, },
  lastname: { type: String, trim: true, es_indexed: true, },
  email: {
    type: String, required: true, trim: true, minlength: 3, unique: true, es_indexed: true,
    validate: {
      validator: value => validator.isEmail(value),
      message: '{VALUE} is not a valid email'
    }
  },
  phone: { type: String, trim: true, es_indexed: true },
  grade: { type: String, trim: true, es_indexed: true },
  school: { type: String, trim: true, es_indexed: true },
  gender: { type: String, enum: ['male', 'female'], default: 'male', es_indexed: true },
  country: { type: String, trim: true, es_indexed: true },
  birthday: { type: String, trim: true, es_indexed: true },
  gpa: { type: Number, min: 0, es_indexed: true },
  introduction: { type: String, trim: true, default: 'This is the self-introduction.', es_indexed: true },
  aboutMe: { type: String, trim: true, default: 'More about myself.' },
  applying: { type: String, trim: true, es_indexed: true },
  budget: { type: Number, min: 0, max: 10000000, default: 20000, es_indexed: true },
  // Standardized test scores
  itep: { type: Number, es_indexed: true },
  slep: { type: Number, es_indexed: true },
  toefljr: { type: Number, es_indexed: true },
  toefl: { type: Number, es_indexed: true },
  ssat: { type: Number, es_indexed: true },
  ielts: { type: Number, es_indexed: true },
  gre: { type: Number, es_indexed: true },
  gmat: { type: Number, es_indexed: true },
  // school preferred
  preferredSchoolType: { type: String, trim: true, es_indexed: true },
  preferredSchoolLocation: { type: String, trim: true, es_indexed: true },
  preferredReligion: { type: String, trim: true, es_indexed: true },
  preferredAccommodation: { type: String, trim: true, es_indexed: true },
  // skills and interests
  skills: { type: [String], es_indexed: true },
  interests: { type: [String], es_indexed: true }
}, {
  timestamps: true,
  retainKeyOrder: true
});

StudentSchema.virtual('avatarKeyPrefix').get(function () {
  return `uploads/${this._id}/images`;
});

StudentSchema.pre('findOneAndUpdate', function (next) {
  this.options.runValidators = true;
  next();
});

class StudentClass {
  uploadAvatar(avatar) {
    return avatarUtils.uploadAvatar(avatar, this.avatarKeyPrefix);
  }
}

StudentSchema.loadClass(StudentClass);
StudentSchema.plugin(mongoosastic);

let Student = mongoose.model('Student', StudentSchema);
let stream = Student.synchronize(), count = 0;

stream.on('data', function(err, doc) {
  count++;
});

stream.on('close', function() {
  console.log('indexed ' + count + ' student documents!');
});

stream.on('error', function(err) {
  console.log(err);
});

module.exports = { Student };
