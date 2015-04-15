
angular.module('app').directive('fileUploadDirective', fileUploadDirective);

function fileUploadDirective() {

  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {

      var tempElem = elem[0];

      tempElem.ondragover = handleDrag;
      tempElem.ondragend = handleDragEnd;
      tempElem.ondrop = handleDrop;

      function handleDrag(e) {
        e.stopPropagation();
        e.preventDefault();
      }

      function handleDragEnd(e) {
        e.stopPropagation();
        e.preventDefault();
      }

      function handleDrop(e) {

        e.stopPropagation();
        e.preventDefault();

        var file = e.dataTransfer.files[0];
        var read = new FileReader();

        read.onload = function (something) {
          scope.tempAddFile(file.name, something.target.result);
        }

        read.readAsText(file);

      }

    }
  }

}
