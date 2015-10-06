
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

  describe('user', function () {

    it('should set user', function (done) {

      $scope.$on('didSetUser', function () {
        expect($scope.messages.length).to.eql(2);
        expect($scope.messages[1].message).to.eql('did set user');
        expect($scope.tempJson.name).to.eql('something');
        done();
      });

      $scope.text = '--setuser something';
      $scope.submit();

    });

    it('should not set user', function (done) {

      $scope.$on('noUsernameProvided', function () {
        expect($scope.messages.length).to.eql(2);
        expect($scope.messages[1].message).to.eql('no username provided');
        expect($scope.tempJson).to.eql(null);
        done();
      });

      $scope.text = '--setuser';
      $scope.submit();

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

    it('should get error already connected', function (done) {

      somethingSetTempJson($scope, $secondScope);

      $scope.$on('connectError', function () {
	expect($scope.messages[$scope.messages.length - 1].message).to.eql('already connected');
	done();
      });

      $scope.$on('connect', function () {
	$scope.text = '--connect';
	$scope.submit();
      });

      $scope.text = '--connect';
      $scope.submit();

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
    beforeEach(function (done) { setRoom($scope, $secondScope, done) });
    afterEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

    it('should have connected users', function () {

      expect($scope.users.length).to.eql(1);
      expect($secondScope.users.length).to.eql(1);

      expect($scope.users[0].json.name).to.eql('second');
      expect($secondScope.users[0].json.name).to.eql('first');

    });

  });

  describe('list users', function () {

    beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
    beforeEach(function (done) { somethingConnect($scope, $secondScope, done) });
    beforeEach(function (done) { setRoom($scope, $secondScope, done) });
    afterEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

    it ('should list user', function (done) {

      $scope.$on('listuser', function () {
        expect($scope.messages[$scope.messages.length -1 ].message).to.eql('found user');
        done();
      });

      $scope.text = '--listuser second';
      $scope.submit();

    });

    it('should get error user does not exist', function (done) {

      $scope.$on('listuser', function () {
        expect($scope.messages[$scope.messages.length - 1].message).to.eql('user does not exist');
        done();
      });

      $scope.text = '--listuser doesnotexist';
      $scope.submit();

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

      it('should not create room', function (done) {

        $scope.$on('roomAlreadyExists', function () {
          expect($scope.rooms.length).to.eql(1);
          done();
        });

        $scope.text = '--createroom something';
        $scope.submit();
        $scope.text = '--createroom something';
        $scope.submit();

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

      it('should get error room already set', function (done) {

        $scope.$on('setroom', function () {

          $scope.text = '--setroom something';
          $scope.submit();

          expect($scope.messages[$scope.messages.length - 1].message).to.eql('room already set');

          done();

        });

        $scope.text = '--createroom something';
        $scope.submit();
        $scope.text = '--setroom something';
        $scope.submit();

      });

      it('should join room', function (done) {

        $secondScope.$on('joinroom', function () {

          expect($scope.currentRoom).to.not.eql(null);
          expect($scope.rooms.length).to.eql(1);
          expect($scope.roomsUsers.length).to.eql(0);
          expect($scope.users.length).to.eql(0);
          expect($secondScope.currentRoom).to.eql(null);
          expect($secondScope.rooms.length).to.eql(1);
          expect($secondScope.roomsUsers.length).to.eql(1);
          expect($secondScope.users.length).to.eql(0);

          done();

        });

        $scope.text = '--createroom something';
        $scope.submit();
        $scope.text = '--setroom something';
        $scope.submit();

      });

      it('should join room then join different room', function (done) {

        var joinRoomCount = 0;
        var previousCurrentRoom = null;

        $secondScope.$on('leaveroom', function () {

          expect($scope.currentRoom).to.not.eql(previousCurrentRoom);
          expect($scope.rooms.length).to.eql(2);
          expect($scope.roomsUsers.length).to.eql(0);
          expect($scope.users.length).to.eql(0);

          expect($secondScope.rooms.length).to.eql(2);
          expect($secondScope.roomsUsers.length).to.eql(1);
          expect($secondScope.users.length).to.eql(0);

          done();

        });

        $secondScope.$on('joinroom', function () {
          joinRoomCount++;
          if (joinRoomCount === 1) {
            previousCurrentRoom = $scope.currentRoom;
            $scope.text = '--setroom temp';
            $scope.submit();
          }
        });

        $scope.text = '--createroom something';
        $scope.submit();
        $scope.text = '--createroom temp';
        $scope.submit();
        $scope.text = '--setroom something';
        $scope.submit();

      });

      it('should set users to room', function (done) {

        var count = 0;
        function did() {
          count++;
          if (count === 2) done();
        }

        $scope.$on('joinroom', function () {
          expect($scope.currentRoom).to.not.eql(null);
          expect($scope.users.length).to.eql(1);
          expect($scope.roomsUsers.length).to.eql(1);
          did();
        });

        $secondScope.$on('joinroom', function () {
          expect($secondScope.currentRoom).to.not.eql(null);
          expect($secondScope.users.length).to.eql(1);
          expect($secondScope.roomsUsers.length).to.eql(1);
          did();
        });

        $secondScope.$on('createroom', function () {
          $scope.text = '--setroom something';
          $secondScope.text = '--setroom something';
          $scope.submit();
          $secondScope.submit();
        });

        $scope.text = '--createroom something';
        $scope.submit();

      });

      it('should set users to room then set user to different room', function (done) {

        $secondScope.$on('leaveroom', function () {

          expect($scope.rooms.length).to.eql(2);
          expect($scope.roomsUsers.length).to.eql(1);
          expect($scope.users.length).to.eql(0);

          expect($secondScope.rooms.length).to.eql(2);
          expect($secondScope.roomsUsers.length).to.eql(1);
          expect($secondScope.users.length).to.eql(0);

          done();

        });

        $scope.$on('joinroom', function () {
          $scope.text = '--setroom temp';
          $scope.submit();
        });

        var removeJoinRoom = $secondScope.$on('joinroom', function () {
          removeJoinRoom();
          $secondScope.text = '--setroom something';
          $secondScope.submit();
        });

        $scope.text = '--createroom something';
        $scope.submit();
        $scope.text = '--createroom temp';
        $scope.submit();
        $scope.text = '--setroom something';
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

      expect($scope.messages.length).to.eql(1);

      $secondScope.$on('message', function () {

        expect($secondScope.messages.length).to.eql(1);

        done();

      });

    });

    it('should get message from other room', function (done) {

      $secondScope.$on('message', function () {
        expect($scope.messages.length).to.eql(1);
        expect($secondScope.messages.length).to.eql(0);
        done();
      });

      $secondScope.$on('joinroom', function () {
        $scope.text = 'something';
        $scope.submit();
      });

      $secondScope.$on('createroom', function () {
        $scope.text = '--setroom temp';
        $scope.submit();
      });

      $scope.text = '--createroom temp';
      $scope.submit();

    });

    it('should set room and get messages in room', function () {

      $secondScope.$on('setroom', function () {
        expect($secondScope.messages.length).to.eql(1);
        done();
      });

      $secondScope.$on('message', function () {
        $secondScope.text = '--setroom temp';
        $secondScope.submit();
      });

      $secondScope.$on('joinroom', function () {
        $scope.text = 'something';
        $scope.submit();
      });

      $secondScope.$on('createroom', function () {
        $scope.text = '--setroom temp';
        $scope.submit();
      });

      $scope.text = '--createroom temp';
      $scope.submit();

    });


  });

  describe('filetransfer', function () {

    beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
    beforeEach(function (done) { somethingConnect($scope, $secondScope, done) });
    beforeEach(function (done) { setRoom($scope, $secondScope, done) });
    afterEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

    describe('send request', function () {

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

      it('should send request from different room', function (done) {

        $secondScope.$on('hasRequest', function () {

          expect($secondScope.acceptFiles.length).to.eql(0);

          done();

        });

        $scope.text = '--createroom temp';
        $scope.submit();
        $scope.text = '--setroom temp';
        $scope.submit();
        $scope.tempAddFile('something.json', 'some data');

      });

    });

    describe('accept request', function () {

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

      it('should not accept request from different room', function (done) {

        $secondScope.$on('acceptrequesterror', function () {

          expect($secondScope.messages[$secondScope.messages.length - 1].message).to.eql('file does not exist');

          done();

        });

        $secondScope.$on('hasRequest', function () {
          $secondScope.text = '--accept something.json';
          $secondScope.submit();
        });

        $scope.text = '--createroom temp';
        $scope.submit();
        $scope.text = '--setroom temp';
        $scope.submit();
        $scope.tempAddFile('something.json', 'some data');

      });

    });

    describe('remove request', function () {

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

      it('should remove request from different room', function (done) {

        $secondScope.$on('rmsend', function () {

          expect($secondScope.acceptFiles.length).to.eql(1);

          done();

        });

        $scope.tempAddFile('something.json', 'some data');
        $scope.text = '--createroom temp';
        $scope.submit();
        $scope.text = '--setroom temp';
        $scope.submit();
        $scope.tempAddFile('temp.json', 'some data')
        $scope.text = '--rmsend temp.json';
        $scope.submit();

      });

      it('should not remove request from different room', function (done) {

        $secondScope.$on('leaveroom', function () {

          $scope.text = '--rmsend something.json';
          $scope.submit();

          expect($scope.messages[$scope.messages.length - 1].message).to.eql('file does not exist in this room');

          done();

        });

        $scope.text = '--createroom temp';
        $scope.submit();
        $scope.tempAddFile('something.json', 'some data');
        $scope.text = '--setroom temp';
        $scope.submit();

      });

    });

    describe('setroom', function () {

      it('should get sendfiles in room', function (done) {

        var leaveRoomCount = 0;

        $secondScope.$on('leaveroom', function () {

          leaveRoomCount++;

          if (leaveRoomCount === 1) {
            expect($scope.sendFiles.length).to.eql(0);
            $scope.text = '--setroom something';
            $scope.submit();
          }

          if (leaveRoomCount === 2) {
            expect($scope.sendFiles.length).to.eql(1);
            done();
          }

        });

        $secondScope.$on('hasRequest', function () {
          $scope.text = '--setroom temp';
          $scope.submit();
        });

        $secondScope.$on('createroom', function () {
          $scope.tempAddFile('something.json', 'some data');
        });

        $scope.text = '--createroom temp';
        $scope.submit();

      });

      it('should get acceptfiles in room', function (done) {

        $secondScope.$on('setroom', function () {

          expect($secondScope.acceptFiles.length).to.eql(1);

          done();

        });

        $secondScope.$on('hasRequest', function () {

          $secondScope.text = '--setroom temp';
          $secondScope.submit();
        });

        $scope.text = '--createroom temp';
        $scope.submit();
        $scope.text = '--setroom temp';
        $scope.submit();
        $scope.tempAddFile('something.json', 'some data');

      });

    });

    describe('remove room', function () {

      it('should remove sendfiles on remove room', function (done) {

        $secondScope.$on('removeroom', function () {

          expect($scope.sendFiles.length).to.eql(0);

          done();

        });

        $secondScope.$on('hasRequest', function () {
          $scope.text = '--rmroom something';
          $scope.submit();
        });

        $scope.tempAddFile('something.json', 'some data');

      });

      it('should remove sendfiles on user remove room', function (done) {

	$secondScope.$on('removeroom', function () {
	  expect($secondScope.sendFiles.length).to.eql(0);
	  done();
	});

	$scope.$on('hasRequest', function () {
	  $scope.text = '--rmroom something';
	  $scope.submit();
	});

	$secondScope.tempAddFile('something.json', 'some data');

      });

      it('should not remove sendfiles on different room remove', function (done) {

        $secondScope.$on('removeroom', function () {
          expect($scope.sendFiles.length).to.eql(1);
          done();
        });

        $secondScope.$on('hasRequest', function () {
          $scope.text = '--rmroom temp';
          $scope.submit();
        });

        $secondScope.$on('createroom', function () {
          $scope.tempAddFile('something.json', 'some data');
        });

        $scope.text = '--createroom temp';
        $scope.submit();

      });

      it('should not remove sendfiles on user different remove room', function (done) {

	$secondScope.$on('removeroom', function () {
	  expect($secondScope.sendFiles.length).to.eql(1);
	  done();
	});

	$scope.$on('hasRequest', function () {
	  $scope.text = '--rmroom temp';
	  $scope.submit();
	});

	$secondScope.$on('createroom', function () {
	  $secondScope.tempAddFile('something.json', 'some data');
	});

	$scope.text = '--createroom temp'
	$scope.submit();

      });

      it('should remove acceptfiles on remove room', function () {

        $scope.$on('removeroom', function () {

          expect($scope.acceptFiles.length).to.eql(0);

          done();

        });

        $scope.$on('hasRequest', function () {
          $scope.text = '--rmroom something';
          $scope.submit();
        });

        $secondScope.tempAddFile('something.json', 'some data');

      });

      it('should remove acceptfiles on user remove room', function (done) {

        $secondScope.$on('removeroom', function () {

          expect($secondScope.acceptFiles.length).to.eql(0);

          done();

        });

        $secondScope.$on('hasRequest', function () {
          $scope.text = '--rmroom something'
          $scope.submit();
        });

        $scope.tempAddFile('something.json', 'some data');

      });

      it('should not remove acceptfiles on different remove room', function (done) {

        $scope.$on('didremoveroom', function () {

          expect($scope.acceptFiles.length).to.eql(1);

          done();

        });

        $scope.$on('hasRequest', function () {
          $scope.text = '--rmroom temp';
          $scope.submit();
        });

        $scope.$on('didcreateroom', function () {
          $secondScope.tempAddFile('something.json', 'some data');
        });

        $scope.text = '--createroom temp';
        $scope.submit();

      });

      it('should not remove accept files on user different remove room', function (done) {

        $secondScope.$on('removeroom', function () {

          expect($secondScope.acceptFiles.length).to.eql(1);

          done();

        });

        $secondScope.$on('hasRequest', function () {
          $scope.text = '--rmroom temp';
          $scope.submit();
        });

        $secondScope.$on('createroom', function () {
          $scope.tempAddFile('something.json', 'some data');
        });

        $scope.text = '--createroom temp';
        $scope.submit();

      });

    });

    describe('connect', function () {

      it('should add send file connect then send request', function (done) {

        $secondScope.$on('didDisconnect', function () {

          $scope.$on('didcreateroom', function () {

            $scope.$on('setroom', function () {

              $secondScope.$on('hasRequest', function () {

                expect($secondScope.acceptFiles.length).to.eql(0);

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

    });

    describe('disconnect', function () {

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

      it('should remove acceptfiles on disconnect', function (done) {

        $secondScope.$on('disconnect', function () {

          expect($secondScope.acceptFiles.length).to.eql(0);

          done();

        });

        $secondScope.$on('hasRequest', function () {
          $secondScope.text = '--disconnect';
          $secondScope.submit();
        });

        $scope.tempAddFile('something.json', 'some data');

      });

      it('should remove acceptfiles on user disconnect', function (done) {

        $secondScope.$on('didDisconnect', function () {

          expect($secondScope.acceptFiles.length).to.eql(0);

          done();

        });

        $secondScope.$on('hasRequest', function () {
          $scope.text = '--disconnect';
          $scope.submit();
        });

        $scope.tempAddFile('something.json', 'some data');

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
  var secondRemoveOnJoinRoom = null;

  removeOnJoinRoom = $scope.$on('joinroom', function () {
    removeOnJoinRoom();
    fn();
  });

  secondRemoveOnJoinRoom = $secondScope.$on('joinroom', function () {
    secondRemoveOnJoinRoom();
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
