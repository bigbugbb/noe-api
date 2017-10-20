const { ObjectID } = require('mongodb');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const userThreeId = new ObjectID();

module.exports = {
  userOneId,
  userTwoId,
  userThreeId
};