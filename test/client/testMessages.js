
describe('messages', function () {

  var $scope = null;
  var messages = null;

  beforeEach(function () {

    module('app');

    inject(function ($rootScope, messagesFactory) {

      $scope = $rootScope.$new();
      messages = new messagesFactory();

    });

  });

  describe('addMessage', function () {

    it('should add message', function () {

      messages.addMessage('someone', 'something');

      expect(messages.messages.length).to.eql(1);

    });

  });

});
