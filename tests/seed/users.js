const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');
const { User } = require('./../../models/user');
const { userOneId, userTwoId, userThreeId } = require('./userIds');

const users = [{
  _id: userOneId,
  email: 'william_smith@example.com',
  password: 'userOnePass',
  phone: 1234567890,
  firstname: 'William',
  lastname: 'Smith',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userTwoId,
  email: 'jen@example.com',
  phone: 5185185188,
  password: 'userTwoPass',
  firstname: 'Jen',
  lastname: 'Lindon',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userThreeId,
  email: 'bigbug@example.com',
  phone: 6666666666,
  password: 'userThreePass',
  firstname: 'big',
  lastname: 'bug',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userThreeId, access: 'auth' }, process.env.JWT_SECRET).toString()
  }]
}];

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();
    var userThree = new User(users[2]).save();

    return Promise.all([userOne, userTwo, userThree])
  }).then(() => done());
};

module.exports = { users, populateUsers };