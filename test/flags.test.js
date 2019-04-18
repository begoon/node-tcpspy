const flags = require('../flags');

const empty_argv = ['n', 'e'];

test('throw without_mandatory flags', () => {
  const log = console.log;
  console.log = () =>{ };

  expect(() => flags.parse(empty_argv)).toThrow("listen port is not given");

  console.log = log;
});

test('return `undefined` on usage', () => {
  const log = console.log;
  let logged_msg = "";
  console.log = (msg) =>{ logged_msg = msg; };

  const argv = empty_argv.concat(['-v']);
  const args = flags.parse(argv);

  console.log = log;

  expect(args).toBeUndefined();
  expect(logged_msg).toMatch('Usage: n e');
});

test('not throw when mandatory flags exist', () => {
  const argv = empty_argv.concat(['-l=1', '-a=h', '-p=2']);
  expect(() => flags.parse(argv)).not.toThrow();
});

test('set defaults for unset flags', () => {
  const argv = empty_argv.concat(['-l=1', '-a=h', '-p=2']);
  const { log_hexify, log_binary } = flags.parse(argv);

  expect(log_hexify).toBeTruthy();
  expect(log_binary).toBeTruthy()
});

test('throw when numeric flags are not numbers', () => {
  const log = console.log;
  console.log = () =>{ };

  const argv_listen_port = empty_argv.concat(['-l=ABC', '-a=h', '-p=1']);
  expect(() => flags.parse(argv_listen_port)).toThrow("listen port is not given");

  const argv_remote_port = empty_argv.concat(['-l=1', '-a=h', '-p=XYZ']);
  expect(() => flags.parse(argv_remote_port)).toThrow("remote port is not given");

  console.log = log;
});

test('parse flags', () => {
  const argv = empty_argv.concat(['-l=1', '-a=h', '-p=2', '-b', '-h']);
  const {
    listen_port, remote_host, remote_port, log_hexify, log_binary
  } = flags.parse(argv);

  expect(listen_port).toBe(1);
  expect(remote_host).toMatch('h');
  expect(remote_port).toBe(2);
  expect(log_hexify).not.toBeTruthy();
  expect(log_binary).not.toBeTruthy();
});
