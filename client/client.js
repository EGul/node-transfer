
var app = angular.module('app');

app.controller('clientCtrl', clientCtrl);
app.directive('usersDirective', usersDirective);

function usersDirective() {

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    template: [
    '<div class="user">',
      '<div class="box"> </div>',
      '<div class="right">',
      '{{ item.json.name }}<br>',
      '<span>something</span>',
      '</div>',
    '</div>'
    ].join(''),
    link: function (scope, elem, attrs) {

    }
  }

}

function clientCtrl($scope, roomsFactory, messagesFactory, usersFactory, sendFilesFactory, acceptFilesFactory) {

  var socket = null;
  var tempJson = null;
  var currentRoom = null;
  var rooms = new roomsFactory();
  var messages = new messagesFactory();
  var users = new usersFactory();
  var sendFiles = new sendFilesFactory();
  var acceptFiles = new acceptFilesFactory();

  $scope.tempJson = tempJson;
  $scope.currentRoom = currentRoom;
  $scope.rooms = rooms.rooms;
  $scope.roomsUsers = rooms.users;
  $scope.messages = [];
  $scope.users = [];
  $scope.sendFiles = [];
  $scope.acceptFiles = acceptFiles.acceptFiles;

  addMessage(null, null, 'json: ');

  $scope.tempAddFile = function (filename, data) {

    function setJson() {

      json = JSON.parse(data);

      function isCorrectFormat(json) {
        if (json.hasOwnProperty('name')) return true;
        return false;
      }

      if (isCorrectFormat(json)) {

        tempJson = json;
        $scope.tempJson = tempJson;

        addMessage(null, null, 'did get json');

      }
      else {

        addMessage(null, null, 'json is not correct');

      }

    }

    function addSendFile() {

      if (currentRoom === null) {
        addMessage(null, null, 'no room set');
        return null;
      }

      sendFiles.addFile(currentRoom.id, filename, data, function (err, json) {

        if (err) {
          addMessage(null, null, err);
          return null;
        }

        addMessage(null, null, 'did upload file');
        $scope.sendFiles.push(json);

        socket.emit('hasRequest', null, json.fileId, json.filename, null);

      });

    }

    if (tempJson === null) {
      setJson();
    }
    else {
      addSendFile();
    }

  }

  $scope.submit = function () {

    var text = $scope.text;
    $scope.text = '';

    if (tempJson === null) {
      $scope.$emit('noJsonError');
      return null;
    }

    var line = text;
    var argv = minimist(line.split(' '));

    function has(property) {
      if (argv.hasOwnProperty(property)) return true;
      return false;
    }

    if (!has('connect') && !has('disconnect') && !has('createroom') && !has('rmroom') && !has('setroom')) {
      if (currentRoom === null) {
        addMessage(null, null, 'no room set');
        return null;
      }
    }

    var argvLength = 0;
    for (p in argv) {
      argvLength++;
    }

    if (argv.hasOwnProperty('connect')) {
      handleConnect(argv);
    }

    if (argv.hasOwnProperty('disconnect')) {
      handleDisconnect(argv);
    }

    if (argv.hasOwnProperty('setroom')) {
      handleSetRoom(argv);
    }

    if (argv.hasOwnProperty('createroom')) {
      handleCreateRoom(argv);
    }

    if (argv.hasOwnProperty('rmroom')) {
      handleRemoveRoom(argv);
    }

    if (argv.hasOwnProperty('listsend')) {
      handleListSend(argv);
    }

    if (argv.hasOwnProperty('rmsend')) {
      handleRemoveSend(argv);
    }

    if (argv.hasOwnProperty('accept')) {
      handleAccept(argv);
    }

    if (argv._ && argvLength === 1) {
      handleMessage(line);
    }

  }

  function addMessage(roomId, fromId, message) {

    messages.addMessage(roomId, fromId, message);

    var tempMessage = {
      roomId: roomId,
      from: fromId,
      message: message
    };

    if (roomId === null) {
      $scope.messages.push(tempMessage);
    }

    if (currentRoom !== null) {
      if (currentRoom.id === roomId) {
        $scope.messages.push(tempMessage);
      }
    }

  }

  function handleConnect(argv) {

    if (tempJson === null) return $scope.$emit('connectError');

    var options = {
      'force new connection': true
    };

    socket = io('http://localhost:8080', options);

    socket.on('connect', function () {

      $scope.socket = socket;

      tempJson.id = socket.id;
      $scope.tempJson = tempJson;

      socket.emit('something', tempJson);

      sendFiles.sendFiles.forEach(function (e) {
        socket.emit('hasRequest', null, e.fileId, e.filename, e.stats);
      });

      addMessage(null, null, 'did connect');

      didConnect();

      $scope.$emit('connect');

    });

  }

  function handleDisconnect(argv) {

    socket.on('disconnect', function () {

      addMessage(null, null, 'did disconnect');

      currentRoom = null;
      rooms.removeAllRooms();
      users.removeAllUsers();
      sendFiles.removeAllFiles();
      acceptFiles.removeAllFiles();
      $scope.currentRoom = currentRoom;
      $scope.rooms = rooms.rooms;
      $scope.roomsUsers = rooms.users;
      $scope.users = [];
      $scope.sendFiles = [];
      $scope.acceptFiles = acceptFiles.acceptFiles;

      $scope.$emit('disconnect');

    });

    socket.disconnect();

  }

  function handleSetRoom(argv) {

    var name = argv['setroom'];

    rooms.getRooms('name', name, function (err, tempRooms) {

      if (err) {
        addMessage(null, null, err);
        $scope.$emit('setroom');
        return false;
      }

      if (currentRoom !== null) {
        if (currentRoom.id === tempRooms[0].id) {
          addMessage(null, null, 'room already set');
          return null;
        }
      }

      var room = tempRooms[0];
      var roomId = room.id;

      messages.getMessages('roomId', roomId, function (err, roomMessages) {
        $scope.messages = roomMessages;
      });

      $scope.users = [];
      rooms.getUsersByRoomId(room.id, function (err, roomUsers) {
        roomUsers.forEach(function (e) {
          users.getUsers('id', e.userId, function (err, users) {
            var user = users[0];
            $scope.users.push(user);
          });

        });
      });

      $scope.sendFiles = [];
      sendFiles.getFiles('roomId', room.id, function (err, files) {
        if (err) return null;
        $scope.sendFiles = files;
      });

      var previousRoom = currentRoom;
      currentRoom = room;
      $scope.currentRoom = currentRoom;

      socket.emit('joinRoom', currentRoom.id);
      if (previousRoom !== null) socket.emit('leaveRoom', previousRoom.id);

      $scope.$emit('setroom');

    });

  }

  function handleCreateRoom(argv) {

    var name = argv['createroom'];

    rooms.createRoom(name, function (err) {

      if (err) {
        addMessage(null, null, err);
        return false;
      }

      $scope.rooms = rooms.rooms;
      $scope.roomsUsers = rooms.users;

      var room = rooms.rooms[rooms.rooms.length - 1];
      var roomId = room.id;

      socket.emit('createRoom', roomId, name);

      $scope.$emit('didcreateroom');

    });

  }

  function handleRemoveRoom(argv) {

    var name = argv['rmroom'];

    rooms.getRooms('name', name, function (err, tempRooms) {

      if (err) {
        addMessage(null, null, err);
        return false;
      }

      var room = tempRooms[0];
      var roomId = room.id;

      rooms.removeRooms('name', name, function (err) {

        if (err) {
          addMessage(null, null, err);
          return false;
        }

        sendFiles.removeFiles('roomId', roomId, function (err) {

          $scope.rooms = rooms.rooms;
          $scope.roomsUsers = rooms.users;

          if (currentRoom === room) {
            $scope.sendFiles = [];
          }

          if (currentRoom !== null) {
            if (currentRoom.id === roomId) {
              currentRoom = null;
              $scope.currentRoom = currentRoom;
            }
          }

          socket.emit('removeRoom', roomId);

          $scope.$emit('didremoveroom');

        });

      });

    });

  }

  function handleMessage(line) {

    if (socket === null || (socket !== null && !socket.connected)) {
      addMessage(null, null, 'not connected');
      return false;
    }

    var id = null;
    var message = line;

    if (id) {

    }

    addMessage(currentRoom.id, tempJson.name, line);

    socket.emit('message', currentRoom.id, id, message);

  }

  function handleListSend(argv) {

    sendFiles.sendFiles.forEach(function (e) {

      addMessage(null, null, e.filename + ' ' + e.fileId);

    });

  }

  function handleRemoveSend(argv) {

    var filename = argv['rmsend'];

    sendFiles.getFiles('filename', filename, function (err, files) {

      if (err) {
        addMessage(null, null, err);
        return null;
      }

      var roomIdFiles = files.filter(function (e) {
        if (currentRoom.id === e.roomId) return e;
      });
      if (!roomIdFiles.length) {
        addMessage(null, null, 'file does not exist in this room');
        return null;
      }

      var file = files[0];
      var id = file.id;
      var fileId = file.fileId;

      sendFiles.removeFiles('fileId', fileId, function (err) {

        if (err) {
          addMessage(null, null, err);
          return null;
        }

        addMessage(null, null, 'did remove file');
        $scope.sendFiles = $scope.sendFiles.filter(function (e) {
          if (e.fileId !== fileId) return e;
        });

        socket.emit('rmsend', id, fileId);

      });

    });

  }

  function handleAccept(argv) {

    var filename = argv['accept'];

    acceptFiles.getFiles('filename', filename, function (err, files) {

      if (err) {
        addMessage(null, null, err);
        return null;
      }

      var file = files[0];
      var id = file.id;
      var fileId = file.fileId;

      socket.emit('acceptRequest', id, fileId);

    });

  }

  function didConnect() {

    socket.on('something', function (json) {

      users.addUser(json);

      addMessage(null, json.name, 'has connected');

      socket.emit('userJson', json.id, tempJson);

      rooms.getRooms('didCreate', true, function (err, tempRooms) {
        if (err) return false;
        tempRooms.forEach(function (e) {
          socket.emit('createRoom', e.id, e.name);
        });
      });

      if (currentRoom !== null) {
        socket.emit('joinRoom', currentRoom.id);
      }

      sendFiles.sendFiles.forEach(function (e) {
        socket.emit('hasRequest', e.toId, e.fileId, e.filename, e.stats);
      });

      $scope.$emit('something');

    });

    socket.on('userJson', function (json) {

      users.addUser(json);

      $scope.$emit('userjson');

    })

    socket.on('jsonChanged', function (json) {
    });

    socket.on('didDisconnect', function (id) {

      users.getUsers('id', id, function (err, tempUsers) {

        var name = tempUsers[0].json.name;

        users.removeUser('id', id, function (err) {

          acceptFiles.removeFiles('id', id, function (err) {

            rooms.getRooms('fromId', id, function (err, tempRooms) {

              if (err) return null;

              tempRooms.forEach(function (e) {
                if (currentRoom !== null) {
                  if (currentRoom.id === e.id) {
                    currentRoom = null;
                    $scope.currentRoom = currentRoom;
                  }
                }
              });

            });

            rooms.removeRooms('fromId', id, function (err) {

              addMessage(null, name, 'has disconnected');

              $scope.rooms = rooms.rooms;
              $scope.roomsUsers = rooms.users;

              $scope.acceptFiles = acceptFiles.acceptFiles;

              $scope.$emit('didDisconnect');

            });

          });

        });

      });

    });

    socket.on('createRoom', function (roomId, fromId, roomName) {

      rooms.addRoom(roomId, fromId, roomName, function (err) {

        $scope.rooms = rooms.rooms;
        $scope.roomsUsers = rooms.users;

        $scope.$emit('createroom');

      });

    });

    socket.on('removeRoom', function (roomId) {

      if (currentRoom !== null) {
        if (currentRoom.id === roomId) {
          currentRoom = null;
          $scope.currentRoom = currentRoom;
        }
      }

      rooms.removeRooms('id', roomId, function (err) {

        $scope.rooms = rooms.rooms;
        $scope.roomsUsers = rooms.users;

        $scope.$emit('removeroom', rooms);

      });

    });

    socket.on('joinRoom', function (roomId, fromId) {

      rooms.joinRoom(roomId, fromId, function (err) {

        if (currentRoom !== null) {
          if (currentRoom.id === roomId) {
            users.getUsers('id', fromId, function (err, tempUsers) {
              var user = tempUsers[0];
              $scope.users.push(user);
            });
          }
        }

        $scope.roomsUsers = rooms.users;

        $scope.$emit('joinroom', rooms);

      });

    });

    socket.on('leaveRoom', function (roomId, fromId) {

      rooms.leaveRoom(roomId, fromId, function (err) {

        if (currentRoom !== null) {

          $scope.users = [];

          rooms.getUsersByRoomId(currentRoom.id, function (err, roomUsers) {
            roomUsers.forEach(function (e) {
              users.getUsers('id', e.userId, function (err, tempUsers) {
                var user = tempUsers[0];
                $scope.users.push(user);
              });
            });
          });

        }

        $scope.roomsUsers = rooms.users;

        $scope.$emit('leaveroom', rooms);

      });

    });

    socket.on('message', function (roomId, id, message) {

      users.getUsers('id', id, function (err, tempUsers) {
        var name = tempUsers[0].json.name;

        addMessage(roomId, name, message);

      });

      $scope.$emit('message');

    });

    socket.on('hasRequest', function (id, fileId, filename, stats) {

      acceptFiles.addFile(id, fileId, filename, stats, function (err) {

        if (err) {
          addMessage(null, null, err);
          return false;
        }

        $scope.acceptFiles = acceptFiles.acceptFiles;

        users.getUsers('id', id, function (err, users) {

          if (err) {
            addMessage(null, null, err);
            return false;
          }

          var from = users[0].json.name;

          addMessage(null, from, 'request to send file: ' + filename);

          $scope.$emit('hasRequest');

        });

      });

    });

    socket.on('acceptRequest', function (id, fileId) {

      var file = sendFiles.getFiles('fileId', fileId, function (err, files) {

        if (err) return null;

        var data = files[0].data;

        socket.emit('fileData', id, fileId, data);

        addMessage(null, null, 'did send file');

        $scope.$emit('acceptRequest');

      });

    });

    socket.on('fileData', function (fileId, data) {

      acceptFiles.getFiles('fileId', fileId, function (err, files) {

        var file = files[0];
        var filename = file.filename;

        addMessage(null, null, 'did get file: ' + filename);

        $scope.$emit('fileData');

      });

    });

    socket.on('rmsend', function (fileId) {

      acceptFiles.getFiles('fileId', fileId, function (err, files) {

        var file = files[0];
        var id = file.id;
        var name = null;
        var filename = file.filename;

        users.getUsers('id', id, function (err, users) {

          var user = users[0];
          name = user.json.name;

          acceptFiles.removeFiles('fileId', fileId, function (err) {

            $scope.acceptFiles = acceptFiles.acceptFiles;

            addMessage(null, name, 'rmsend: ' + filename);

            $scope.$emit('rmsend');

          });

        });

      });

    });

  }

}
