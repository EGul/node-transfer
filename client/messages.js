
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

  }

}
