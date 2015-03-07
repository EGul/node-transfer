
var app = angular.module('app');

app.controller('clientCtrl', clientCtrl);
app.directive('usersDirective', usersDirective);
app.directive('rightSomethingDirective', rightSomethingDirective);
app.directive('fileUploadDirective', fileUploadDirective);

function usersDirective() {

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    template: [
    '<div class="user">',
      '<div>{{ item.json.id }}</div>',
      '<div>{{ item.json.name }}</div>',
    '</div>'
    ].join(''),
    link: function (scope, elem, attrs) {

    }
  }

}

function rightSomethingDirective() {

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    template: [
      '<div class="rightItem">',
      '{{ item.filename }}',
      '</div>'
    ].join(''),
    link: function (scope, elem, attrs) {

    }
  }

}

function fileUploadDirective() {

  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {

      var tempElem = elem[0];

      tempElem.ondragover = handleDrag;
      tempElem.ondragend = handleDragEnd;
      tempElem.ondrop = handleDrop;

      function handleDrag(e) {
        e.stopPropagation();
        e.preventDefault();
      }

      function handleDragEnd(e) {
        e.stopPropagation();
        e.preventDefault();
      }

      function handleDrop(e) {

        e.stopPropagation();
        e.preventDefault();

        var file = e.dataTransfer.files[0];
        var read = new FileReader();

        read.onload = function (something) {
          scope.tempAddFile(file.name, something.target.result);
        }

        read.readAsText(file);

      }

    }
  }

}

function clientCtrl($scope, usersFactory, sendFilesFactory, acceptFilesFactory) {

  var socket = null;
  var tempJson = null;
  var messages = [];
  var users = new usersFactory();
  var sendFiles = new sendFilesFactory();
  var acceptFiles = new acceptFilesFactory();

  messages.push('json: ');

  $scope.tempJson = tempJson;
  $scope.messages = messages;
  $scope.users = users.users;
  $scope.sendFiles = sendFiles.sendFiles;
  $scope.acceptFiles = acceptFiles.acceptFiles;

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

        messages.push('did get json');
        $scope.messages = messages;

      }
      else {

        messages.push('json is not correct');
        $scope.messages = messages;

      }

    }

    function addSendFile() {

      sendFiles.addFile(filename, data, function (err, json) {

        if (err) {
          messages.push(err);
          $scope.messages = messages;
          return null;
        }

        messages.push('did upload file');
        $scope.messages = messages;

        $scope.sendFiles = sendFiles.sendFiles;

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

      messages.push('did connect');
      $scope.messages = messages;

      didConnect();

      $scope.$emit('connect');

    });

  }

  function handleDisconnect(argv) {

    socket.on('disconnect', function () {

      messages.push('did disconnect');
      $scope.messages = messages;
      $scope.$emit('disconnect');

    });

    socket.disconnect();

  }

  function handleMessage(line) {

    if (socket === null || (socket !== null && !socket.connected)) {
      messages.push('not connected');
      $scope.messages = messages;
      return false;
    }

    var id = null;
    var message = line;

    if (id) {

    }

    messages.push(message);
    $scope.messages = messages;

    socket.emit('message', id, message);

  }

  function handleListSend(argv) {

    sendFiles.sendFiles.forEach(function (e) {
      messages.push(e.filename + ' ' + e.fileId);
      $scope.messages = messages;
    });

  }

  function handleRemoveSend(argv) {

    var filename = argv['rmsend'];

    sendFiles.getFiles('filename', filename, function (err, files) {

      if (err) {
        messages.push(err);
        $scope.messages = messages;
        return null;
      }

      var file = files[0];
      var id = file.id;
      var fileId = file.fileId;

      sendFiles.removeFiles('fileId', fileId, function (err) {

        if (err) {
          messages.push(err);
          $scope.messages = messages;
          return null;
        }

        messages.push('did remove file');
        $scope.messages = messages;

        $scope.sendFiles = sendFiles.sendFiles;

        socket.emit('rmsend', id, fileId);

      });

    });

  }

  function handleAccept(argv) {

    var filename = argv['accept'];

    acceptFiles.getFiles('filename', filename, function (err, files) {

      if (err) {
        messages.push(err);
        $scope.messages = messages;
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
      $scope.users = users.users;

      messages.push(json.name + ' has connected');
      $scope.message = messages;

      socket.emit('userJson', json.id, tempJson);
      sendFiles.sendFiles.forEach(function (e) {
        socket.emit('hasRequest', e.toId, e.fileId, e.filename, e.stats);
      });

      $scope.$emit('something');

    });

    socket.on('userJson', function (json) {

      users.addUser(json);
      $scope.users = users.users;

      $scope.$emit('userjson');

    })

    socket.on('jsonChanged', function (json) {
    });

    socket.on('didDisconnect', function (id) {

      users.getUsers('id', id, function (err, tempUsers) {

        if (err) return console.log(err);

        messages.push(tempUsers[0].json.name + ' has disconnected');
        $scope.messages = messages;

        users.removeUser('id', id, function (err) { });
        $scope.users = users.users;

      });

    });

    socket.on('message', function (id, message) {

      messages.push(message);

      $scope.messages = messages;

      $scope.$emit('message');

    });

    socket.on('hasRequest', function (id, fileId, filename, stats) {

      var acceptFile = {
        id: id,
        fileId: fileId,
        filename: filename,
        stats: stats
      };

      acceptFiles.addFile(acceptFile, function (err) {

        if (err) {
          messages.push(err);
          $scope.messages = messages;
          return false;
        }

        $scope.acceptFiles = acceptFiles.acceptFiles;

        users.getUsers('id', id, function (err, users) {

          if (err) {
            messages.push(err);
            $scope.messages = messages;
            return false;
          }

          var from = users[0].json.name;

          messages.push(from + ': request to send file: ' + filename);
          $scope.messages = messages;

          $scope.$emit('hasRequest');

        });

      });

    });

    socket.on('acceptRequest', function (id, fileId) {

      var file = sendFiles.getFiles('fileId', fileId, function (err, files) {

        if (err) return null;

        var data = files[0].data;

        socket.emit('fileData', id, fileId, data);

        messages.push('did send file');
        $scope.messages = messages;

        $scope.$emit('acceptRequest');

      });

    });

    socket.on('fileData', function (fileId, data) {

      acceptFiles.getFiles('fileId', fileId, function (err, files) {

        var file = files[0];
        var filename = file.filename;

        messages.push('did get file: ' + filename);
        $scope.messages = messages;

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

            messages.push(name + ': rmsend: ' + filename);

            $scope.$emit('rmsend');

          });

        });

      });

    });

  }

}
