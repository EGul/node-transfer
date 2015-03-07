
var app = angular.module('app');
app.factory('acceptFilesFactory', acceptFilesFactory);

function acceptFilesFactory() {

  return function () {

    this.acceptFiles = [];

    this.addFile = function (acceptFile, fn) {

      this.acceptFiles.push(acceptFile);

      fn(null);

    }

    this.getFiles = function (property, value, fn) {

      var tempFiles =  this.acceptFiles.filter(function (e) {
        if (e[property] === value) return e;
      });

      if(!tempFiles.length) return fn('file does not exist', tempFiles);

      fn(null, tempFiles);

    }

    this.removeFiles = function (property, value, fn) {

      var numFiles = this.acceptFiles.length;

      this.acceptFiles = this.acceptFiles.filter(function (e) {
        if (e[property] !== value) return e;
      });

      if (this.acceptFiles.length === numFiles) return fn('file does not exist');

      fn(null);

    }

  }

}
