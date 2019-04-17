var hexify_width = 16
var offset_width = 8

var hex_header_separator = 
  '-'.repeat(offset_width) + ' ' + 
  '-'.repeat(offset_width) + ' ' + 
  '-'.repeat(hexify_width*3-1)

var hex_header_title = 
  '#'.repeat(offset_width) + ' ' + 
  '#'.repeat(offset_width) + ' '

for (let i = 0; i < hexify_width; ++i) {
  hex_header_title += i.toString(16).padStart(2, '0')
  if (i < hexify_width - 1)
    hex_header_title += '.'
}

var hexs = new Array(256)
var printables = new Array(256)
for (let i = 0; i < hexs.length; ++i) {
  hexs[i] = i.toString(16).toUpperCase().padStart(2, '0')
  printables[i] = i >= 0x20 && i < 0x7f ? String.fromCharCode(i) : '.'
}

var offset_hex_halves = new Array(0x10000)
for (let i = 0; i < offset_hex_halves.length; ++i) {
  offset_hex_halves[i] = i.toString(16).toUpperCase().padStart(offset_width / 2, '0')
}

function hexify(buffer, offset) {
  let lines = [
    hex_header_title.toUpperCase(),
    hex_header_separator,
  ]

  for (let i = 0; i < buffer.length; i += hexify_width) {
    const offset_i = offset + i;

    const address = offset_hex_halves[offset_i >> 16] + offset_hex_halves[offset_i & 0xffff];
    const packet_address = offset_hex_halves[i >> 16] + offset_hex_halves[i & 0xffff];
    
    const block = buffer.slice(i, i + hexify_width);

    let hex = "";
    let char = "";
    for (let value of block) {
      hex += hexs[value] + " ";
      char += printables[value];
    }

    const line = `${address} ${packet_address} ${hex.padEnd(hexify_width*3)}|${char}|`

    lines.push(line)
  }

  return lines.join('\n')
}

exports.hexify = hexify
