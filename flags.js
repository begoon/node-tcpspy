'use strict';

const assert = require('assert').strict;
const argv = require('./argv');

function usage(node, exe) {
console.log(`
Usage: ${node} ${exe} -l=listen_port -a=host -p=port [-c] [-b] [-h] [-?]

Options:
  -a=host         - address/host to connect
  -p=port         - remote port to connect
  -l=listen_port  - local port to listen
  -c              - supress console output
  -b              - suppress binary logging
  -h              - supresss hexified data logging
  -?              - this help
  -v              - version
`
)}

var remote_host = false, remote_port = false;
var listen_port = false;

function parse(process_argv) {
  let flags = {
    log_binary: true,
    log_hexify: true
  };
  const { node, exe, args } = argv.parse(process_argv);
  for (const [arg, value] of Object.entries(args)) {
    switch (arg) {
      case "-l":
        flags.listen_port = parseInt(value);
        break;
      case "-a":
        flags.remote_host = value;
        break;
      case "-p":
        flags.remote_port = parseInt(value);
        break;
      case "-c":
        break;
      case "-b":
        flags.log_binary = false;
        break;
      case "-h":
        flags.log_hexify = false;
        break;
      case "-v":
        usage(node, exe);
        return undefined;
    }
  }
  try {
    assert.ok(flags.listen_port, "listen port is not given");
    assert.ok(flags.remote_host, "remote host is not given");
    assert.ok(flags.remote_port, "remote port is not given");
  } catch (e) {
    console.log(e.toString());
    throw e;
  }
  return flags;
}

module.exports = { parse };
