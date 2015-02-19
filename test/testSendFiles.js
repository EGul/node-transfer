
var sendFiles = require('../lib/sendFiles');

var assert = require('assert');

describe('sendFiles', function () {

  describe('addSend', function () {

    it('should add send', function (done) {

      sendFiles.addSend(null, __dirname + '/temp.json', function (err, data) {

        assert.equal(err, null);

        sendFiles.getFiles(null, null, function (err, files) {

          assert.equal(err, null);
          assert.equal(files.length, 1);

          done();

        });

      });

    });

  });

  describe('getFiles', function () {

    it('should get files', function (done) {

      sendFiles.getFiles(null, null, function (err, files) {

        assert.equal(err, null);

        assert.equal(files.length, 1);

        done();

      });

    });

  });

  describe('getFilesWithProperty', function () {

    it('should get files', function (done) {

      sendFiles.getFiles('to', null, function (err, files) {

        assert.equal(err, null);

        assert.equal(files.length, 1);

        done();

      });

    });

  });

  describe('removeFiles', function () {

    after(function (done) {

      sendFiles.addSend(null, __dirname + '/temp.json', function (err, data) {
        done();
      });

    });

    it('should remove file', function (done) {

      sendFiles.removeFiles('to', null, function (err) {

        assert.equal(err, null);

        sendFiles.getFiles(null, null, function (err, files) {

          assert.equal(err, null);

          assert.equal(files.length, 0);

          done();

        });

      });

    });

  });

  describe('removeAllFiles', function () {

    it('should remove all files', function (done) {

      sendFiles.removeAllFiles();

      sendFiles.getFiles(null, null, function (err, files) {

        assert.equal(err, null);

        assert.equal(files.length, 0);

        done();

      });

    });

  });

});
