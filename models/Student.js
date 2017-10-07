const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var Schema = mongoose.Schema,
ObjectId = Schema.Types.ObjectId;

var StudentSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: 'User',
    index: {unique: true},
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
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    default: 'male'
  },
  nationality: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  introduction: {
    text: {
      type: String,
      trim: true
    },
    pictures: [{
      title: {
        type: String,
        trim: true
      },
      link: {
        type: String,
        trim: true
      }
    }],
    videos: [{
      title: {
        type: String,
        trim: true
      },
      link: {
        type: String,
        trim: true
      }
    }]
  },
  currentGrade: {
    type: String,
    trim: true
  },
  gradeApplying: {
    type: String,
    trim: true
  },
  preferSchoolType: {
    type: String,
    enum: ['coed', 'all_girl', 'all_boy'],
    default: 'coed'
  },
  preferSchoolLocation: [{
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    }
  }],
  preferAccommodation: {
    type: String,
    enum: ['boarding', 'day school', 'apartment'],
    default: 'boarding'
  },
  annualBudget: {
    type: Number,
    min: 0,
    max: 10000000
  },
  language: [{
    kind: {
      type: String,
      trim: true
    },
    level: {
      type: String,
      trim: true
    }
  }],
  gpa: [{
    peroid: {
      type: String,
      trim: true
    },
    grade: {
      type: Number
    }
  }],
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  passport: [{
    type: String,
    trim: true
  }],
  recommendations: [{
    title: {
      type: String,
      trim: true
    },
    link: {
      type: String,
      trim: true
    }
  }],
  transcripts: [{
    title: {
      type: String,
      trim: true
    },
    link: {
      type: String,
      trim: true
    }
  }],
  stdTests: [{
    title: {
      type: String,
      trim: true
    },
    score: {
      type: Number,
      min: 0
    }
  }],
  supplements: [{
    title: {
      type: String,
      trim: true
    },
    link: {
      type: String,
      trim: true
    }
  }]
});

var Student = mongoose.model('Student', StudentSchema);

module.exports = {Student};
