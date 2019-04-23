'use strict';

const basename = require('path').basename;

function parse(argv) {
  let args = {};

  for (let arg of argv.slice(2)) {
    const [name, value] = arg.split('=');
    args[name] = value;
  }

  return {
    node: basename(argv[0]),
    exe: basename(argv[1]),
    args
  };
}

module.exports = { parse };
