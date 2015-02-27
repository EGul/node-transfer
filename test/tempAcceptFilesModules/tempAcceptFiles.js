
var acceptFiles = { };

acceptFiles.files = [];

acceptFiles.addFile = function (file, fn) {
  this.files.push(file);
  fn(null);
}

acceptFiles.getFiles = function (property, value, fn) {

  if (!Array.isArray(property)) property = [property];
  if (!Array.isArray(value)) value = [value];

  var tempFiles = this.files.filter(function (e) {

    var get = true;

    for (var i = 0, l = property.length; i < l; i++) {
      if (property[i] !== null && e[property[i]] !== value[i]) get = false;
    }

    if (get) return e;
    get = true;

  });

  if (!tempFiles.length) return fn('file does not exist', tempFiles);
  fn(null, tempFiles);

}

acceptFiles.removeFiles = function (property, value, fn) {
  this.files = this.files.filter(function (e) {
    if (e[property] !== value) return e;
  });
  fn(null);
}

acceptFiles.removeAllFiles = function (fn) {
  this.files = [];
  fn(null);
}

module.exports = acceptFiles;
