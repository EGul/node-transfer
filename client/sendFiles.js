
var app = angular.module('app');
app.factory('sendFilesFactory', sendFilesFactory);

function sendFilesFactory() {

  return function () {

    this.sendFiles = [];

    this.addFile = function (roomId, filename, data, fn) {

      var sendFile = {
        roomId: roomId,
        toId: null,
        fileId: uuid.v1(),
        filename: filename,
        data: data,
        stats: null,
      }

      this.sendFiles.push(sendFile);

      fn(null, sendFile);

    }

    this.getFiles = function (property, value, fn) {

      var tempFiles = this.sendFiles.filter(function (e) {
        if (property === null || e[property] === value) return e;
      });

      if (!tempFiles.length) return fn('file does not exist', null);

      fn(null, tempFiles);

    }

    this.removeFiles = function (property, value, fn) {

      var numFiles = this.sendFiles.length;

      this.sendFiles = this.sendFiles.filter(function (e) {
        if (e[property] !== value) return e;
      });

      if (numFiles === this.sendFiles.length) return fn('file does not exist');

      fn(null);

    }

    this.removeAllFiles = function () {
      this.sendFiles = [];
    }

  }

}
