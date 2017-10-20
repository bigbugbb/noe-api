require('../config/config');

const expect = require('expect');
const request = require('supertest');
const _ = require('lodash');
const { ObjectID } = require('mongodb');

const app = require('../app');
const { Student } = require('../models/student');
const { users, students, populateUsers, populateStudents } = require('./seed');

beforeEach(populateUsers);
beforeEach(populateStudents);

describe('POST /api/v1/students', () => {
  const token = users[2].tokens[0].token;
  const student = {
    userId: users[2]._id.toHexString(),
    firstname: 'Iron',
    lastname: 'Man',
    avatar: 'https://www.sideshowtoy.com/photo_902622_thumb.jpg',
    gender: 'male',
    nationality: 'america',
    dob: '1970-05-29T00:00:00.000Z',
    phone: '999-999-9999'
  }

  it('should create a student', (done) => {
    const { userId, firstname, lastname, avatar, gender, nationality, dob, phone } = student;
    request(app)
      .post('/api/v1/students')
      .set('Authorization', `Bearer: ${token}`)
      .send({ userId, firstname, lastname, avatar, gender, nationality, dob, phone })
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

        Student.findOne({ userId }).then((student) => {
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
    const { firstname, lastname, avatar, gender, nationality, dob, phone } = student;

    request(app)
      .post('/api/v1/students')
      .set('Authorization', `Bearer: ${token}`)
      .send({ userId, firstname, lastname, avatar, gender, nationality, dob, phone })
      .expect(400)
      .end(done);
  });
});

describe('GET /api/v1/students', () => {
  const token = users[0].tokens[0].token;

  it('should get all students', (done) => {
    request(app)
      .get('/api/v1/students')
      .set('Authorization', `Bearer: ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.students.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /api/v1/students/:id', () => {
  const token = users[0].tokens[0].token;

  it('should return student doc', (done) => {
    request(app)
      .get(`/api/v1/students/${students[0]._id.toHexString()}`)
      .set('Authorization', `Bearer: ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.student.firstname).toBe(students[0].firstname);
        expect(res.body.student.lastname).toBe(students[0].lastname);
      })
      .end(done);
  });

  // it('should not return student doc created by other user', (done) => {
  //   request(app)
  //     .get(`/api/v1/students/${students[1]._id.toHexString()}`)
  //     .set('Authorization', `Bearer: ${token}`)
  //     .expect()
  // });

  it('should return 404 if student not found', (done) => {
    const studentId = new ObjectID().toHexString();

    request(app)
      .get(`/api/v1/students/${studentId}`)
      .set('Authorization', `Bearer: ${token}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get(`/api/v1/students/123abc`)
      .set('Authorization', `Bearer: ${token}`)
      .expect(404)
      .end(done);
  })
});

describe('DELETE /api/v1/students/:id', () => {
  const token = users[0].tokens[0].token;

  it('should remove a student', (done) => {
    const studentId = students[0]._id.toHexString();

    request(app)
      .delete(`/api/v1/students/${studentId}`)
      .set('Authorization', `Bearer: ${token}`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Student.findById(students[0]._id).then((students) => {
          expect(students).toBeFalsy();
          done();
        }).catch((e) => done(e));
      });
  });
});