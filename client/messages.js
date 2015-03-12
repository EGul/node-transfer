
angular.module('app').factory('messagesFactory', messagesFactory);

function messagesFactory() {

  return function () {

    this.messages = [];

    this.addMessage = function (from, message) {

      var messageObj = {
        from: from,
        message: message
      }

      this.messages.push(messageObj);

    }

  }

}
