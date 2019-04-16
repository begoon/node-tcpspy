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

function hexify(buffer, offset) {
  let lines = [
    hex_header_title.toUpperCase(),
    hex_header_separator,
  ]

  for (let i = 0; i < buffer.length; i += hexify_width) {
    let address = (offset + i).toString(16).padStart(offset_width, '0')
    let packet_address = i.toString(16).padStart(offset_width, '0')
    let block = buffer.slice(i, i + hexify_width)
    let hexArray = []
    let asciiArray = []
    let padding = ''

    for (let value of block) {
      hexArray.push(value.toString(16).padStart(2, '0'))
      asciiArray.push(value >= 0x20 && value < 0x7f ? String.fromCharCode(value) : '.')
    }

    if (hexArray.length < hexify_width) {
      let space = hexify_width - hexArray.length
      padding = ' '.repeat(space * 3)
    }

    let hexString = hexArray.join(' ')

    let asciiString = asciiArray.join('')
    let line = `${address.toUpperCase()} ${packet_address.toUpperCase()} ${hexString.toUpperCase()} ${padding}|${asciiString}|`

    lines.push(line)
  }

  return lines.join('\n')
}

exports.hexify = hexify
