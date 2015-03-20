
describe('sendFiles', function () {

  var $scope = null;
  var sendFiles = null;

  beforeEach(function () {

    module('app');

    inject(function ($rootScope, sendFilesFactory) {

      $scope = new $rootScope.$new();
      sendFiles = new sendFilesFactory();

    });

  });

  describe('addSend', function () {

    it('should add file', function () {

      sendFiles.addFile('0', 'something.json', 'some data', function (err, json) {

        expect(err).to.eql(null);
        expect(json).to.not.eql(null);
        expect(sendFiles.sendFiles.length).to.eql(1);

      });

    });

  });

  describe('getFiles', function () {

    beforeEach(function (done) {
      sendFiles.addFile('0', 'something.json', 'some data', function (err) { done() });
    });

    afterEach(function (done) {
      sendFiles.removeAllFiles();
      done();
    });

    it('should get error file does not exist', function (done) {

      sendFiles.getFiles('filename', 'temp.json', function (err, files) {

        expect(err).to.eql('file does not exist');
        expect(files).to.eql(null);

        done();

      });

    });

    it('should get files', function (done) {

      sendFiles.getFiles('filename', 'something.json', function (err, files) {

        expect(err).to.eql(null);
        expect(files.length).to.eql(1);

        done();

      });

    });

  });

  describe('removeFiles', function () {

    beforeEach(function (done) {
      sendFiles.addFile('0', 'something.json', 'some data', function (err) { done() });
    });

    afterEach(function (done) {
      sendFiles.removeAllFiles();
      done();
    });

    it('should get error files does not exist', function (done) {

      sendFiles.removeFiles('filename', 'temp.json', function (err) {

        expect(err).to.eql('file does not exist');
        expect(sendFiles.sendFiles.length).to.eql(1);

        done();

      });

    });

    it('should remove files', function (done) {

      sendFiles.removeFiles('filename', 'something.json', function (err) {

        expect(err).to.eql(null);
        expect(sendFiles.sendFiles.length).to.eql(0);

        done();

      });

    });

  });

  describe('removeAllFiles', function () {

    before(function (done) {
      sendFiles.addFile('0', 'something.json', 'some data', function (err) { done() });
    });

    it('should remove all files', function () {

      sendFiles.removeAllFiles();

      expect(sendFiles.sendFiles.length).to.eql(0);

    });

  });

});
