
var app = angular.module('app');

app.controller('clientCtrl', clientCtrl);

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
  $scope.acceptFiles = [];

  addMessage(null, null, 'json: ');

  var url = window.location.href;
  var splitUrl = url.split('/');

  var last = splitUrl[splitUrl.length - 1];

  if (last == 'quick' || last.split('?')[0] == 'quick') {
    handleQuickLogin();
  }

  function handleQuickLogin() {

    var didCreateRoom = false;

    var args = last.split('?');
    args = args.slice(1, args.length).join('').split('&');
    args = args.map(function (e) {
      var eSplit = e.split('=');
      var temp = {};
      temp[eSplit[0]] = eSplit[1];
      return temp;
    });

    next(0);

    function next(index) {

      if (index == args.length) {
        return;
      }

      var current = args[index];

      if (current.setuser) {
        $scope.$on('didSetUser', function () {
          next(index + 1);
        });
        handleUser({setuser: current.setuser});
      }

      if (current.connect) {
        $scope.$on('connect', function () {
          next(index + 1);
        });
        handleConnect();
      }

      if (current.createroom) {
        $scope.$on('didcreateroom', function () {
          didCreateRoom = true;
          next(index + 1);
        });
        handleCreateRoom({createroom: current.createroom});
      }

      if (current.setroom) {
        if (didCreateRoom) {
          handleSetRoom({setroom: current.setroom});
          next(index + 1);
        }
        else {
          $scope.$on('createroom', function () {
            handleSetRoom({setroom: current.setroom});
            next(index + 1);
          });
        }
      }

    }

  }

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

        socket.emit('hasRequest', currentRoom.id, null, json.fileId, json.filename, null);

      });

    }

    if (tempJson === null) {
      setJson();
    }
    else {
      addSendFile();
    }

    $scope.$apply();

  }

  $scope.submit = function () {

    var text = $scope.text;
    $scope.text = '';

    var line = text;
    var argv = minimist(line.split(' '));

    function has(property) {
      if (argv.hasOwnProperty(property)) return true;
      return false;
    }

    if (has('setuser')) {
      handleUser(argv);
      return null;
    }

    if (tempJson === null) {
      $scope.$emit('noJsonError');
      return null;
    }

    if (socket === null || (socket !== null && !socket.connected)) {
      if (!has('connect') && !has('disconnect')) {
        addMessage(null, null, 'not connected');
        return false;
      }
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

    if (argv.hasOwnProperty('listuser')) {
      handleListUser(argv);
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

  $scope.select = function (argv) {

    if (argv.hasOwnProperty('connect')) {
      connectSelected();
    }

    if (argv.hasOwnProperty('setroom')) {
      handleSetRoom(argv);
    }

    if (argv.hasOwnProperty('listuser')) {
      handleListUser(argv);
    }

  }

  function connectSelected() {
    if (socket === null || socket.connected === false) {
      handleConnect();
    }
    else {
      handleDisconnect();
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

  function handleUser(argv) {

    var name = argv['setuser'];

    if (typeof name !== 'string') {
      addMessage(null, null, 'no username provided');
      $scope.$emit('noUsernameProvided');
      return null;
    }

    tempJson = {'name': name};
    $scope.tempJson = tempJson;

    addMessage(null, null, 'did set user');
    $scope.$emit('didSetUser');

  }

  function handleConnect(argv) {

    if (tempJson === null) return $scope.$emit('connectError');
    if (socket !== null && socket.connected) {
      addMessage(null, null, 'already connected');
      $scope.$emit('connectError');
      return false;
    }

    var options = {
      'force new connection': true
    };

    socket = io(window.location.protocol + '//' + window.location.host, options);

    socket.on('connect', function () {

      $scope.socket = socket;

      tempJson.id = socket.id;
      $scope.tempJson = tempJson;

      socket.emit('something', tempJson);

      sendFiles.sendFiles.forEach(function (e) {
        socket.emit('hasRequest', e.roomId, null, e.fileId, e.filename, e.stats);
      });

      addMessage(null, null, 'did connect');

      didConnect();

      $scope.$emit('connect');

      $scope.$apply();

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
      $scope.acceptFiles = [];

      $scope.$emit('disconnect');

      $scope.$apply();

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

      $scope.acceptFiles = [];
      acceptFiles.getFiles('roomId', room.id, function (err, files) {
        $scope.acceptFiles = files;
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

    rooms.hasRoom(name, function (hasRoom) {

      if (hasRoom) {
        addMessage(null, null, 'room already exists');
        $scope.$emit('roomAlreadyExists');
        return null;
      }

      rooms.createRoom(name, function (err) {

        if (err) {
          addMessage(null, null, err);
          return false;
        }

        $scope.rooms = rooms.rooms;
        $scope.roomsUsers = rooms.users;

        var room = rooms.rooms[rooms.rooms.length - 1];
        var roomId = room.id;

        socket.emit('createRoom', roomId, null, name);

        $scope.$emit('didcreateroom');

      });

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

  function handleListUser(argv) {

    var username = argv['listuser'];

    rooms.getUsersByRoomId(currentRoom.id, function (err, roomUsers) {

      if (err) {
        addMessage(null, null, err);
        $scope.$emit('listuser');
        return false;
      }

      actualUsers = users.users.filter(function (e) {
        for (var i = 0, l = roomUsers.length; i < l; i++) {
          if (roomUsers[i].userId === e.json.id) return e;
        }
      });

      var actualUsers = actualUsers.filter(function (e) {
        if (e.json.name === username) return e;
      });

      if (actualUsers.length === 0) {
        addMessage(null, null, 'user does not exist');
        $scope.$emit('listuser');
        return false;
      }

      var user = actualUsers[0];

      var newWindow = window.open();
      newWindow.document.write('<pre>' + JSON.stringify(user.json, null, 2) + '</pre>');

      addMessage(null, null, 'found user');
      $scope.$emit('listuser');

    });

  }

  function handleMessage(line) {

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

    var elems = document.getElementsByClassName('filename');
    var elem = null;
    var accept = argv.accept;

    for (var i = 0; i < elems.length; i++) {
      elem = elems[i];
      if (accept == elem.innerHTML) {
        elem.click();
        break;
      }
    }

  }

  function didConnect() {

    socket.on('something', function (json) {

      users.addUser(json);

      addMessage(null, json.name, 'has connected');

      socket.emit('userJson', json.id, tempJson);

      rooms.getRooms('didCreate', true, function (err, tempRooms) {
        if (err) return false;
        tempRooms.forEach(function (e) {
          socket.emit('createRoom', e.id, json.id, e.name);
        });
      });

      if (currentRoom !== null) {
        socket.emit('joinRoom', currentRoom.id);
      }

      sendFiles.sendFiles.forEach(function (e) {
        socket.emit('hasRequest', e.roomId, e.toId, e.fileId, e.filename, e.stats);
      });

      $scope.$emit('something');

      $scope.$apply();

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

            if (currentRoom != null) {

              $scope.users = [];

              rooms.leaveRoom(currentRoom.id, id, function () {

                rooms.getUsersByRoomId(currentRoom.id, function (err, roomUsers) {

                  roomUsers.forEach(function (e) {

                    users.getUsers('id', e.userId, function (err, tempUsers) {
                      var user = tempUsers[0];
                      $scope.users.push(user);
                    });

                  });

                });

              });

            }

            rooms.removeRooms('fromId', id, function (err) {

              addMessage(null, name, 'has disconnected');

              $scope.rooms = rooms.rooms;
              $scope.roomsUsers = rooms.users;

              $scope.acceptFiles = $scope.acceptFiles.filter(function (e) {
                if (e.id !== id) return e;
              });

              $scope.$emit('didDisconnect');

              $scope.$apply();

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

        $scope.$apply();

      });

    });

    socket.on('removeRoom', function (roomId) {

      if (currentRoom !== null) {
        if (currentRoom.id === roomId) {
          currentRoom = null;
          $scope.currentRoom = currentRoom;
	  $scope.sendFiles = [];
          $scope.acceptFiles = [];
        }
      }

      rooms.removeRooms('id', roomId, function (err) {

	sendFiles.removeFiles('roomId', roomId, function (err) {

	  acceptFiles.removeFiles('roomId', roomId, function (err) {

	    $scope.rooms = rooms.rooms;
	    $scope.roomsUsers = rooms.users;

	    $scope.$emit('removeroom', rooms);

      $scope.$apply();

	  });

	});

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

        $scope.$apply();

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

        $scope.$apply();

      });

    });

    socket.on('message', function (roomId, id, message) {

      users.getUsers('id', id, function (err, tempUsers) {
        var name = tempUsers[0].json.name;

        addMessage(roomId, name, message);

        $scope.$apply();

      });

      $scope.$emit('message');

    });

    socket.on('hasRequest', function (roomId, id, fileId, filename, stats) {

      acceptFiles.addFile(roomId, id, fileId, filename, stats, function (err) {

        if (err) {
          addMessage(null, null, err);
          return false;
        }

        if (currentRoom !== null) {
          acceptFiles.getFiles('roomId', currentRoom.id, function (err, files) {
            $scope.acceptFiles = files;
          });
        }

        users.getUsers('id', id, function (err, users) {

          if (err) {
            addMessage(null, null, err);
            return false;
          }

          var from = users[0].json.name;

          addMessage(null, from, 'request to send file: ' + filename);

          $scope.$emit('hasRequest');

          $scope.$apply();

        });

      });

    });

    socket.on('acceptRequest', function (id, fileId) {

      var file = sendFiles.getFiles('fileId', fileId, function (err, files) {

        if (err) return null;

        var data = files[0].data;

        socket.emit('fileData', files[0].filename, data);

        addMessage(null, null, 'did send file');

        $scope.$emit('acceptRequest');

        $scope.$apply();

      });

    });

    socket.on('fileData', function (fileId, data) {

      acceptFiles.getFiles('fileId', fileId, function (err, files) {

        var file = files[0];
        var filename = file.filename;

        addMessage(null, null, 'did get file: ' + filename);

        $scope.$emit('fileData');

        $scope.$apply();

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

            $scope.acceptFiles = $scope.acceptFiles.filter(function (e) {
              if (e.fileId !== fileId) return e;
            });

            addMessage(null, name, 'rmsend: ' + filename);

            $scope.$emit('rmsend');

            $scope.$apply();

          });

        });

      });

    });

  }

}
