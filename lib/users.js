
var User = require('./user');

var users = [];

function addUser(json, fn) {

  var user = new User(json);

  users.push(user);

  fn(null);

}

function removeUserById(id, fn) {
  users = users.filter(function (e) {
    if (e.json.id !== id) return e;
  });
  fn(null);
}

function removeAllUsers(fn) {
  users = [];
  fn(null);
}

function getUserById(id, fn) {
  var tempUsers = users.filter(function (e) {
    if (e.json.id === id) return e;
  });
  fn(null, tempUsers[0]);
}

function getUserByProperty(property, value, fn) {
  var tempUsers = users.filter(function (e) {
    if (e.json[property] === value) return e;
  });
  fn(null, tempUsers);
}

function secondGetUserByProperty(property, value) {
  var tempUsers = users.filter(function (e) {
    if (e.json[property] === value) return e;
  });
  return tempUsers;
}

function secondGetUserById(id) {
  var tempUsers = users.filter(function (e) {
    if (e.json.id === id) return e;
  });
  return tempUsers;
}

function jsonChanged(json, fn) {

  for (var i = 0; i < users.length; i++) {
    if (users[i].json.id === json.id) {
      users[i].json = json;
    }
  }

  fn(null);
}

function listUsersJson(from, fn) {

  if (users.length === 0) return fn(null, []);

  if (from) {

    var tempUsers = users.filter(function (e) {
      if (e.json.name === from) return e;
    });

    if (tempUsers.length === 0) return fn('user does not exist');

    fn(null, tempUsers[0].json);

  }
  else {

    var usersJson = users.map(function (e) {
      return e.json;
    });
    fn(null, usersJson);

  }

}

module.exports.addUser = addUser;
module.exports.removeUserById = removeUserById;
module.exports.removeAllUsers = removeAllUsers;
module.exports.getUserById = getUserById;
module.exports.getUserByProperty = getUserByProperty;
module.exports.secondGetUserByProperty = secondGetUserByProperty;
module.exports.secondGetUserById = secondGetUserById;
module.exports.jsonChanged = jsonChanged;
module.exports.listUsersJson = listUsersJson;
