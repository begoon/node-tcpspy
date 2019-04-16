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

var offset_hexs = new Array(0x10000)
for (let i = 0; i < offset_hexs.length; ++i) {
  offset_hexs[i] = i.toString(16).toUpperCase().padStart(offset_width, '0')
}

var offset_hex_halves = new Array(offset_hexs.length)
for (let i = 0; i < offset_hex_halves.length; ++i) {
  offset_hex_halves[i] = i.toString(16).toUpperCase().padStart(offset_width / 2, '0')
}

function hexify(buffer, offset) {
  let lines = [
    hex_header_title.toUpperCase(),
    hex_header_separator,
  ]

  for (let i = 0; i < buffer.length; i += hexify_width) {
    let offset_i = offset + i

    let address = offset_i < offset_hexs.length 
      ? offset_hexs[offset_i] 
      : (offset_hex_halves[offset_i >> 16] + offset_hex_halves[offset_i & 0xffff])

    let packet_address = i < offset_hexs.length 
      ? offset_hexs[i] 
      : (offset_hex_halves[i >> 16] + offset_hex_halves[i & 0xffff])
    
    let block = buffer.slice(i, i + hexify_width)

    let hexArray = []
    let asciiArray = []
    let padding = ''

    for (let value of block) {
      hexArray.push(hexs[value])
      asciiArray.push(printables[value])
    }

    padding = ' '.repeat((hexify_width - hexArray.length) * 3)

    let hexString = hexArray.join(' ')

    let asciiString = asciiArray.join('')
    let line = `${address.toUpperCase()} ${packet_address.toUpperCase()} ${hexString.toUpperCase()} ${padding}|${asciiString}|`

    lines.push(line)
  }

  return lines.join('\n')
}

exports.hexify = hexify
