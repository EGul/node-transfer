
angular.module('app').factory('messagesFactory', messagesFactory);

function messagesFactory() {

  return function () {

    this.messageObjs = [];
    this.messages = [];

    this.addMessage = function (from, message) {

      var messageObj = {
        from: from,
        message: message
      }

      this.messageObjs.push(messageObj);

      var formattedMessage = '';
      if (from !== null) formattedMessage = from + ': ';
      formattedMessage = formattedMessage + message;

      this.messages.push(formattedMessage);

    }

  }

}
