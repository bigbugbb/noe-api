var { User } = require('./../models/user');

var authenticate = (req, res, next) => {
  var auth = req.header('Authorization');

  if (!auth) {
    return res.status(401).send();
  }

  var token = req.header('Authorization').split(' ')[1];

  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    res.status(401).send();
  });
};

module.exports = { authenticate };
