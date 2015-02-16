
var client = require('../lib/client');
var readline = require('readline');
var minimist = require('minimist');

var rl;

var options = {
  users: 'connected users',
  send: 'send file. send filename to user',
  listsend: 'list hosted files',
  rmsend: 'remove hosted file. rmsend filename',
  accept: 'accept file. accept filename from user',
  listaccept: 'list users hosted files. listaccept from user',
  listjson: 'list users json. listjson from user'
}

function something() {

  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  getJson();

}

function getJson() {

  rl.question('json ', function (answer) {

    client.json(answer, function (err) {

      if (err) {
        console.log(err);
        return getJson();
      }

      console.log('did find json');

      didGetJson();

    });

  });

}

function didGetJson() {

  rl.on('line', function (line) {
    handleInput(line);
  });

}

function handleInput(line) {

  lineArr = line.split(' ');

  var argv = minimist(lineArr);
  argvLength = 0;

  for (var p in argv) {
    argvLength++;
  }

  function has(obj, properties) {
    for (var i = 0, l = properties.length; i < l; i++) {
      if (obj.hasOwnProperty(properties[i])) {
        return true;
      }
    }
    return false;
  }

  if (has(argv, ['connect'])) {
    handleConnect(argv);
  }
  else {

    if (has(argv, ['options'])) {
      handleOptions();
    }

    if (has(argv, ['users'])) {
      handleUsers();
    }

    if (has(argv, ['send'])) {
      handleSend(argv);
    }

    if (has(argv, ['listsend'])) {
      handleListSend(argv);
    }

    if (has(argv, ['rmsend'])) {
      handleRemoveSend(argv);
    }

    if (has(argv, ['accept'])) {
      handleAccept(argv);
    }

    if (has(argv, ['listaccept'])) {
      handleListAccept(argv);
    }

    if (has(argv, ['json'])) {
      handleJson(argv);
    }

    if (has(argv, ['listjson'])) {
      handleListJson(argv);
    }

    if (has(argv, ['setjson'])) {
      handleSetJson(argv);
    }

    if (argv._ && argvLength == 1) {
      handleMessage(line);
    }


  }

}

function handleConnect(argv) {

  var host = null;
  if (typeof argv.connect !== 'undefined') host = argv.connect;

  client.connect(host, function (err) {
    if (err) return console.log(err);
    console.log('did connect');
  });

}

/*
function handleConnect(argv) {

  var port = null;

  if (typeof argv.port !== 'undefined') port = argv.port;

  client.connect(port, function (err) {

    if (err) return console.log(err);

    console.log('did connect');

  });

}
*/

function handleOptions() {
  for (var p in options) {
    console.log(p + ': ' + options[p]);
  }
}

function handleUsers() {

  client.users(function (users) {
    console.log(users);
  });

}

function handleSend(argv) {

  var to = null;
  var fullPath = null;

  if (typeof argv.send !== 'undefined') fullPath = argv.send;
  if (typeof argv.to !== 'undefined') to = argv.to;

  var tempPath = __dirname.split('/');
  tempPath.splice(tempPath.length - 1);
  tempPath.push('test');
  tempPath.push(fullPath);
  tempPath = tempPath.join('/');

  client.send(to, tempPath, function (err) {
    if (err) console.log(err);
  });

}

function handleListSend(argv) {

  var to = null;
  if (typeof argv.to !== 'undefined') to = argv.to;

  client.listSend(to, function (err, listSend) {
    if (err) return console.log(err);;
    console.log(listSend);
  });

}

function handleRemoveSend(argv) {

  var filename = null;
  var to = null;
  if (typeof argv.rmsend !== 'undefined') filename = argv.rmsend;
  if (typeof argv.to !== 'undefined') to = argv.to;

  client.rmsend(to, filename, function (err) {
    if (err) console.log(err);
  });

}

function handleAccept(argv) {

  var from = null;
  var filename = null;
  var path = null;
  var toName = null;

  if (typeof argv.from !== 'undefined') from = argv.from;
  if (typeof argv.accept !== 'undefined') filename = argv.accept;
  if (typeof argv.path !== 'undefined') path = argv.path;
  if (typeof argv.name !== 'undefined') toName = argv.name;

  var tempPath = __dirname;
  path = tempPath;

  client.accept(from, filename, path, toName, function (err) {
    if (err) console.log(err);
  });

}

function handleListAccept(argv) {

  var from = null;
  if (typeof argv.from !== 'undefined') from = argv.from;

  client.listAccept(from, function (err, listAccept) {
    if (err) return console.log(err);
    console.log(listAccept);
  });

}

function handleJson(argv) {

  client.tempJson(function (json) {
    console.log(json);
  });

}

function handleListJson(argv) {

  var from = null;
  if (typeof argv.from !== 'undefined') from = argv.from;

  client.listJson(from, function (err, jsonArr) {
    if (err) return console.log(err);
    console.log(jsonArr);
  });

}

function handleSetJson(argv) {

  var path = null;
  if (typeof argv.setjson !== 'undefined') path = argv.setjson;

  client.setJson(path, function (err) {
    if (err) console.log(err);
  });

}

function handleMessage(line) {

  client.message(null, line, function (err) {

  });

}

client.on('something', function (json) {
  console.log(json.name + ' connected');
});

client.on('hasRequest', function (from, filename) {
  console.log(from + ' request to send file ' + filename);
});

client.on('rmsend', function (from, filename) {
  console.log(from + ' removed send file ' + filename);
});

client.on('fileData', function (from, filename) {
  console.log('did get file ' + filename + ' from ' + from);
});

client.on('userJson', function (json) {

});

client.on('jsonChanged', function (from) {
  console.log(from + ' changed json');
});

client.on('message', function (from, message) {
  console.log(from + '  ' + message);
});

client.on('didDisconnect', function (from) {
  console.log(from + ' disconnected');
});

module.exports.something = something;
