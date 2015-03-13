
angular.module('app').factory('roomsFactory', roomsFactory);

function roomsFactory() {

  return function () {

    this.rooms = [];

    this.createRoom = function (name, fn) {

      var room = {
        id: uuid.v1(),
        name: name
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

    this.getRooms = function (property, value, fn) {

      var tempRooms = this.rooms.filter(function (e) {
        if (e[property] === value) return e;
      });

      if (!tempRooms.length) return fn('room does not exist', null);
      fn(null, tempRooms);
    }

  }

}
