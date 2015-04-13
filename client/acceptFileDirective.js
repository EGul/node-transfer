
angular.module('app').directive('acceptFileDirective', acceptFileDirective);

function acceptFileDirective() {
  return {
    restrict: 'A',
    controller: function ($scope, $element) {
      function handleSelect() {
        var argv = {'accept': $scope.item.filename};
        $scope.select(argv);
      }
      $element.bind('click', handleSelect);
    }
  }
}
