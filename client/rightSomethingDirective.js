
angular.module('app').directive('rightSomethingDirective', rightSomethingDirective);

function rightSomethingDirective() {

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    template: [
    '<div class="file">',
    '<div class="box"></div>',
    '<div class="right">',
    '{{ item.filename }}<br>',
    '<span>from</span>',
    '</div>',
    '</div>'
    ].join(''),
    link: function (scope, elem, attrs) {

      var item = scope.item;
      var from = null;

      if (!item.hasOwnProperty('id')) {
        from = scope.tempJson.name;
      }
      else {

        var id = item.id;

        var tempUsers = scope.users.map(function (e) {
          if (id === e.json.id) return e;
        });

        var user = tempUsers[0];

        from = user[0].json.name;

      }

      var element = elem[0];
      var tempSpan = element.getElementsByTagName('span')[0];
      tempSpan.innerHTML = from;

    }

  }

}
