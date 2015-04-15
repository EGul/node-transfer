angular.module('app').directive('scrollMessagesDirective', scrollMessagesDirective);

function scrollMessagesDirective() {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      if (scope.$last) {
	var temp = document.getElementById('messages');
	temp.scrollTop = temp.scrollHeight;
      }
    }
  }

}
