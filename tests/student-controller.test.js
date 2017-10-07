require('../config/config');

const expect = require('expect');
const request = require('supertest');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

const app = require('../app');
const {Student} = require('../models/student');
const {users, students, populateUsers, populateStudents} = require('./seed');

beforeEach(populateUsers);
beforeEach(populateStudents);

describe('POST /api/v1/students', () => {
  const token = users[0].tokens[0].token;
  const student = {
    userId: users[0]._id.toHexString(),
    firstname: 'Iron',
    lastname: 'Man',
    avatar: 'https://www.sideshowtoy.com/photo_902622_thumb.jpg',
    gender: 'male',
    nationality: 'america',
    dob: '1970-05-29T00:00:00.000Z',
    phone: '999-999-9999'
  }

  it('should create a student', (done) => {
    const {userId, firstname, lastname, avatar, gender, nationality, dob, phone} = student;
    request(app)
      .post('/api/v1/students')
      .set('Authorization', `Bearer: ${token}`)
      .send({userId, firstname, lastname, avatar, gender, nationality, dob, phone})
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBeTruthy();
        expect(res.body.userId).toBe(userId);
        expect(res.body.firstname).toBe(firstname);
        expect(res.body.lastname).toBe(lastname);
        expect(res.body.avatar).toBe(avatar);
        expect(res.body.gender).toBe(gender);
        expect(res.body.nationality).toBe(nationality);
        expect(res.body.dob).toBe(dob);
        expect(res.body.phone).toBe(phone);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        Student.findOne({userId}).then((student) => {
          expect(student).toBeTruthy();
          done();
        }).catch((e) => done(e));
      });
  });

  // it('should return validation errors if request invalid', (done) => {
  //   request(app)
  //     .post('/api/v1/users')
  //     .send({
  //       email: 'and',
  //       password: '123'
  //     })
  //     .expect(400)
  //     .end(done);
  // });

  it('should not create user if userId in use', (done) => {
    const userId = students[0].userId;
    const {firstname, lastname, avatar, gender, nationality, dob, phone} = student;

    request(app)
      .post('/api/v1/students')
      .set('Authorization', `Bearer: ${token}`)
      .send({userId, firstname, lastname, avatar, gender, nationality, dob, phone})
      .expect(400)
      .end(done);
  });
});