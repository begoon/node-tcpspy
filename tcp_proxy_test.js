const assert = require('assert').strict

const hexify = require('./hexify');

(function test_multiline() {
  console.log(arguments.callee.name)
  a = hexify.hexify(Buffer.from([...Array(17).keys()]), 0xC0DE)
  e = 
    '######## ######## 00.01.02.03.04.05.06.07.08.09.0A.0B.0C.0D.0E.0F\n' +
    '-------- -------- -----------------------------------------------\n' +
    '0000C0DE 00000000 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F |................|\n' + 
    '0000C0EE 00000010 10                                              |.|'
  assert.equal(a, e)
})();

(function test_oneline() {
  console.log(arguments.callee.name)
  a = hexify.hexify(Buffer.from([...Array(1).keys()]), 0xBEEF)
  e = 
    '######## ######## 00.01.02.03.04.05.06.07.08.09.0A.0B.0C.0D.0E.0F\n' +
    '-------- -------- -----------------------------------------------\n' +
    '0000BEEF 00000000 00                                              |.|'
  assert.equal(a, e)
})();

(function test_16_line() {
  console.log(arguments.callee.name)
  a = hexify.hexify(Buffer.from([...Array(16).keys()]), 0xC0DE)
  e = 
    '######## ######## 00.01.02.03.04.05.06.07.08.09.0A.0B.0C.0D.0E.0F\n' +
    '-------- -------- -----------------------------------------------\n' +
    '0000C0DE 00000000 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F |................|'
  assert.equal(a, e)
})();

(function test_print_only_visible_characters() {
  console.log(arguments.callee.name)
  a = hexify.hexify(Buffer.from([0, 1, 0x1f, 0x20, 0x31, 0x41, 0x7e, 0x7f]), 0xBEEF)
  e = 
    '######## ######## 00.01.02.03.04.05.06.07.08.09.0A.0B.0C.0D.0E.0F\n' +
    '-------- -------- -----------------------------------------------\n' +
    '0000BEEF 00000000 00 01 1F 20 31 41 7E 7F                         |... 1A~.|'
  assert.equal(a, e)
})();

(function test_empty_data() {
  console.log(arguments.callee.name)
  a = hexify.hexify(Buffer.from([]), 0xBEEF)
  e = 
    '######## ######## 00.01.02.03.04.05.06.07.08.09.0A.0B.0C.0D.0E.0F\n' +
    '-------- -------- -----------------------------------------------'
  assert.equal(a, e)
})();
