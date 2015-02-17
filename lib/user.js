
function User(json) {

  this.json = json;

}

User.prototype.listJson = function () {
  console.log(this.json);
}

module.exports = User;
