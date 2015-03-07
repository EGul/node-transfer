
describe('users', function () {

  var $scope = null;
  var users = null
  var tempUser = null;

  beforeEach(function () {

    module('app');

    inject(function ($rootScope, usersFactory) {

      $scope = $rootScope.$new();
      users = new usersFactory();

    });

  });

  describe('addUser', function () {

    it('should add user', function () {

      var json = {
        name: 'something',
        id: '1'
      };

      users.addUser(json);

      expect(users.users.length).to.eql(1);
      expect(users.users[0].json.name).to.eql('something');

    });

  });

  describe('getUsers', function () {

    beforeEach(function () {
      users.addUser({name: 'something', id: '1'});
    });

    it('should get users', function (done) {

      users.getUsers('id', '1', function (err, tempUsers) {
        expect(err).to.eql(null);
        expect(tempUsers.length).to.eql(1);
        done();
      });

    });

    it('should get error  user does not exist', function (done) {

      users.getUsers('id', '5', function (err, tempUsers) {
        expect(err).to.eql('user does not exist');
        expect(tempUsers).to.eql(null);
        done();
      });

    });

  });

  describe('removeUser', function () {

    beforeEach(function () {
      users.addUser({name: 'something', id: '1'});
    });

    it('should remove user', function () {

      users.removeUser('id', '1', function (err) { });

      expect(users.users.length).to.eql(0);

    });

    it('should not remove user', function () {

      users.removeUser('id', '5', function (err) { });

      expect(users.users.length).to.eql(1);

    });

  });

});
