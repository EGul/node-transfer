
describe('user', function () {

  var $scope = null;
  var tempUser = null;

  beforeEach(function () {

    module('app');

    inject(function ($rootScope, userFactory) {

      $scope = $rootScope.$new();

      tempUser = userFactory;

    });

  });

  describe('creatUser', function () {

    it('should creat a new user', function () {

      var json = {
        name: 'something',
        id: '1'
      };

      var somethingUser = new tempUser(json);

      expect(somethingUser.json.name).to.eql('something');

    });

  });


});
