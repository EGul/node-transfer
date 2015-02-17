
var client = require('../lib/client');

var secondClient = require('./tempClient');
var thirdClient = require('./secondTempClient');

var http = require('http');
var fs = require('fs');
var assert = require('assert');

/*
function setTempClients() {

  var path = __dirname.split('/');
  path.splice(path.length - 1);
  path.push('lib');
  path.push('client.js');
  path = path.join('/');

  var data = fs.readFileSync(path);

  fs.writeFileSync(__dirname + '/tempClient.js', data);
  fs.writeFileSync(__dirname + '/secondTempClient.js', data);

}
setTempClients();
*/

describe('client', function () {

  beforeEach(function () {
    client.removeAllOn();
    secondClient.removeAllOn();
    thirdClient.removeAllOn();
  });

  describe('json', function () {

    it('should set json', function (done) {

      var count = 0;
      function did() {
        count++;
        if (count === 3) done();
      }

      client.json('test/temp.json', function (err) {
        did();
      });

      secondClient.json('test/secondTemp.json', function (err) {
        did();
      });

      thirdClient.json('test/thirdTemp.json', function (err) {
        did();
      });

    });

  });

  describe('connect', function () {

    it('should connect all clients', function (done) {

      var count = 0;
      function did() {
        count++;
        if (count === 3) {
          done();
        }
      }

      client.on('something', function (json) {
        did();
      });

      secondClient.on('something', function (json) {
        did();
      });

      thirdClient.on('something', function (json) {
        did();
      });

      client.connect('localhost:8080', function (err) {

      });

      secondClient.connect('localhost:8080', function (err) {

      });

      thirdClient.connect('localhost:8080', function (err) {

      });

    });

  });

  describe('users', function () {

    it('should list users', function (done) {

      /*
      client.users(function (users) {

        if (users[0].name === 'third') {
          var temp = users[0];
          users[0] = users[1];
          users[1] = temp;
        }

        assert.equal(users[0].name, 'second');
        assert.notEqual(users[0].id, null);
        assert.equal(users[1].name, 'third');
        assert.notEqual(users[1].id, null);

        done();

      });
      */

      client.listUsers(function (users) {

        if (users[0].name === 'third') {
          var temp = users[0];
          users[0] = users[1];
          users[1] = temp;
        }

        assert.equal(users[0].name, 'second');
        assert.notEqual(users[0].id, null);
        assert.equal(users[1].name, 'third');
        assert.notEqual(users[1].id, null);

        done();

      });

    });

  });

  describe('send', function () {

    it('should request send', function (done) {

      var count = 0;
      function did() {
        count++;
        if (count == 2) {
          done();
        }
      }

      secondClient.on('hasRequest', function (from, filename) {
        assert.equal(from, 'first');
        assert.equal(filename, 'temp.json');
        did();
      });

      thirdClient.on('hasRequest', function (from, filename) {
        assert.equal(from, 'first');
        assert.equal(filename, 'temp.json');
        did();
      });

      client.send(null, __dirname + '/temp.json', function (err) {
        assert.equal(err, null);
      });

    });

    it('second should request send', function (done) {

      var count = 0;
      function did() {
        count++;
        if (count === 2) done();
      }

      client.on('hasRequest', function (from, filename) {
        assert.equal(from, 'second');
        assert.equal(filename, 'secondTemp.json');
        did();
      });

      thirdClient.on('hasRequest', function (from, filename) {
        assert.equal(from, 'second');
        assert.equal(filename, 'secondTemp.json');
        did();
      });

      secondClient.send(null, __dirname + '/secondTemp.json', function (err) {
        assert.equal(err, null);
      });

    });

    it('should request send to', function (done) {

      secondClient.on('hasRequest', function (from, filename) {
        assert.equal(from, 'first');
        assert.equal(filename, 'fourthTemp.json');
        done();
      });

      thirdClient.on('hasRequest', function (from, filename) {
        assert.equal(true, false);
        done();
      });

      client.send('second', __dirname + '/fourthTemp.json', function (err) {
        assert.equal(err, null);
      });

    });

    it('should get error file does not exist', function (done) {

      client.send(null, 'something.html', function (err) {
        assert.equal(err, 'file does not exist');
        done();
      });

    });

    it('should get error user does not exist', function (done) {

      client.send('fourth', __dirname + '/temp.json', function (err) {
        assert.equal(err, 'user does not exist');
        done();
      });

    });



  });

  describe('listSend', function () {

    it('should list send', function (done) {

      client.listSend(null, function (err, listSend) {

        assert.equal(err, null);

        assert.equal(listSend[0].path, __dirname + '/temp.json');
        assert.equal(listSend[0].to, null);
        assert.equal(listSend[1].path, __dirname + '/fourthTemp.json');
        assert.equal(listSend[1].to, 'second');

        done();

      });

    });

    it('should list send to', function (done) {

      client.listSend('second', function (err, listSend) {

        assert.equal(err, null);

        assert.equal(listSend.length, 1);
        assert.equal(listSend[0].to, 'second');
        assert.equal(listSend[0].path, __dirname + '/fourthTemp.json');

        done();

      });

    });

  });

  describe('removeSend', function () {

    after(function (done) {

      var count = 0;
      function did() {
        count++;
        if (count === 3) done();
      }

      secondClient.on('hasRequest', function () {
        did();
      });

      thirdClient.on('hasRequest', function () {
        did();
      });

      client.send(null, __dirname + '/temp.json', function () {

      });

      client.send('second', __dirname + '/fourthTemp.json', function () {

      });

    });

    it('should remove send', function (done) {

      var count = 0;
      function did() {
        count ++;
        if (count === 3) done();
      }

      secondClient.on('rmsend', function (from, filename) {
        assert.equal(from, 'first');
        assert.equal(filename, 'temp.json');
        did();
      });

      thirdClient.on('rmsend', function (from, filename) {
        assert.equal(from, 'first');
        assert.equal(filename, 'temp.json');
        did();
      });

      client.rmsend(null, 'temp.json', function (err) {

        assert.equal(err, null);

        client.listSend(null, function (err, listSend) {
          assert.equal(listSend.length, 1);
          did();
        });

      });

    });

    it('should remove send from', function (done) {

      var count = 0;
      function did() {
        count++;
        if (count === 2) done();
      }

      secondClient.on('rmsend', function (from, filename) {
        assert.equal(from, 'first');
        assert.equal(filename, 'fourthTemp.json');
        did();
      });

      client.rmsend('second', 'fourthTemp.json', function (err) {

        assert.equal(err, null);

        client.listSend(null, function (err, listSend) {
          assert.equal(listSend.length, 0);
          did();
        });

      });

    });

    it('should get error user does not exist', function (done) {

      client.rmsend('fourth', 'user does not exist', function (err) {
        assert.equal(err, 'user does not exist');
        done();
      });

    });

    it('should get error file does not exist', function (done) {

      client.rmsend(null, 'fifthTemp.json', function (err) {
        assert.equal(err, 'file does not exist');
        done();
      });

    });

  });

  describe('accept', function () {

    /*
    it('should accept request', function (done) {

      secondClient.on('fileData', function (from, filename) {

        assert.equal(from, 'first');
        assert.equal(filename, 'temp.json');
        done();

      });

      secondClient.accept(null, 'temp.json', null, null, function (err) {
        assert.equal(err, null);
      });

    });
    */

    it('should accept request', function (done) {

      secondClient.on('fileData', function (from, filename) {

        assert.equal(from, 'first');
        assert.equal(filename, 'temp.json');
        done();

      });

      var path = __dirname.split('/');
      path.splice(path.length - 1);
      path = path.join('/');

      secondClient.accept(null, 'temp.json', path, null, function (err) {
        assert.equal(err, null);
      });

    });

    it('should accept request from', function (done) {

      secondClient.on('fileData', function (from, filename) {

        assert.equal(from, 'first');
        assert.equal(filename, 'fourthTemp.json');
        done();

      });

      var path = __dirname.split('/');
      path.splice(path.length - 1);
      path = path.join('/');

      secondClient.accept('first', 'fourthTemp.json', path, null, function (err) {
        assert.equal(err, null);
      });

    });

    it('should get error file does not exist', function (done) {

      var path = __dirname.split('/');
      path.splice(path.length - 1);
      path = path.join('/');

      client.accept(null, 'temp.json', path, null, function (err) {
        assert.equal(err, 'file does not exist');
        done();
      });

    });

    it('should get error user does not exist', function (done) {

      var path = __dirname.split('/');
      path.splice(path.length - 1);
      path = path.join('/');

      client.accept('fourth', 'temp.json', path, null, function (err) {
        assert.equal(err, 'user does not exist');
        done();
      });

    });

    it('should get error must provide path', function (done) {

      secondClient.accept(null, 'temp.json', null, null, function (err) {
        assert.equal(err, 'must provide path');
        done();
      });

    });

    it('should get error path does not exist', function (done) {

      secondClient.accept(null, 'temp.json', __dirname + '/something', null, function (err) {
        assert.equal(err, 'path does not exist');
        done();
      });

    });

    it('should get error file already exists', function (done) {

      secondClient.accept(null, 'temp.json', __dirname, null, function (err) {
        assert.equal(err, 'file already exists');
        done();
      });

    });

  });

  describe('listAccept', function () {

    it('should list accept', function (done) {

      var should = [];
      should.push({filename: 'temp.json', from: 'first'});
      should.push({filename: 'fourthTemp.json', from: 'first'});

      secondClient.listAccept(null, function (err, list) {

        assert.deepEqual(list, should);

        done();

      });

    });

    it('should list accept from', function (done) {

      var should = [];
      should.push({filename: 'temp.json', from: 'first'});
      should.push({filename: 'fourthTemp.json', from: 'first'});

      secondClient.listAccept('first', function (err, list) {

        assert.deepEqual(list, should);

        done();

      });

    });

    it('should get error user does not exist', function (done) {

      client.listAccept('fourth', function (err, list) {
        assert.equal(err, 'user does not exist');
        done();
      });

    });

  });

  describe('json', function () {

    it('should get json', function (done) {

      client.tempJson(function (json) {
        assert.equal(json.name, 'first');
        done();
      });

    });

  });

  describe('listJson', function () {

    it('should list json', function (done) {

      client.listJson(null, function (err, jsonArr) {

        assert.equal(err, null);

        assert.equal(jsonArr[0].name, 'second');
        assert.notEqual(jsonArr[0].id, null)
        assert.equal(jsonArr[1].name, 'third');
        assert.notEqual(jsonArr[1].id, null);

        done();

      });

    });

    it('should list json from', function (done) {

      client.listJson('second', function (err, json) {

        assert.equal(err, null);

        assert.equal(json.name, 'second');
        assert.notEqual(json.id, null);
        done();

      });

    });

    it('should get error user does not exist', function (done) {

      client.listJson('fourth', function (err, json) {
        assert.equal(err, 'user does not exist');
        done();
      });

    });

  });

  describe('setJson', function () {

    after(function (done) {

      var count = 0;
      function did() {
        count++;
        if (count == 3) done();
      }

      thirdClient.on('jsonChanged', function () {
        did();
      });

      secondClient.on('jsonChanged', function () {
        did();
      })

      client.setJson('test/temp.json', function (err) {
        did();
      });

    });

    it('should set json', function (done) {

      var count = 0;
      function did() {
        count++;
        if (count == 3) done();
      }

      thirdClient.on('jsonChanged', function (from) {

        assert.equal(from, 'first');

        thirdClient.listJson('fourth', function (err, listJson) {
          assert.equal(listJson.name, 'fourth');
          did();
        });

      });

      secondClient.on('jsonChanged', function (from) {

        assert.equal(from, 'first');

        secondClient.listJson('fourth', function (err, listJson) {
          assert.equal(listJson.name, 'fourth');
          did();
        });

      });

      client.setJson('test/fourthTemp.json', function (err) {

        assert.equal(err, null);

        client.tempJson(function (listJson) {
          assert.equal(listJson.name, 'fourth');
          did();
        });

      });

    });

    it('should get error json does not exist', function (done) {

      client.setJson('something.json', function (err) {

        assert.equal(err, 'json does not exist');
        done();

      });

    });

  });

  describe('message', function () {

    it('should get message', function (done) {

      secondClient.on('message', function (from, message) {

        assert.equal(from, 'first');
        assert.equal(message, 'something');

        done();

      });

      client.message(null, 'something', function (err) {

        assert.equal(err, null);

      });

    });

    it('should get error user does not exist', function (done) {

      client.message('fourth', 'something', function (err) {

        assert.equal(err, 'user does not exist');
        done();

      });

    });

  });

  describe('disconnect', function () {

    it('should disconnect', function (done) {

      var count = 0;
      function did() {
        count++;
        if (count == 5) done();
      }

      secondClient.on('didDisconnect', function (from) {

        assert.equal(from, 'first');

        secondClient.listUsers(function (users) {

          assert.equal(users.length, 1);
          assert.equal(users[0].name, 'third');

          secondClient.listAccept(null, function (err, listAccept) {

            assert.equal(listAccept.length, 0);

            did();

          });

        });

      });

      thirdClient.on('didDisconnect', function (from) {

        assert.equal(from, 'first');

        thirdClient.listUsers(function (users) {

          assert.equal(users.length, 1);
          assert.equal(users[0].name, 'second');

          thirdClient.listAccept(null, function (err, listAccept) {

            assert.equal(listAccept.length, 1);

            did();

          });

        });

      });


      client.disconnect();


      client.listUsers(function (users) {
        var should = [];
        assert.deepEqual(users, should);
        did();
      });

      client.listSend(null, function (err, listSend) {
        var should = [];
        assert.deepEqual(listSend, should);
        did();
      });

      client.listAccept(null, function (err, listAccept) {
        var should = [];
        assert.deepEqual(listAccept, should);
        did();
      });

    });

  });

  describe('reconnect', function () {

    it('should reconnect', function (done) {

      var count = 0;
      function did() {
        count++;
        if (count == 4) done();
      }

      secondClient.on('something', function (json) {

        assert.equal(json.name, 'first');

        secondClient.listUsers(function (users) {

          if (users[0].name === 'third') {
            var temp = users[0];
            users[0] = users[1];
            users[1] = temp;
          }

          assert.equal(users[0].name, 'first');
          assert.equal(users[1].name, 'third');

          secondClient.listAccept(null, function (err, listAccept) {

            assert.equal(listAccept.length, 0);

            did();

          });

        });

      });

      client.on('userJson', function (json) {

        assert.notEqual(json, null);

        did();

      });

      client.on('hasRequest', function (from, filename) {

        assert.equal(from, 'second');

        did();

      });

      client.connect('localhost:8080', function () {

      });

    });

  });

});
