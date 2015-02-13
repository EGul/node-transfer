
var server = require('../lib/server.js');
var readline = require('readline');
var minimist = require('minimist');

var rl = null;

function something() {

  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('port ', function (answer) {
    server.connect(answer, function (err) {
      if (err) return console.log(err);
    });
  });

}

module.exports.something = something;
