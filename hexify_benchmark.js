const fs = require('fs');
const { performance } = require('perf_hooks');

const hexify = require('./hexify');

const raw = Buffer.alloc(50*1024*1024);
for (let i = 0; i < raw.length; ++i) {
  raw[i] = i & 0xff;
}

console.log(`Sample size ${raw.length}(=${raw.length/1024/1024}MB)`);

(function test_benchmark() {
  console.log(arguments.callee.name);

  const buffer = Buffer.from(raw);
  const packet_size = 0x10000;

  const started = performance.now();

  let sz = 0;
  for (let i = 0; i < buffer.length; i += packet_size) {
    const block = buffer.slice(i, i + packet_size);
    var hex = hexify.hexify(block, i);
    sz += hex.length;
  }

  var ended = performance.now();
  const duration = (ended - started) / 1000;
  const speed = (raw.length/1024)/duration;
  console.log(`${duration.toFixed(2)}(s) ${speed.toFixed(0)}(kb/s) ${sz}`)

})();
