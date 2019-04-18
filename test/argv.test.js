const argv = require('../argv');

test('parse `node` and `exe` arguments', () => {
  const { node, exe } = argv.parse(['n', 'e']);
  expect(node).toBe('n');
  expect(exe).toBe('e');
});

test('parse an empty arguments list', () => {
  const { args } = argv.parse(['', '']);
  expect(args).toEqual({});
});

test('parse arguments', () => {
  const { args } = argv.parse(['', '', 'a', 'b=b_value', 'c=', 'd==']);
  expect(args).toEqual({
    'a': undefined,
    'b': 'b_value',
    'c': '',
    'd': '',
  }, args);
});
