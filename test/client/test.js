
describe('client', function () {

  var $scope = null;
  var controller = null;

  var $secondScope = null;
  var secondController = null;

  beforeEach(function () {

    module('app');

    inject(function ($rootScope, $controller) {

      $scope = $rootScope.$new();
      controller = $controller('clientCtrl', {
        $scope: $scope
      });

      $secondScope = $rootScope.$new();
      secondController = $controller('clientCtrl', {
        $scope: $secondScope
      });

    });

  });

  describe('waiting for json', function () {

    it('should not add message', function () {

      $scope.text = 'something';
      $scope.submit();

      expect($scope.messages.length).to.eql(1);

    });

  });

  describe('waiting for connect', function () {

    beforeEach(function () { somethingSetTempJson($scope, $secondScope) });

    it('should get error message not connected', function () {

      $scope.text = 'something';
      $scope.submit();

      expect($scope.messages.length).to.eql(3);

    });

  });

  describe('tempjson', function () {

    it('should have message json:', function () {

      expect($scope.messages.length).to.eql(1);

    });

    it('should get error message json not correct', function () {

      $scope.tempAddFile('temp.json', '{"username": "first", "id": "1"}');

      expect($scope.tempJson).to.eql(null);
      expect($scope.messages.length).to.eql(2);
      expect($scope.messages[$scope.messages.length - 1]).to.eql('json is not correct');

    });

    it('should set tempjson', function () {

      $scope.tempAddFile('temp.json', '{"name": "first", "id": "1"}');

      expect($scope.tempJson).not.to.eql(null);
      expect($scope.messages.length).to.eql(2);
      expect($scope.messages[$scope.messages.length - 1]).to.eql('did get json');

    });

  });

  describe('connect', function () {

    it('should not connect', function (done) {

      $scope.$on('noJsonError', function () {
        expect($scope.messages.length).to.eql(1);
        done();
      });

      $scope.text = '--connect';
      $scope.submit();

    });

    it('should connect', function (done) {

      somethingSetTempJson($scope, $secondScope);
      somethingConnect($scope, $secondScope, function () {

        expect($scope.messages.length).to.eql(4);

        somethingDisconnect($scope, $secondScope, function () {
          done();
        });

      });

    });

  });

  describe('disconnect', function () {

    beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
    beforeEach(function (done) { somethingConnect($scope, $secondScope, done) });
    beforeEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

    it('should disconnect', function () {

      expect($scope.message.length).to.eql(5);

    });

  });

  describe('connected users', function () {

    beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
    beforeEach(function (done) { somethingConnect($scope, $secondScope, done) });
    afterEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

    it('should have connected users', function () {

      expect($scope.users.length).to.eql(1);
      expect($secondScope.users.length).to.eql(1);

      expect($scope.users[0].json.name).to.eql('second');
      expect($secondScope.users[0].json.name).to.eql('first');

    });

  });

  describe('message', function () {

    beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
    beforeEach(function (done) { somethingConnect($scope, $secondScope, done) });
    afterEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

    it('should send message', function (done) {

      $scope.text = 'something';
      $scope.submit();

      expect($scope.messages.length).to.eql(5);

      $secondScope.$on('message', function () {

        expect($secondScope.messages.length).to.eql(4);

        done();

      });

    });

  });

  describe('filetransfer', function () {

    beforeEach(function () { somethingSetTempJson($scope, $secondScope) });
    beforeEach(function (done) { somethingConnect($scope, $secondScope, done) });
    afterEach(function (done) { somethingDisconnect($scope, $secondScope, done) });

    it('should send request', function (done) {

      $scope.tempAddFile('something.json', 'some data');

      expect($scope.messages[$scope.messages.length - 1]).to.eql('did upload file');
      expect($scope.sendFiles.length).to.eql(1);

      $secondScope.$on('hasRequest', function () {

        expect($secondScope.messages[$secondScope.messages.length - 1]).to.eql('first: request to send file: something.json');
        expect($secondScope.acceptFiles.length).to.eql(1);

        done();

      });

    });

    it('should accept request', function (done) {

      $scope.tempAddFile('something.json', 'some data');

      $secondScope.$on('hasRequest', function () {

        $secondScope.text = '--accept something.json';
        $secondScope.submit();

      });

      $scope.$on('acceptRequest', function () {

        expect($scope.messages[$scope.messages.length - 1]).to.eql('did send file');

      });

      $secondScope.$on('fileData', function () {

        expect($secondScope.messages[$secondScope.messages.length - 1]).to.eql('did get file: something.json');

        done();

      });

    });

    it('should remove request', function (done) {

      $scope.tempAddFile('something.json', 'some data');

      $secondScope.$on('hasRequest', function () {

        $scope.text = '--rmsend something.json';
        $scope.submit();

        expect($scope.messages[$scope.messages.length - 1]).to.eql('did remove file');
        expect($scope.sendFiles.length).to.eql(0);

      });

      $secondScope.$on('rmsend', function () {

        expect($secondScope.messages[$secondScope.messages.length - 1]).to.eql('first: rmsend: something.json');
        expect($secondScope.acceptFiles.length).to.eql(0);

        done();

      });

    });

  });

});

function somethingSetTempJson($scope, $secondScope) {

  $scope.tempAddFile('temp.json', '{"name": "first", "id": "1"}');
  $secondScope.tempAddFile('temp.json', '{"name": "second", "id": "2"}');

}

function somethingConnect($scope, $secondScope, fn) {

  var count = 0;
  function did() {
    count++;
    if (count == 2) {
      fn();
    }
  }

  $scope.$on('connect', function () {

    $scope.$on('something', function () { did() });
    $secondScope.$on('userjson', function () { did() });

    $secondScope.text = '--connect';
    $secondScope.submit();

  });

  $scope.text = '--connect';
  $scope.submit();

}

function somethingDisconnect($scope, $secondScope, fn) {

  var count = 0;
  function did() {
    count++;
    if (count == 2) fn();
  }

  $scope.$on('disconnect', function () { did() });
  $secondScope.$on('disconnect', function () { did() });

  $scope.text = '--disconnect';
  $secondScope.text = '--disconnect';
  $scope.submit();
  $secondScope.submit();

}
