const assert = require('assert').strict;

const argv = require('./argv');

(function test_parse_node_and_exe() {
  console.log(arguments.callee.name)
  const { node, exe } = argv.parse(['n', 'e']);
  assert.equal('n', node);
  assert.equal('e', exe);
})();

(function test_parse_when_no_arguments() {
  console.log(arguments.callee.name)
  const { args } = argv.parse(['', '']);
  assert.deepStrictEqual({}, args);
})();

(function test_parse_arguments() {
  console.log(arguments.callee.name)
  const { args } = argv.parse(['', '', 'a', 'b=b_value', 'c=', 'd==']);
  assert.deepStrictEqual({
    'a': undefined,
    'b': 'b_value',
    'c': '',
    'd': '',
  }, args);
})();
