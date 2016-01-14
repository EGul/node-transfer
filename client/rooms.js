
var app = angular.module('app');
app.factory('roomsFactory', roomsFactory);
app.factory('roomFactory', roomFactory);

function roomFactory() {

  return function () {

    this.id = null;
    this.fromId = null;
    this.name = null;
    this.didCreate = null;

    this.createRoom = function (name, fn) {

      this.id = uuid.v1();
      this.name = name;
      this.didCreate = true;

      fn(null);
    }

    this.addRoom = function (roomId, fromId, name, fn) {

      this.id = roomId;
      this.fromId = fromId;
      this.name = name;
      this.didCreate = false;

      fn(null);
    }

  }

}


function roomsFactory(roomFactory) {

  return function () {

    this.rooms = [];
    this.users = [];

    this.createRoom = function (name, fn) {

      var room = new roomFactory();

      room.createRoom(name, function (err) {

      });

      this.rooms.push(room);
      fn(null);

    }

    this.addRoom = function (roomId, fromId, name, fn) {

      var room = new roomFactory();

      room.addRoom(roomId, fromId, name, function (err) {

      });

      this.rooms.push(room);
      fn(null);

    }

    this.removeRooms = function (property, value, fn) {

      var numRooms = this.rooms.length;

      var tempRoomId = null;

      this.rooms = this.rooms.filter(function (e) {
        if (e[property] !== value) {
          return e;
        }
        else {
          tempRoomId = e.id;
        }
      });

      this.users = this.users.filter(function (e) {
        if (e.roomId !== tempRoomId) return e;
      });

      if (this.rooms.length === numRooms) return fn('room does not exist');
      fn(null);
    }

    this.removeAllRooms = function () {
      this.rooms = [];
      this.users = [];
    }

    this.getRooms = function (property, value, fn) {

      var tempRooms = this.rooms.filter(function (e) {
        if (e[property] === value) return e;
      });

      if (!tempRooms.length) return fn('room does not exist', null);
      fn(null, tempRooms);
    }

    this.hasRoom = function (name, fn) {

      var tempRooms = this.rooms.filter(function (e) {
        if (e.name === name) return e;
      });

      if (!tempRooms.length) return fn(false);
      return fn(true);

    }

    this.joinRoom = function (roomId, userId, fn) {

      var temp = {
        roomId: roomId,
        userId: userId
      };

      this.users.push(temp);

      fn(null);
    }

    this.leaveRoom = function (roomId, userId, fn) {

      this.users = this.users.filter(function (e) {
        if (!(e.userId === userId && e.roomId === roomId)) return e;
      });

      fn(null);
    }

    this.getUsersByRoomId = function (roomId, fn) {

      var tempUsers = this.users.filter(function (e) {
        if (e.roomId === roomId) return e;
      });

      if (!tempUsers.length) return fn('user does not exist', tempUsers);
      fn(null, tempUsers);
    }

  }

}
