
var client = require('./client');
var server = require('./server');
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function clientOrServer() {

  rl.question('client or server: ', function(answer) {

    if (answer !== 'client' && answer !== 'server') return clientOrServer();

    if (answer === 'client') {
      rl.close();
      client.something();
    }

    if (answer === 'server') {
      rl.close();
      server.something();
    }

  });

}
clientOrServer();
