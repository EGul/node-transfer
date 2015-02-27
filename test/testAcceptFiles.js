
var acceptFiles = require('../lib/acceptFiles');
var assert = require('assert');

var tempFile = {
  id: '1',
  fileId: '2',
  filename: 'something',
  stats: null,
  writePath: null
};

describe('acceptFiles', function () {

  describe('addFile', function () {

    before(function (done) {
      acceptFiles.removeAllFiles(function (err) {
        done();
      });
    });

    after(function (done) {
      acceptFiles.removeAllFiles(function (err) {
        done();
      });
    });

    it('should add file', function (done) {

      var file = {
        id: '1',
        fileId: '2',
        filename: 'something',
        stats: null,
        writePath: null
      };

      acceptFiles.addFile(file, function (err) {

        assert.equal(err, null);
        assert.equal(acceptFiles.files.length, 1);

        done();

      });

    });

  });

  describe('getFiles', function () {

    before(function (done) {
      acceptFiles.addFile(tempFile, function (err) { done() });
    });

    after(function (done) {
      acceptFiles.removeAllFiles(function (err) { done() });
    });

    it('should get files', function (done) {

      acceptFiles.getFiles('id', '1', function (err, files) {
        assert.equal(err, null);
        assert.equal(files.length, 1);
        done();
      });

    });

    it('should get files with multiple properties', function (done) {

      acceptFiles.getFiles(['id', 'filename'], ['1', 'something'], function (err, files) {
        assert.equal(err, null);
        assert.equal(files.length, 1);
        done();
      });

    });

    it('should get error file does not exist', function (done) {

      acceptFiles.getFiles('id', '5', function (err, files) {

        assert.equal(err, 'file does not exist');
        done();

      });

    });

  });

  describe('removeFiles', function () {

    before(function (done) {
      acceptFiles.addFile(tempFile, function (err) {
        done();
      });
    });

    it('should not remove files', function (done) {

      acceptFiles.removeFiles('id', '5', function (err) {

        assert.equal(err, null);
        assert.equal(acceptFiles.files.length, 1);

        done();

      });

    });

    it('should remove files', function (done) {

      acceptFiles.removeFiles('id', '1', function (err) {

        assert.equal(err, null);
        assert.equal(acceptFiles.files.length, 0);

        done();

      });

    });

  });

  describe('removeAllFiles', function () {

    before(function (done) {
      acceptFiles.addFile(tempFile, function (err) {
        done();
      });
    });

    after(function (done) {
      acceptFiles.removeAllFiles(function (err) {
        done();
      });
    });

    it('should remove all files', function (done) {

      acceptFiles.removeAllFiles(function (err) {

        assert.equal(err, null);
        assert.equal(acceptFiles.files.length, 0);

        done();

      });

    });

  });

});
