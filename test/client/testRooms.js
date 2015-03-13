
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

});
