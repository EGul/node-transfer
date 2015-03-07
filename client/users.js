
var app = angular.module('app');
app.factory('usersFactory', usersFactory);

function usersFactory(userFactory) {

  return function () {

    this.users = [];

    this.addUser = function (json) {
      var tempUser = new userFactory(json);
      this.users.push(tempUser);
    }

    this.jsonChanged = function (json, fn) {

      this.getUsers('id', json.id, function (err, tempUsers) {

        if (err) return fn(err);

        var tempUser = tempUsers[0];
        tempUser.json = json;

        fn(null);

      });

    }

    this.getUsers = function (property, value, fn) {

      var tempUsers = this.users.filter(function (e) {
        if (property === null || e.json[property] === value) return e;
      });

      if (!tempUsers.length) return fn('user does not exist', null);
      fn(null, tempUsers);

    }

    this.removeUser = function (property, value, fn) {
      this.users = this.users.filter(function (e) {
        if (e.json[property] !== value) return e;
      });
      fn(null);
    }

  }

}
