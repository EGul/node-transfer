angular.module('app').directive('usersDirective', usersDirective);

function usersDirective() {

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    template: [
    '<div class="user">',
      '<div class="box"> </div>',
      '<div class="right" ng-click="select({listuser: item.json.name})">',
      '{{ item.json.name }}<br>',
      '<span>something</span>',
      '</div>',
    '</div>'
    ].join(''),
    link: function (scope, elem, attrs) {

    }
  }

}
