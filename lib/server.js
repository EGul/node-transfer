
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var sockets = [];

var __dirnameBack = __dirname.split('/');
__dirnameBack.splice(__dirnameBack.length - 1);
__dirnameBack = __dirnameBack.join('/');

app.get('/', function (req, res) {
  res.sendFile(__dirnameBack + '/client/index.html');
});

app.get('/angular.min.js', function (req, res) {
  res.sendFile(__dirnameBack + '/node_modules/angular/angular.min.js');
});

app.get('/angular.min.js.map', function (req, res) {
  res.send('null');
});

app.get('/socket.io-client.js', function (req, res) {
  res.sendFile(__dirnameBack + '/node_modules/socket.io-client/socket.io.js');
});

app.get('/node-uuid.js', function (req, res) {
  res.sendFile(__dirnameBack + '/node_modules/node-uuid/uuid.js');
});

app.get('/minimist.js', function (req, res) {
  res.sendFile(__dirnameBack + '/tempMinimist.js');
});

app.get('/app.js', function (req, res) {
  res.sendFile(__dirnameBack + '/client/app.js');
});

app.get('/client.js', function (req, res) {
  res.sendFile(__dirnameBack + '/client/client.js');
});

app.get('/users.js', function (req, res) {
  res.sendFile(__dirnameBack + '/client/users.js');
});

app.get('/user.js', function (req, res) {
  res.sendFile(__dirnameBack + '/client/user.js');
});

app.get('/rooms.js', function (req, res) {
  res.sendFile(__dirnameBack + '/client/rooms.js');
});

app.get('/messages.js', function (req, res) {
  res.sendFile(__dirnameBack + '/client/messages.js');
});

app.get('/sendFiles.js', function (req, res) {
  res.sendFile(__dirnameBack + '/client/sendFiles.js');
});

app.get('/acceptFiles.js', function (req, res) {
  res.sendFile(__dirnameBack + '/client/acceptFiles.js');
});

app.get('/index.css', function (req, res) {
  res.sendFile(__dirnameBack + '/client/index.css');
});

app.get('/rightSomethingDirective.js', function (req, res) {
  res.sendFile(__dirnameBack + '/client/rightSomethingDirective.js');
});

app.get('/fileUploadDirective.js', function (req, res) {
  res.sendFile(__dirnameBack + '/client/fileUploadDirective.js');
});


app.get('/test', function (req, res) {
  res.sendFile(__dirnameBack + '/test/client/test.html');
});

app.get('/mocha.js', function (req, res) {
  res.sendFile(__dirnameBack + '/node_modules/mocha/mocha.js')
});

app.get('/mocha.css', function (req, res) {
  res.sendFile(__dirnameBack + '/node_modules/mocha/mocha.css')
});

app.get('/angular-mocks.js', function (req, res) {
  res.sendFile(__dirnameBack + '/node_modules/angular-mocks/angular-mocks.js')
});

app.get('/expect.js', function (req, res) {
  res.sendFile(__dirnameBack + '/node_modules/expect.js/index.js')
});

app.get('/test.js', function (res, res) {
  res.sendFile(__dirnameBack + '/test/client/test.js')
});

app.get('/testUsers.js', function (res, res) {
  res.sendFile(__dirnameBack + '/test/client/testUsers.js')
});

app.get('/testRooms.js', function (res, res) {
  res.sendFile(__dirnameBack + '/test/client/testRooms.js')
});

app.get('/testMessages.js', function (res, res) {
  res.sendFile(__dirnameBack + '/test/client/testMessages.js')
});

app.get('/testUser.js', function (res, res) {
  res.sendFile(__dirnameBack + '/test/client/testUser.js')
});

app.get('/testSendFiles.js', function (res, res) {
  res.sendFile(__dirnameBack + '/test/client/testSendFiles.js')
});

app.get('/testAcceptFiles.js', function (res, res) {
  res.sendFile(__dirnameBack + '/test/client/testAcceptFiles.js')
});


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

  socket.on('createRoom', function (roomId, name) {
    sockets.forEach(function (e) {
      if (socket.id !== e.socket.id) {
        e.socket.emit('createRoom', roomId, socket.id, name);
      }
    });
  });

  socket.on('removeRoom', function (roomId) {
    sockets.forEach(function (e) {
      if (socket.id !== e.socket.id) {
        e.socket.emit('removeRoom', roomId);
      }
    });
  });

  socket.on('joinRoom', function (roomId) {
    sockets.forEach(function (e) {
      if (socket.id !== e.socket.id) {
        e.socket.emit('joinRoom', roomId, socket.id);
      }
    });
  });

  socket.on('leaveRoom', function (roomId) {
    sockets.forEach(function (e) {
      if (socket.id !== e.socket.id) {
        e.socket.emit('leaveRoom', roomId, socket.id);
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
