
describe('client', function () {

  var $scope = null;
  var controller = null;

  var $secondScope = null;
  var secondController = null;

  beforeEach(function () {

    module('app');

    inject(function ($rootScope, $controller) {

      $scope = $rootScope.$new();
      controller = $controller('clientCtrl', {
        $scope: $scope
      });

      $secondScope = $rootScope.$new();
      secondController = $controller('clientCtrl', {
        $scope: $secondScope
      });

    });

  });

  describe('waiting for json', function () {

    it('should not add message', function () {

      $scope.text = 'something';
      $scope.submit();

      expect($scope.messages.length).to.eql(1);

    });

  });

  describe('waiting for connect', function () {

    beforeEach(function () { somethingSetTempJson($scope, $secondScope) });

    it('should get error message not connected', function () {

      $scope.text = 'something';
      $scope.submit();

      expect($scope.messages.length).to.eql(3);

    });

  });

  describe('waiting for room', function () {

    beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
    beforeEach(function (done) { somethingConnect($scope, $secondScope, done) });
    afterEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

    it('should get error message no room set on send message', function () {

      $scope.text = 'something';
      $scope.submit();

      expect($scope.messages[$scope.messages.length - 1].message).to.eql('no room set');

    });

    it('should get error message no room set on send request', function () {

      $scope.tempAddFile('something.json', 'some data');

      expect($scope.messages[$scope.messages.length - 1].message).to.eql('no room set');

    });

  });

  describe('tempjson', function () {

    it('should have message json:', function () {

      expect($scope.messages.length).to.eql(1);

    });

    it('should get error message json not correct', function () {

      $scope.tempAddFile('temp.json', '{"username": "first", "id": "1"}');

      expect($scope.tempJson).to.eql(null);
      expect($scope.messages.length).to.eql(2);
      expect($scope.messages[$scope.messages.length - 1].message).to.eql('json is not correct');

    });

    it('should set tempjson', function () {

      $scope.tempAddFile('temp.json', '{"name": "first", "id": "1"}');

      expect($scope.tempJson).not.to.eql(null);
      expect($scope.messages.length).to.eql(2);
      expect($scope.messages[$scope.messages.length - 1].message).to.eql('did get json');

    });

  });

  describe('connect', function () {

    it('should not connect', function (done) {

      $scope.$on('noJsonError', function () {
        expect($scope.messages.length).to.eql(1);
        done();
      });

      $scope.text = '--connect';
      $scope.submit();

    });

    it('should connect', function (done) {

      somethingSetTempJson($scope, $secondScope);
      somethingConnect($scope, $secondScope, function () {

        expect($scope.messages.length).to.eql(4);

        somethingDisconnect($scope, $secondScope, function () {
          done();
        });

      });

    });

  });

  describe('disconnect', function () {

    beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
    beforeEach(function (done) { somethingConnect($scope, $secondScope, done) });
    beforeEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

    it('should disconnect', function () {

      expect($scope.messages.length).to.eql(5);
      expect($scope.users.length).to.eql(0);

    });

  });

  describe('disconnect reconnect', function () {

    beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
    beforeEach(function (done) { somethingConnect($scope, $secondScope, done) });
    afterEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

    it('should disconnect reconnect', function (done) {

      $secondScope.$on('didDisconnect', function () {

        $secondScope.$on('something', function () { done() });

        $scope.text = '--connect';
        $scope.submit();

      });

      $scope.text = '--disconnect';
      $scope.submit();

    });

  });

  describe('connected users', function () {

    beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
    beforeEach(function (done) { somethingConnect($scope, $secondScope, done) });
    afterEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

    it('should have connected users', function () {

      expect($scope.users.length).to.eql(1);
      expect($secondScope.users.length).to.eql(1);

      expect($scope.users[0].json.name).to.eql('second');
      expect($secondScope.users[0].json.name).to.eql('first');

    });

  });

  describe('rooms', function () {

    describe('createRoom', function () {

      beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
      beforeEach(function (done) { somethingConnect($scope, $secondScope, done) });
      afterEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

      it('should create room', function (done) {

        $secondScope.$on('createroom', function () {

          expect($secondScope.currentRoom).to.eql(null);
          expect($secondScope.rooms.length).to.eql(1);

          done();

        });

        $scope.text = '--createroom something';
        $scope.submit();

        expect($scope.currentRoom).to.eql(null);
        expect($scope.rooms.length).to.eql(1);
        expect($scope.rooms[0].name).to.eql('something');

      });

    });

    describe('removeRoom', function () {

      beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
      beforeEach(function (done) { somethingConnect($scope, $secondScope, done) });
      afterEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

      it('should get error room does not exist', function () {

        $scope.text = '--createroom something';
        $scope.submit();

        $scope.text = '--rmroom temp';
        $scope.submit();

        expect($scope.rooms.length).to.eql(1);
        expect($scope.messages[$scope.messages.length - 1].message).to.eql('room does not exist');

      });

      it('should remove room', function (done) {

        $secondScope.$on('createroom', function () {

          $secondScope.$on('removeroom', function () {

            expect($secondScope.rooms.length).to.eql(0);

            done();

          });

          $scope.text = '--rmroom something';
          $scope.submit();

        });

        $scope.text = '--createroom something';
        $scope.submit();

      });

      it('should set current room to null', function (done) {

        var count = 0;
        function joinRoom() {
          count++;
          if (count === 2) usersDidJoinRoom();
        }

        function usersDidJoinRoom() {

          $secondScope.$on('removeroom', function () {

            expect($scope.currentRoom).to.eql(null);
            expect($secondScope.currentRoom).to.eql(null);

            done();

          });

          $scope.text = '--rmroom something';
          $scope.submit();

        }

        $secondScope.$on('createroom', function () {

          $scope.$on('joinroom', function () {
            joinRoom();
          });

          $secondScope.$on('joinroom', function () {
            joinRoom();
          });

          $scope.text = '--setroom something';
          $secondScope.text = '--setroom something';
          $scope.submit();
          $secondScope.submit();

        });

        $scope.text = '--createroom something';
        $scope.submit();

      });

      it('should not set current room to null', function (done) {

        var createRoomCount = 0;
        function createRoom() {
          createRoomCount++;
          if (createRoomCount === 2) didCreateRooms();
        }

        var joinRoomCount = 0;
        function joinRoom() {
          joinRoomCount++;
          if (joinRoomCount === 2) didJoinRooms();
        }

        function didCreateRooms() {

          $scope.$on('joinroom', function () { joinRoom() });
          $secondScope.$on('joinroom', function () { joinRoom() });

          $scope.text = '--setroom something';
          $secondScope.text = '--setroom something';
          $scope.submit();
          $secondScope.submit();

        }

        function didJoinRooms() {

          $secondScope.$on('removeroom', function () {

            expect($scope.currentRoom).to.not.eql(null);
            expect($secondScope.currentRoom).to.not.eql(null);

            done();

          });

          $scope.text = '--rmroom temp';
          $scope.submit();

        }

        $secondScope.$on('createroom', function () {
          createRoom();
        });

        $scope.text = '--createroom something';
        $scope.submit()
        $scope.text = '--createroom temp';
        $scope.submit()

      });

    });

    describe('setRoom', function () {

      beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
      beforeEach(function (done) { somethingConnect($scope, $secondScope, done) });
      afterEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

      it('should get error room does not exist', function (done) {

        $scope.$on('didcreateroom', function () {

          $scope.$on('setroom', function () {

            expect($scope.currentRoom).to.eql(null);
            expect($scope.messages[$scope.messages.length - 1].message).to.eql('room does not exist');

            done();

          });

          $scope.text = '--setroom temp';
          $scope.submit();

        });

        $scope.text = '--createroom something';
        $scope.submit();

      });

      it('should join room', function (done) {

        var count = 0;
        function did() {
          count++;
          if (count === 2) done();
        }

        $scope.$on('didcreateroom', function () {

          $secondScope.$on('joinroom', function (event) {
            expect($secondScope.roomsUsers.length).to.eql(1);
            did();

          });

          $scope.$on('setroom', function () {
            expect($scope.currentRoomId).to.not.eql(null);
            did();
          });

          $scope.text = '--setroom something';
          $scope.submit();

        });

        $scope.text = '--createroom something';
        $scope.submit();

      });

    });

    describe('leave room', function () {

      beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
      beforeEach(function (done) { somethingConnect($scope, $secondScope, done) });
      afterEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

      it('should leave room', function (done) {

        var joinRoomCount = 0;
        var previousRoom = null;

        function didCreateRooms() {

          $secondScope.$on('leaveroom', function (event) {

            expect($secondScope.roomsUsers.length).to.eql(1);
            expect($secondScope.rooms.length).to.eql(2);

            done();

          });

          $secondScope.$on('joinroom', function (event, rooms) {

            joinRoomCount++;

            if (joinRoomCount === 1) {

              previousRoom = $scope.currentRoom;

              $scope.text = '--setroom temp';
              $scope.submit();

            }

            if (joinRoomCount === 2) {

              expect($scope.currentRoom.id).to.not.eql(previousRoom.id);

            }

          });

          $scope.text = '--setroom something';
          $scope.submit();

        }

        $secondScope.$on('createroom', function () {
          if ($secondScope.rooms.length === 2) didCreateRooms();
        });

        $scope.text = '--createroom something';
        $scope.submit();
        $scope.text = '--createroom temp';
        $scope.submit();

      });

      it('should remove users on remove room', function (done) {

        $secondScope.$on('createroom', function () {

          $secondScope.$on('joinroom', function () {

            $secondScope.$on('removeroom', function (event, rooms) {

              expect($secondScope.roomsUsers.length).to.eql(0);

              done();

            });

            $scope.text = '--rmroom something';
            $scope.submit();

          });

          $scope.text = '--setroom something';
          $scope.submit();

        });

        $scope.text = '--createroom something';
        $scope.submit();

      });

    });

    describe('connect', function () {

      beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
      beforeEach(function (done) {

        $scope.$on('connect', function () { done() });

        $scope.text = '--connect';
        $scope.submit();

      });

      afterEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

      it('should send room on user connect', function (done) {

        var count = 0;
        function did() {
          count ++;
          if (count === 2) done();
        }

        $scope.$on('didcreateroom', function () {

          $scope.$on('setroom', function () {

            $secondScope.$on('createroom', function () {
              did();
            });

            $secondScope.$on('joinroom', function () {
              did();
            });

            $secondScope.text = '--connect';
            $secondScope.submit();

          });

          $scope.text = '--setroom something';
          $scope.submit();

        });

        $scope.text = '--createroom something';
        $scope.submit();

      });

    });

    describe('disconnect', function () {

      beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
      beforeEach(function (done) { somethingConnect($scope, $secondScope, done) });
      afterEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

      it('should remove all rooms', function (done) {

        $scope.$on('didcreateroom', function () {

          $scope.$on('setroom', function () {

            $secondScope.$on('didDisconnect', function () {

              expect($secondScope.rooms.length).to.eql(0);
              expect($scope.rooms.length).to.eql(0);

              done();

            });

            $scope.text = '--disconnect';
            $scope.submit();

          });

          $scope.text = '--setroom something';
          $scope.submit();

        });

        $scope.text = '--createroom something';
        $scope.submit();

      });

      it('should remove users from rooms', function (done) {

        $secondScope.$on('createroom', function () {

          var joinCount = 0;
          function didJoin() {
            joinCount++;
            if (joinCount === 2) usersDidJoin();
          }

          function usersDidJoin() {

            $secondScope.$on('didDisconnect', function () {

              expect($scope.roomsUsers.length).to.eql(0);
              expect($secondScope.roomsUsers.length).to.eql(0);

              done();

            });


            $scope.text = '--disconnect';
            $scope.submit();

          }

          $scope.$on('joinroom', function () { didJoin() });
          $secondScope.$on('joinroom', function () { didJoin() });

          $scope.text = '--setroom something';
          $scope.submit();
          $secondScope.text = '--setroom something';
          $secondScope.submit();

        });

        $scope.text = '--createroom something';
        $scope.submit();

      });

      it('should set current room to null', function (done) {

        var count = 0;
        function joinRoom() {
          count++;
          if (count === 2) usersDidJoinRoom();
        }

        function usersDidJoinRoom() {

          $secondScope.$on('didDisconnect', function () {

            expect($scope.currentRoom).to.eql(null);
            expect($secondScope.currentRoom).to.eql(null);

            done();

          });

          $scope.text = '--disconnect';
          $scope.submit();

        }

        $secondScope.$on('createroom', function () {

          $scope.$on('joinroom', function () {
            joinRoom();
          });

          $secondScope.$on('joinroom', function () {
            joinRoom();
          });

          $scope.text = '--setroom something';
          $secondScope.text = '--setroom something';
          $scope.submit();
          $secondScope.submit();

        });

        $scope.text = '--createroom something';
        $scope.submit();

      });

      it('should not set current room to null', function () {

        $secondScope.$on('createroom', function () {

          $scope.text = '--setroom something';
          $scope.submit();
          $secondScope.text = '--setroom something';
          $secondScope.submit();

        });

        $scope.text = '--createroom something';
        $scope.submit();

      });

    });

  });

  describe('message', function () {

    beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
    beforeEach(function (done) { somethingConnect($scope, $secondScope, done) });
    beforeEach(function (done) { setRoom($scope, $secondScope, done)});
    afterEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

    it('should send message', function (done) {

      $scope.text = 'something';
      $scope.submit();

      expect($scope.messages.length).to.eql(5);

      $secondScope.$on('message', function () {

        expect($secondScope.messages.length).to.eql(4);

        done();

      });

    });

  });

  describe('filetransfer', function () {

    beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
    beforeEach(function (done) { somethingConnect($scope, $secondScope, done) });
    beforeEach(function (done) { setRoom($scope, $secondScope, done) });
    afterEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

    it('should send request', function (done) {

      $scope.tempAddFile('something.json', 'some data');

      expect($scope.messages[$scope.messages.length - 1].message).to.eql('did upload file');
      expect($scope.sendFiles.length).to.eql(1);

      $secondScope.$on('hasRequest', function () {

        expect($secondScope.messages[$secondScope.messages.length - 1].message).to.eql('request to send file: something.json');
        expect($secondScope.acceptFiles.length).to.eql(1);

        done();

      });

    });

    it('should add send file connect then send request', function (done) {

      $secondScope.$on('didDisconnect', function () {

        $scope.$on('didcreateroom', function () {

          $scope.$on('setroom', function () {

            $secondScope.$on('hasRequest', function () {

              expect($secondScope.acceptFiles.length).to.eql(1);

              done();

            });

            $scope.tempAddFile('something.json', 'some data');
            $scope.text = '--connect';
            $scope.submit();

          });

          $scope.text = '--setroom something';
          $scope.submit();

        });

        $scope.text = '--createroom something';
        $scope.submit();

      });

      $scope.text = '--disconnect';
      $scope.submit();

    });

    it('should accept request', function (done) {

      $scope.tempAddFile('something.json', 'some data');

      $secondScope.$on('hasRequest', function () {

        $secondScope.text = '--accept something.json';
        $secondScope.submit();

      });

      $scope.$on('acceptRequest', function () {

        expect($scope.messages[$scope.messages.length - 1].message).to.eql('did send file');

      });

      $secondScope.$on('fileData', function () {

        expect($secondScope.messages[$secondScope.messages.length - 1].message).to.eql('did get file: something.json');

        done();

      });

    });

    it('should remove request', function (done) {

      $scope.tempAddFile('something.json', 'some data');

      $secondScope.$on('hasRequest', function () {

        $scope.text = '--rmsend something.json';
        $scope.submit();

        expect($scope.messages[$scope.messages.length - 1].message).to.eql('did remove file');
        expect($scope.sendFiles.length).to.eql(0);

      });

      $secondScope.$on('rmsend', function () {

        expect($secondScope.messages[$secondScope.messages.length - 1].message).to.eql('rmsend: something.json');
        expect($secondScope.acceptFiles.length).to.eql(0);

        done();

      });

    });

    it('should remove request on disconnect', function (done) {

      $scope.tempAddFile('something.json', 'some data');

      $secondScope.$on('hasRequest', function () {

        $secondScope.$on('didDisconnect', function () {

          expect($scope.sendFiles.length).to.eql(0);
          expect($secondScope.acceptFiles.length).to.eql(0);

          done();

        });

        $scope.text = '--disconnect';
        $scope.submit();

      });

    });

  });

});

function somethingSetTempJson($scope, $secondScope) {

  $scope.tempAddFile('temp.json', '{"name": "first", "id": "1"}');
  $secondScope.tempAddFile('temp.json', '{"name": "second", "id": "2"}');

}

function somethingConnect($scope, $secondScope, fn) {

    var removeOnConnect= null;
    var removeOnUserJson = null;

    removeOnUserJson = $secondScope.$on('userjson', function () {
      removeOnUserJson();
      fn();
    });

    removeOnConnect = $scope.$on('connect', function () {
      removeOnConnect();
      $secondScope.text = '--connect';
      $secondScope.submit();
    });

    $scope.text = '--connect';
    $scope.submit();

}

function setRoom($scope, $secondScope, fn) {

  var removeOnCreateRoom = null;
  var removeOnJoinRoom = null;
  var removeOnSetRoom = null;

  removeOnSetRoom = $secondScope.$on('setroom', function () {
    removeOnSetRoom();
    fn();
  });

  removeOnJoinRoom = $secondScope.$on('joinroom', function () {
    removeOnJoinRoom();
    $secondScope.text = '--setroom something';
    $secondScope.submit();
  });

  removeOnCreateRoom = $secondScope.$on('createroom', function () {
    removeOnCreateRoom();
    $scope.text = '--setroom something';
    $scope.submit();
  });

  $scope.text = '--createroom something';
  $scope.submit();

}

function somethingDisconnect($scope, $secondScope, fn) {

  var count = 0;
  function did() {
    count++;
    if (count == 2) fn();
  }

  var removeOnDisconnect = null;
  var secondRemoveOnDisconnect = null;

  removeOnDisconnect = $scope.$on('disconnect', function () {
    removeOnDisconnect();
    did()
  });

  secondRemoveOnDisconnect = $secondScope.$on('disconnect', function () {
    secondRemoveOnDisconnect();
    did()
  });

  if ($scope.socket.connected) {
    $scope.text = '--disconnect';
    $scope.submit();
  }
  else {
    did();
  }

  if ($secondScope.socket.connected) {
    $secondScope.text = '--disconnect';
    $secondScope.submit();
  }
  else {
    did();
  }

}
