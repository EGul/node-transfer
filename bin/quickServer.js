
var server = require('../lib/server');

var argv = process.argv;

if (argv.length == 2) {
  console.log('must add port');
  return;
}

var port = argv[2];

server.connect(port, function (err) {
  if (err) {
    console.log(err);
    return;
  }
});
