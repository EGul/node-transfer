
var io = require('socket.io-client');
var fs = require('fs');
var uuid = require('node-uuid')

var users = require('./users');

var socket = null;

var sendFiles = [];
var acceptFiles = [];

var tempJson;

function didConnect() {

  socket.on('something', function (json) {

    users.addUser(json, function (err) {

    });

    emit('something', [json]);

    socket.emit('userJson', json.id, tempJson);

    sendFiles.forEach(function (e) {
      if (e.to === null || e.to === json.id) {
        var filename = e.path.split('/');
        filename = filename[filename.length - 1];
        socket.emit('hasRequest', e.to, e.id, filename, e.stats);
      }
    });

  });

  socket.on('didDisconnect', function (id) {

    var from = users.secondGetUserById(id)[0].json.name;

    users.removeUserById(id, function (err) {

    });

    acceptFiles = acceptFiles.filter(function (e) {
      if (e.id !== id) return e;
    });

    sendFiles = sendFiles.filter(function (e) {
      if (e.to !== id) return e;
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

    acceptFiles.push(acceptFile);

    emit('hasRequest', [name, filename]);

  });

  socket.on('acceptRequest', function (id, fileId) {

    var path = getValue(sendFiles, 'id', fileId)[0].path;

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

    var id = getValue(acceptFiles, 'fileId', fileId)[0].id;
    var from = users.secondGetUserById(id)[0].json.name;
    var filename = getValue(acceptFiles, 'fileId', fileId)[0].filename;

    emit('fileData', [from, filename]);

  });

  socket.on('jsonChanged', function (json) {

    var from = users.secondGetUserById(json.id)[0].json.name;

    users.jsonChanged(json, function (err) {

    });

    emit('jsonChanged', [from]);

  });

  socket.on('rmsend', function (fileId) {

    var from = null
    var filename = null;

    var id = getValue(acceptFiles, 'fileId', fileId)[0].id;
    var from = users.secondGetUserById(id)[0].json.name;
    filename = getValue(acceptFiles, 'fileId', fileId)[0].filename;

    acceptFiles = acceptFiles.filter(function (e) {
      if (e.fileId !== fileId) {
        return e;
      }
    });

    emit('rmsend', [from, filename]);

  });

}

function connect(host, fn) {

  var options = {
    'force new connection': true
  };

  socket = io('http://' + host, options);

  socket.on('connect', function () {

    tempJson.id = socket.id;

    socket.emit('something', tempJson);

    didConnect();
    fn();

  });

}

function disconnect() {

  socket.disconnect();

  users.removeAllUsers(function (err) {

  });
  sendFiles = [];
  acceptFiles = [];

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

      tempJson = parseJson;

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

      var tempId = tempJson.id;

      tempJson = JSON.parse(data);
      tempJson.id = tempId;

      socket.emit('jsonChanged', tempJson);

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

  fs.exists(path, function (exists) {

    if (!exists) return fn('file does not exist');

    fs.stat(path, function (err, stats) {

      if (err) return fn(err);

      var fileId = uuid.v1();

      var sendFile = {
        id: fileId,
        path: path,
        stats: stats,
        to: id
      }

      sendFiles.push(sendFile);

      var filename = path.split('/');
      filename = filename[filename.length - 1];

      socket.emit('hasRequest', id, fileId, filename, stats);

    });

  });

}

function listSend(to, fn) {

  var id = null;

  if (to) {
    var tempJson = users.secondGetUserByProperty('name', to);
    if (tempJson.length === 0) return fn('user does not exist');
    id = tempJson[0].json.id;
  }

  var tempSendFiles = sendFiles.filter(function (e) {
    if (id === null || id === e.to) {
      return e;
    }
  }).map(function (e) {

    var path = e.path;
    var to = null;
    if (e.to) {
      to = users.secondGetUserByProperty('id', e.to)[0].json.name;
    }

    return {path: path, to: to};
  });

  fn(null, tempSendFiles);

}

function rmsend(to, filename, fn) {

  var toId = null;

  if (to) {
    var tempJson = users.secondGetUserByProperty('name', to);
    if (tempJson.length === 0) return fn('user does not exist');
    toId = tempJson[0].json.id;
  }

  var removeFiles = sendFiles.filter(function (e) {
    var secondFilename = e.path.split('/');
    secondFilename = secondFilename[secondFilename.length - 1];
    if (e.to === toId) {
      if (secondFilename === filename) return e;
    }
  });

  sendFiles = sendFiles.filter(function (e) {

    if (e.to === toId) {
      var tempFilename = e.path.split('/');
      tempFilename = tempFilename[tempFilename.length - 1];
      if (tempFilename !== filename) return e;
    }
    else {
      if (e.to !== toId) {
        return e;
      }
    }

  });

  removeFiles.forEach(function (e) {
    socket.emit('rmsend', e.to, e.id);
  });

  if (!removeFiles.length) fn('file does not exist');
  if (removeFiles.length) fn(null);

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

    var tempJson = users.secondGetUserByProperty('name', name);
    if (tempJson.length === 0) return fn('user does not exist');
    id = tempJson[0].json.id;

    var secondTempArr = getValue(acceptFiles, 'filename', filename);
    if (secondTempArr.length == 0) return fn('file does not exist');

    fileId = getValue(acceptFiles, 'filename', secondTempArr[0].filename)[0].fileId;

  }
  else {

    var thirdTempArr = getValue(acceptFiles, 'filename', filename);
    if (thirdTempArr.length === 0) return fn('file does not exist');
    fileId = thirdTempArr[0].fileId;

    id = getValue(acceptFiles, 'fileId', fileId)[0].id;

  }

  acceptFile = getValue(acceptFiles, 'fileId', fileId)[0].writePath = writePath;

  socket.emit('acceptRequest', id, fileId);

  fn(null);

}

function listAccept(from, fn) {

  var id = null;
  var tempFrom = null;

  if (from) {
    var tempJson = users.secondGetUserByProperty('name', from);
    if (tempJson.length === 0) return fn('user does not exist');
    tempFrom = tempJson[0].json.name;
  }

  var tempAcceptFiles = acceptFiles.filter(function (e) {
    if (from === null || from === tempFrom) return e;
  });
  tempAcceptFiles = tempAcceptFiles.map(function (e) {

    var name = null;
    var id = getValue(acceptFiles, 'fileId', e.fileId)[0].id;
    var name = users.secondGetUserByProperty('id', id)[0].json.name;

    var tempAcceptFile = {
      filename: e.filename,
      from: name
    };

    return tempAcceptFile;

  });

  fn(null, tempAcceptFiles);

}

function tempJson(fn) {
  fn(tempJson);
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
