
angular.module('app').factory('messagesFactory', messagesFactory);

function messagesFactory() {

  return function () {

    this.messages = [];

    this.addMessage = function (roomId, from, message) {

      var messageObj = {
        roomId: roomId,
        from: from,
        message: message
      }

      this.messages.push(messageObj);

    }

    this.getMessages = function (property, value, fn) {

      var tempMessages = this.messages.filter(function (e) {
        if (e[property] === value) return e;
      });

      fn(null, tempMessages);
    }

  }

}
