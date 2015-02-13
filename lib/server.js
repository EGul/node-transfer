
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var sockets = [];

io.on('connect', function (socket) {

  var temp;

  socket.on('something', function(json) {

    temp = {
      socket: socket,
      json: json
    };

    sockets.push(temp);

    sockets.forEach(function (e) {
      if (socket.id !== e.socket.id) {
        e.socket.emit('something', json);
      }
    });

    console.log('connected: ' + json.name);
  });

  socket.on('disconnect', function () {

    sockets = sockets.filter(function (e) {
      if (socket.id !== e.socket.id) return e;
    });

    sockets.forEach(function (e) {
      e.socket.emit('didDisconnect', socket.id);
    });

    console.log('disconnected: ' + temp.json.name);

  });

  socket.on('userJson', function (id, json) {
    sockets.forEach(function (e) {
      if (e.socket.id === id) {
        e.socket.emit('userJson', json);
      }
    });
  });

  socket.on('jsonChanged', function (json) {
    sockets.forEach(function (e) {
      if (e.socket.id === socket.id) {
        e.json = json;
      }
      else {
        e.socket.emit('jsonChanged', json);
      }
    });
  });

  socket.on('message', function (to, message) {
    sockets.forEach(function (e) {
      if (socket.id !== e.socket.id) {
        if (to === null || to === e.socket.id) {
          e.socket.emit('message', socket.id, message);
        }
      }
    });
  });

  socket.on('users', function() {
    var users = sockets.map(function (e) {
      return e.json.name;
    });
    socket.emit('users', users);
  });

  socket.on('fileData', function (id, fileId, data) {

    sockets.forEach(function (e) {
      if (id === e.socket.id) {
        e.socket.emit('fileData', fileId, data);
      }
    });

  });

  socket.on('hasRequest', function (id, fileId, filename, stats) {

    sockets.forEach(function (e) {
      if (socket.id !== e.socket.id) {
        if (id === null || id === e.socket.id) {
          e.socket.emit('hasRequest', socket.id, fileId, filename, stats);
        }
      }
    });

  });

  socket.on('acceptRequest', function (id, fileId) {

    sockets.forEach(function (e) {
      if (socket.id !== e.socket.id) {
        if (id === e.socket.id) {
          e.socket.emit('acceptRequest', socket.id, fileId);
        }
      }
    });

  });

  socket.on('rmsend', function (toId, fileId) {

    sockets.forEach(function (e) {
      if (socket.id !== e.socket.id) {
        if (toId === null || toId === e.socket.id) {
          e.socket.emit('rmsend', fileId);
        }
      }
    });

  });

});

function connect(port, fn) {

  http.listen(port, function (err) {

    fn(err);

  });

}

module.exports.connect = connect;
