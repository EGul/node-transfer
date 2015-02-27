
var io = require('socket.io-client');
var fs = require('fs');
var uuid = require('node-uuid')

var users = require('./users');
var User = require('./user');
var sendFiles = require('./sendFiles');
var acceptFiles = require('./acceptFiles');

var socket = null;

var user = null;

function didConnect() {

  socket.on('something', function (json) {

    users.addUser(json, function (err) {

    });

    emit('something', [json]);

    socket.emit('userJson', json.id, user.json);

    sendFiles.getFiles(null, null, function (err, files) {
      files.forEach(function (e) {
        if (e.to === null || e.to === json.id) {
          var filename = e.path.split('/');
          filename = filename[filename.length - 1];
          socket.emit('hasRequest', e.to, e.id, filename, e.stats);
        }
      });
    });

  });

  socket.on('didDisconnect', function (id) {

    var from = users.secondGetUserById(id)[0].json.name;

    users.removeUserById(id, function (err) {

    });

    acceptFiles.removeFiles('id', id, function (err) {

    });

    sendFiles.removeFiles('id', id, function (err) {

    });

    emit('didDisconnect', [from]);

  });

  socket.on('userJson', function (json) {

    users.addUser(json, function (err) {

    });

    emit('userJson', [json]);

  });

  socket.on('message', function (id, message) {

    var from = users.secondGetUserById(id)[0].json.name;

    emit('message', [from, message]);

  });

  socket.on('hasRequest', function (id, fileId, filename, stats) {

    var name = users.secondGetUserById(id)[0].json.name;

    var acceptFile = {
      id: id,
      fileId: fileId,
      filename: filename,
      stats: stats,
      writePath: null
    };

    acceptFiles.addFile(acceptFile, function (err) {

    });

    emit('hasRequest', [name, filename]);

  });

  socket.on('acceptRequest', function (id, fileId) {

    var path = sendFiles.secondGetFiles('id', fileId)[0].path;

    fs.exists(path, function (exists) {

      if (!exists) return message('file does not exist');

      fs.readFile(path, function (err, data) {

        if (err) return message('could not read file');

        emit('send');

        socket.emit('fileData', id, fileId, data);

      });

    });

  });

  socket.on('fileData', function (fileId, data) {

    acceptFiles.getFiles('fileId', fileId, function (err, files) {

      var id = files[0].id;
      var filename = files[0].filename;
      var from = users.secondGetUserById(id)[0].json.name;

      emit('fileData', [from, filename]);

    });

  });

  socket.on('jsonChanged', function (json) {

    var from = users.secondGetUserById(json.id)[0].json.name;

    users.jsonChanged(json, function (err) {

    });

    emit('jsonChanged', [from]);

  });

  socket.on('rmsend', function (fileId) {

    acceptFiles.getFiles('fileId', fileId, function (err, files) {

      var from = users.secondGetUserById(files[0].id)[0].json.name;

      emit('rmsend', [from, files[0].filename]);

      acceptFiles.removeFiles('fileId', fileId, function (err) { });

    });

  });

}

function connect(host, fn) {

  var options = {
    'force new connection': true
  };

  socket = io('http://' + host, options);

  socket.on('connect', function () {

    user.json.id = socket.id;

    socket.emit('something', user.json);

    didConnect();
    fn();

  });

}

function disconnect() {

  socket.disconnect();

  users.removeAllUsers(function (err) {

  });
  sendFiles.removeAllFiles();
  acceptFiles.removeAllFiles(function (err) { });

}

function json(path, fn) {

  var directory = __dirname.split('/');
  directory.splice(directory.length - 1);
  directory = directory.join('/');

  var fullPath = directory + '/' + path;

  fs.exists(fullPath, function (exists) {

    if (!exists) return fn('json does not exist');

    fs.readFile(fullPath, function (err, data) {

      if (err) return fn(err);

      var parseJson = JSON.parse(data);

      user = new User(parseJson);

      return fn(false);
    });

  });

}

function setJson(path, fn) {

  var directory = __dirname.split('/');
  directory.splice(directory.length - 1);
  directory = directory.join('/');

  var fullPath = directory + '/' + path;

  fs.exists(fullPath, function (exists) {

    if (!exists) return fn('json does not exist');

    fs.readFile(fullPath, function (err, data) {

      if (err) return fn(err);

      var tempId = user.json.id;
      user.json = JSON.parse(data);
      user.json.id = tempId;

      socket.emit('jsonChanged', user.json);

      fn(null);

    });

  });

}

function message(to, message, fn) {

  var id = null;

  if (to) {
    var tempJson = users.secondGetUserByProperty('name', to);
    if (tempJson.length === 0) return fn('user does not exist');
    id = tempJson[0].json.id;
  }

  socket.emit('message', id, message);

}

function listUsers(fn) {

  users.listUsersJson(null, function (err, json) {
    fn(json);
  });

}

function send(to, path, fn) {

  var id = null;

  if (to) {
    var tempJson = users.secondGetUserByProperty('name', to);
    if (tempJson.length === 0) return fn('user does not exist');
    id = tempJson[0].json.id;
  }


  sendFiles.addSend(id, path, function (err, fileJson) {

    if (err) return fn(err);

    var filename = path.split('/');
    filename = filename[filename.length - 1];

    socket.emit('hasRequest', id, fileJson.id, filename, fileJson.stats);

  });

}

function listSend(to, fn) {

  var tempProperty = null
  var id = null;

  if (to) {
    var tempJson = users.secondGetUserByProperty('name', to);
    if (tempJson.length === 0) return fn('user does not exist');
    id = tempJson[0].json.id;
    tempProperty = 'to';
  }

  sendFiles.getFiles(tempProperty, id, function (err, files) {

    var somethingFiles = files.map(function (e) {

      var to = null;
      if (e.to) {
        to = users.secondGetUserByProperty('id', e.to)[0].json.name;
      }

      return {path: e.path, to: to};
    });

    fn(null, somethingFiles);

  });

}

function rmsend(to, filename, fn) {

  var tempProperty = null;
  var toId = null;

  if (to) {
    var tempJson = users.secondGetUserByProperty('name', to);
    if (tempJson.length === 0) return fn('user does not exist');
    toId = tempJson[0].json.id;
    tempPropert = 'to'
  }

  sendFiles.getFiles(tempProperty, toId, function (err, files) {

    sendFiles.getFilesWithFilename(filename, function (err, secondFiles) {

      secondFiles.forEach(function (e) {
        socket.emit('rmsend', e.to, e.id);
      });

      if (!secondFiles.length) return fn('file does not exist');

      sendFiles.removeFiles(['to', 'filename'], [toId, filename], function (err) {
        fn(null);
      });

    });
  });

}

function accept(name, filename, path, toName, fn) {

  var id = null;
  var fileId = null;
  var writePath = null;

  if (!path) return fn('must provide path');

  var exists = fs.existsSync(path);
  if (!exists) return fn('path does not exist');

  if (toName) {
    writePath = path + '/' + toName
    if (fs.existsSync(writePath)) return fn('file already exists');
  }
  else {
    writePath = path + '/' + filename;
    if (fs.existsSync(writePath)) return fn('file already exists');
  }

  if (name) {
    var tempUsers = users.secondGetUserByProperty('name', name);
    if (!tempUsers.length) return fn('user does not exist');
    acceptFiles.getFiles(['id', 'filename'], [tempUsers[0].json.id, filename], didGetFiles);
  }
  else {
    acceptFiles.getFiles('filename', filename, didGetFiles);
  }

  function didGetFiles(err, files) {

    if (err) return fn(err);

    fileId = files[0].fileId;
    id = files[0].id;

    acceptFiles.files = acceptFiles.files.map(function (e) {
      if (e.fileId === fileId) {
        e.fileId = fileId;
      }
      return e;
    });

    socket.emit('acceptRequest', id, fileId);

    fn(null);

  }

}

function listAccept(from, fn) {

  if (from) {
    var tempUsers = users.secondGetUserByProperty('name', from);
    if (!tempUsers.length) return fn('user does not exist');
    acceptFiles.getFiles('id', tempUsers[0].json.id, didGetFiles);
  }
  else {
    acceptFiles.getFiles(null, null, didGetFiles);
  }

  function didGetFiles(err, files) {

    var tempFiles = files.map(function (e) {

      var name = users.secondGetUserByProperty('id', e.id)[0].json.name;

      return {
        filename: e.filename,
        from: name
      }

    });

    fn(null, tempFiles);

  }

}

function tempJson(fn) {
  fn(user.json);
}

function listJson(from, fn) {

  users.listUsersJson(from, function (err, json) {
    if (err) return fn(err);
    fn(null, json);
  });

}

function getValue(arr, property, value) {

  var tempArr = arr.filter(function (e) {
    if (e[property] === value) return e;
  });

  return tempArr;
}

var properties = { };

function on(temp, fn) {
  properties[temp] = fn;
}

function removeAllOn() {
  properties = { };
}

function emit(temp, arg) {
  if (properties.hasOwnProperty(temp)) {
    properties[temp].apply(null, arg);
  }
}

function isConnected() {
  if (socket === null) return false;
  return true;
}


module.exports.on = on;
module.exports.removeAllOn = removeAllOn;

module.exports.isConnected = isConnected;

module.exports.connect = connect;
module.exports.disconnect = disconnect;
module.exports.json = json;
module.exports.setJson = setJson;
module.exports.message = message;
module.exports.listUsers = listUsers;
module.exports.send = send;
module.exports.listSend = listSend;
module.exports.rmsend = rmsend;
module.exports.accept = accept;
module.exports.listAccept = listAccept;
module.exports.listJson = listJson;
module.exports.tempJson = tempJson;
