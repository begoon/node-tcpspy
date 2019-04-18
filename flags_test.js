const assert = require('assert').strict

const flags = require('./flags');

const empty_argv = ['n', 'e'];

(function test_should_throw_without_flags() {
  console.log(arguments.callee.name)

  const log = console.log;
  console.log = () =>{ };

  assert.throws(() => flags.parse(empty_argv), { message: "listen port is not given" });

  console.log = log;
})();

(function test_should_return_undefined_on_usage() {
  console.log(arguments.callee.name)

  const log = console.log;
  let logged_msg = "";
  console.log = (msg) =>{ logged_msg = msg; };

  const argv = empty_argv.concat(['-v']);
  assert.equal(undefined, flags.parse(argv));

  console.log = log;

  assert.ok(logged_msg.includes('Usage: n e'));
})();


(function test_should_not_throw_when_mandatory_flags_exist() {
  console.log(arguments.callee.name)

  const argv = empty_argv.concat(['-l=1', '-a=h', '-p=2']);
  assert.doesNotThrow(() => flags.parse(argv));
})();

(function test_should_set_default_for_unset_flags() {
  console.log(arguments.callee.name)

  const argv = empty_argv.concat(['-l=1', '-a=h', '-p=2']);
  const { log_hexify, log_binary } = flags.parse(argv);

  assert.ok(!log_hexify);
  assert.ok(!log_binary);
})();

(function test_should_throw_when_numeric_flags_are_not_numbers() {
  console.log(arguments.callee.name)

  const log = console.log;
  console.log = () =>{ };

  const argv_listen_port = empty_argv.concat(['-l=ABC', '-a=h', '-p=1']);
  assert.throws(() => flags.parse(argv_listen_port), { message: "listen port is not given" });

  const argv_remote_port = empty_argv.concat(['-l=1', '-a=h', '-p=XYZ']);
  assert.throws(() => flags.parse(argv_remote_port), { message: "remote port is not given" });

  console.log = log;
})();


(function test_should_parse_flags() {
  console.log(arguments.callee.name);

  const argv = empty_argv.concat(['-l=1', '-a=h', '-p=2', '-b', '-h']);
  const {
    listen_port, remote_host, remote_port, log_hexify, log_binary
  } = flags.parse(argv);

  assert.equal(1, listen_port);
  assert.equal('h', remote_host);
  assert.equal(2, remote_port);
  assert.ok(log_hexify);
  assert.ok(log_binary);
})();
