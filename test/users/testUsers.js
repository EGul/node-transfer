
var users = require('../../lib/users');
var User = require('../../lib/user');

var assert = require('assert');

describe('user', function () {

  describe('create user', function () {

    it('should create user', function (done) {

      users.addUser({name: 'first', id: '1'}, function (err) {

        assert.equal(err, null);

        done();

      });

    });

  });

  describe('remove user by id', function () {

    after(function (done) {

      users.addUser({name: 'first', id: '1'}, function (err) {
        done();
      });

    });

    it('should remove user', function (done) {

      users.removeUserById('1', function (err) {

        assert.equal(err, null);

        users.listUsersJson(null, function (err, users) {

          assert.equal(err, null);

          assert.equal(users.length, 0);

          done();

        });

      });

    });

  });

  describe('removeAllUsers', function () {

    after(function (done) {

      users.addUser({name: 'first', id: '1'}, function (err) {
        done();
      });

    });

    it('should remove all users', function (done) {

      users.removeAllUsers(function (err) {

        assert.equal(err, null);

        users.listUsersJson(null, function (err, json) {

          assert.equal(err, null);

          assert.deepEqual(json, []);

          done();

        });

      });

    });

  });

  describe('getUserById', function () {

    it('should get user', function (done) {

      users.getUserById('1', function (err, user) {

        assert.equal(err, null);

        assert.equal(user.json.name, 'first');

        done();

      });

    });

  });

  describe('getUserByProperty', function () {

    it('should get user by property', function (done) {

      users.getUserByProperty('name', 'first', function (err, user) {

        assert.equal(err, null);

        assert.equal(user[0].json.name, 'first');

        done();

      });

    });

  });

  describe('json changed', function () {

    after(function (done) {

      users.jsonChanged({name: 'first', id: '1'}, function (err) {
        done();
      });

    });

    it('should change json', function (done) {

      users.jsonChanged({name: 'fourth', id: '1'}, function (err) {

        assert.equal(err, null);

        var should = [{name: 'fourth', id: '1'}]

        users.listUsersJson(null, function (err, users) {

          assert.equal(err, null);

          assert.deepEqual(users, should);

          done();

        });

      });

    });

  });

  describe('listUsersJson', function (done) {

    it('should list users json', function (done) {

      users.listUsersJson(null, function (err, users) {

        var should = [{name: 'first', id: '1'}];

        assert.equal(err, null);

        assert.deepEqual(users, should);

        done();

      });

    });

    it('should list json from', function (done) {

      users.listUsersJson('first', function (err, json) {

        var should = {name: 'first', id: '1'};

        assert.equal(err, null);

        assert.deepEqual(json, should);

        done();

      });

    });

  });

});
