
angular.module('app').directive('roomDirective', roomDirective);

function roomDirective() {
  return {
    restrict: 'A',
    controller: function ($scope, $element) {
      function didSelect() {
        $scope.select({'setroom': $scope.item.name});
      }
      $element.bind('click', didSelect);
    }
  }
}

