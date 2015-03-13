
angular.module('app').factory('roomsFactory', roomsFactory);

function roomsFactory() {

  return function () {

    this.rooms = [];

    this.createRoom = function (name, fn) {

      var room = {
        id: uuid.v1(),
        fromId: null,
        name: name,
        didCreate: true
      };

      this.rooms.push(room);

      fn(null);
    }

    this.addRoom = function (roomId, fromId, name, fn) {

      var room = {
        id: roomId,
        fromId: fromId,
        name: name,
        didCreate: false
      };

      this.rooms.push(room);

      fn(null);

    }

    this.removeRooms = function (property, value, fn) {

      var numRooms = this.rooms.length;

      this.rooms = this.rooms.filter(function (e) {
        if (e[property] !== value) return e;
      });

      if (this.rooms.length === numRooms) return fn('room does not exist');
      fn(null);
    }

    this.removeAllRooms = function () {
      this.rooms = [];
    }

    this.getRooms = function (property, value, fn) {

      var tempRooms = this.rooms.filter(function (e) {
        if (e[property] === value) return e;
      });

      if (!tempRooms.length) return fn('room does not exist', null);
      fn(null, tempRooms);
    }

  }

}
