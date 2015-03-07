
var app = angular.module('app');
app.factory('userFactory', userFactory);

function userFactory() {

  function temp(json) {

    this.json = json;

  }

  return temp;

}
