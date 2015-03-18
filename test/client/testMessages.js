
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

  describe('getMessages', function () {

    it('should get messages', function (done) {

      messages.addMessage('0', 'someone', 'something');
      messages.addMessage('1', 'someone', 'something');

      messages.getMessages('roomId', '0', function (err, messages) {

        expect(err).to.eql(null);
        expect(messages.length).to.eql(1);

        done();

      });

    });

  });


});
