
describe('room', function () {

  var $scope = null;
  var room = null

  beforeEach(function () {

    module('app');

    inject(function ($rootScope, roomFactory) {

      $scope = $rootScope.$new();
      room = new roomFactory();

    });

  });

  describe('createRoom', function () {

    it('should create room', function (done) {

      room.createRoom('something', function (err) {

        expect(err).to.eql(null);
        expect(room.id).to.not.eql(null);
        expect(room.fromId).to.eql(null);
        expect(room.name).to.eql('something');
        expect(room.didCreate).to.eql(true);

        done();

      });

    });

  });

  describe('addRoom', function () {

    it('should add room', function (done) {

      room.addRoom('1', '1', 'something', function (err) {

        expect(err).to.eql(null);
        expect(room.id).not.to.eql(null);
        expect(room.fromId).not.to.eql(null);
        expect(room.name).to.eql('something');
        expect(room.didCreate).to.eql(false);

        done();

      });

    });

  });

});

describe('rooms', function () {

  var $scope = null;
  var rooms = null

  beforeEach(function () {

    module('app');

    inject(function ($rootScope, roomsFactory) {

      $scope = $rootScope.$new();
      rooms = new roomsFactory();

    });

  });

  describe('createRoom', function () {

    it('should create room', function (done) {

      rooms.createRoom('something', function (err) {

        expect(err).to.eql(null);
        expect(rooms.rooms.length).to.eql(1);
        expect(rooms.rooms[0].name).to.eql('something');
        expect(rooms.rooms[0].didCreate).to.eql(true);

        done();

      });

    });

  });

  describe('addRoom', function () {

    it('should add room', function (done) {

      rooms.addRoom('1', '1', 'something', function (err) {

        expect(err).to.eql(null);
        expect(rooms.rooms.length).to.eql(1);
        expect(rooms.rooms[0].name).to.eql('something');
        expect(rooms.rooms[0].didCreate).to.eql(false);

        done();

      });

    });

  });

  describe('removeRoom', function () {

    it('should get error room does not exist', function (done) {

      rooms.createRoom('something', function (err) {

        rooms.removeRooms('name', 'temp', function (err) {

          expect(err).to.eql('room does not exist');
          expect(rooms.rooms.length).to.eql(1);

          done();

        });

      });

    });

    it('should remove room', function (done) {

      rooms.createRoom('something', function (err) {

        rooms.removeRooms('name', 'something', function (err) {

          expect(err).to.eql(null);
          expect(rooms.rooms.length).to.eql(0);

          done();

        });

      });

    });

  });

  describe('removeAllRooms', function () {

    it('should remove all rooms', function (done) {

      rooms.createRoom('something', function (err) {

        rooms.removeAllRooms();

        expect(rooms.rooms.length).to.eql(0);

        done();

      });

    });

  });

  describe('getRooms', function () {

    it('should get error room does not exist', function (done) {

      rooms.createRoom('something', function (err) {

        rooms.getRooms('name', 'temp', function (err, tempRooms) {

          expect(err).to.eql('room does not exist');
          expect(tempRooms).to.eql(null);

          done();

        });

      });

    });

    it('should get rooms', function (done) {

      rooms.createRoom('something', function (err) {

        rooms.getRooms('name', 'something', function (err, tempRooms) {

          expect(err).to.eql(null);
          expect(tempRooms.length).to.eql(1);
          expect(tempRooms[0].name).to.eql('something');

          done();

        });

      });

    });

  });

  describe('hasRoom', function () {

    it('should not have room', function (done) {

      rooms.createRoom('something', function () {
        rooms.hasRoom('not', function (hasRoom) {
          expect(hasRoom).to.eql(false);
          done();
        });
      });

    });

    it('should not have room', function (done) {
      rooms.hasRoom('something', function (hasRoom) {
        expect(hasRoom).to.eql(false);
        done();
      });
    });

    it('should have room', function (done) {

      rooms.createRoom('something', function (err) {
        rooms.hasRoom('something', function (hasRoom) {
          expect(hasRoom).to.eql(true);
          done();
        });
      });

    });

  });

  describe('joinRoom', function () {

    it('should join room', function (done) {

      rooms.joinRoom('1', '1', function (err) {

        expect(err).to.eql(null);
        expect(rooms.users.length).to.eql(1);

        done();

      });

    });

  });

  describe('leaveRoom', function () {

    it('should leave room', function (done) {

      rooms.joinRoom('1', '1', function (err) {

        rooms.leaveRoom('1', '1', function (err) {

          expect(err).to.eql(null);
          expect(rooms.users.length).to.eql(0);

          done();

        });

      });

    });

  });

  describe('getUsersByRoomId', function () {

    it('should get users by room id', function (done) {

      rooms.joinRoom('0', '0', function () { });
      rooms.joinRoom('1', '1', function () { });

      rooms.getUsersByRoomId('0', function (err, roomUsers) {

        expect(err).to.eql(null);
        expect(roomUsers.length).to.eql(1);

        done();

      });

    });

  });

});
