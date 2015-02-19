
var fs = require('fs');
var uuid = require('node-uuid');

var files = [];

function addSend(to, path, fn) {

  fs.exists(path, function (exists) {

    if (!exists) return fn('file does not exist');

    fs.stat(path, function (err, stats) {

      if (err) return fn(err);

      var id = uuid.v1();

      var sendFile = {
        id: id,
        path: path,
        stats: stats,
        to: to
      };

      files.push(sendFile);

      fn(null, sendFile);

    });

  });

}

function getFiles(property, value, fn) {

  var tempFiles = files.filter(function (e) {
    if (property === null || e[property] === value) return e;
  });

  fn(null, tempFiles);

}

function secondGetFiles(property, value) {

  var tempFiles = files.filter(function (e) {
    if (property === null || e[property] === value) return e;
  });

  return tempFiles;
}

function getFilesWithFilename(filename, fn) {
  var name = null;
  var tempFiles = files.filter(function (e) {
    name = e.path.split('/');
    name = name[name.length - 1];
    if (name === filename) return e;
  });
  fn(null, tempFiles);
}

function secondGetFilesWithProperty(property, value) {
  var tempFiles = files.filter(function (e) {
    if (property === null || e[property] === value) return e;
  });
  return tempFiles;
}

function removeFiles(properties, values, fn) {

  if (!Array.isArray(properties)) properties = [properties];
  if (!Array.isArray(values)) values = [values];

  var remove = false;
  files = files.filter(function (e) {
    for (var i = 0; i < properties.length; i++) {
      if (!remove) {
        if (e[properties[i]] === values[i]) remove = true;
      }
    }
    if (!remove) return e;
    remove = false;
  });
  fn(null);

}

function removeAllFiles() {
  files = [];
}

module.exports.addSend = addSend;
module.exports.getFiles = getFiles;
module.exports.secondGetFiles = secondGetFiles;
module.exports.getFilesWithFilename = getFilesWithFilename;
module.exports.removeFiles = removeFiles;
module.exports.removeAllFiles = removeAllFiles;
