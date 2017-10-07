const {ObjectID} = require('mongodb');
const {Student} = require('./../../models/student');
const {userOneId, userTwoId} = require('./userIds');

const studentOneId = new ObjectID();
const studentTwoId = new ObjectID();
const students = [{
  _id: studentOneId,
  userId: userOneId,
  firstname: 'William',
  lastname: 'Smith',
  avatar: 'avatar_url_1',
  gender: 'male',
  nationality: 'england',
  dob: '1996-05-18',
  phone: '123-456-7890'
}, {
  _id: studentTwoId,
  userId: userTwoId,
  firstname: 'Jen',
  lastname: 'Lindon',
  avatar: 'avatar_url_2',
  gender: 'female',
  nationality: 'america',
  dob: '1998-10-07',
  phone: '000-000-0000'
}];

// introduction: {
//   text: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   pictures: [{
//     title: {
//       type: String,
//       trim: true
//     },
//     link: {
//       type: String,
//       required: true,
//       trim: true
//     }
//   }],
//   videos: [{
//     title: {
//       type: String,
//       trim: true
//     },
//     link: {
//       type: String,
//       required: true,
//       trim: true
//     }
//   }]
// },
// currentGrade: {
//   type: String,
//   trim: true
// },
// gradeApplying: {
//   type: String,
//   trim: true
// },
// preferSchoolType: {
//   type: String,
//   enum: ['coed', 'all_girl', 'all_boy'],
//   default: 'coed'
// },
// preferSchoolLocation: [{
//   city: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   state: {
//     type: String,
//     required: true,
//     trim: true
//   }
// }],
// preferAccommodation: {
//   type: String,
//   enum: ['boarding', 'day school', 'apartment'],
//   default: 'boarding'
// },
// annualBudget: {
//   type: Number,
//   min: 0,
//   max: 10000000
// },
// language: [{
//   kind: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   level: {
//     type: String,
//     require: true,
//     trim: true
//   }
// }],
// gpa: [{
//   peroid: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   grade: {
//     type: Number,
//     required: true
//   }
// }],
// skills: [{
//   type: String,
//   trim: true
// }],
// interests: [{
//   type: String,
//   trim: true
// }],
// passport: [{
//   type: String,
//   trim: true
// }],
// recommendations: [{
//   title: {
//     type: String,
//     trim: true
//   },
//   link: {
//     type: String,
//     trim: true
//   }
// }],
// transcripts: [{
//   title: {
//     type: String,
//     trim: true
//   },
//   link: {
//     type: String,
//     trim: true
//   }
// }],
// stdTests: [{
//   title: {
//     type: String,
//     trim: true
//   },
//   score: {
//     type: Number,
//     min: 0
//   }
// }],
// supplements: [{
//   title: {
//     type: String,
//     trim: true
//   },
//   link: {
//     type: String,
//     trim: true
//   }
// }]

const populateStudents = (done) => {
  Student.remove({}).then(() => {
    var studentOne = new Student(students[0]).save();
    var studentTwo = new Student(students[1]).save();

    return Promise.all([studentOne, studentTwo])
  }).then(() => done());
};

module.exports = {students, populateStudents};