const net = require('net')
const fs = require('fs')

var connections_n = 0
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

function formatAddress(ip, port) {
  return ip.replace("::ffff:", "") + "(" + port + ")"
}

function formatNow() {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
}

function formatNowAsName() {
  return formatNow().replace(/[:-]/g, '.').replace(' ', '-')
}

function formatLogFilename(prefix, fromInfo, toInfo, conn_n) {
  return `${prefix}-${formatNowAsName()}-#${conn_n}-${fromInfo}-${toInfo}.log`
}

function formatConsoleFilename(fromInfo, toInfo, conn_n) {
  return formatLogFilename('log', fromInfo, toInfo, conn_n)
}

function formatBinaryLogFilename(fromInfo, toInfo, conn_n) {
  return formatLogFilename('log-raw', fromInfo, toInfo, conn_n)
}

function connectionProcessor(localSocket)
{
  var conn_n = connections_n
  connections_n += 1

  var targetPort = 21
  var targetHost = 'speedtest.tele2.net'
  targetPort = 80
  targetHost = 'ipv4.download.thinkbroadband.com'

  var proxyInfo = formatAddress(localSocket.localAddress, localSocket.localPort)
  var originatorInfo = formatAddress(localSocket.remoteAddress, localSocket.remotePort)
  var targetInfo = formatAddress(targetHost, targetPort)

  var consoleFilename = formatConsoleFilename(originatorInfo, targetInfo, conn_n)
  var connectionConsole = new console.Console({stdout: fs.createWriteStream(consoleFilename)})

  console.log(`Connection #${conn_n} accepted on ${proxyInfo} from=${originatorInfo} ${consoleFilename}`)

  var originatorToProxyPrefix = `${originatorInfo} to ${proxyInfo} >>`

  connectionConsole.log(`${formatNow()} ${originatorToProxyPrefix} Reading from ${originatorInfo} by ${proxyInfo} started`)

  var originatorToProxyPacketN = 0
  var originatorToProxyOffset = 0

  var originatorFilename = formatBinaryLogFilename(proxyInfo, originatorInfo, conn_n)

  localSocket.on('data', function(buffer) {
    n = buffer.length
    connectionConsole.log(`${formatNow()} ${originatorToProxyPrefix} Received (packet ${originatorToProxyPacketN}, offset ${originatorToProxyOffset}) ${n} byte(s) from ${originatorInfo}`)
    remoteSocket.write(buffer, 0, function() {
      connectionConsole.log(`${formatNow()} ${originatorToProxyPrefix} Sent (packet ${this.packet_n}) to ${targetInfo}`)
      connectionConsole.log(hexify(buffer, this.offset))
      fs.appendFileSync(originatorFilename, buffer);
      connectionConsole.log(`${formatNow()} ${originatorToProxyPrefix} Saved (packet ${this.packet_n})`)
    }.bind({
      packet_n: originatorToProxyPacketN,
      offset: originatorToProxyOffset,
    }))
    originatorToProxyPacketN += 1
    originatorToProxyOffset += n
  })

  localSocket.on('end', () => {
    connectionConsole.log(`${formatNow()} ${originatorToProxyPrefix} Disconnected`)
  })

  localSocket.on('close', (hadError) => {
    connectionConsole.log(`${formatNow()} ${originatorToProxyPrefix} Closed ${hadError ? ' with an error':''}`)
    console.log(`Connection #${conn_n} finished on ${proxyInfo} from=${originatorInfo}`)
  })

  localSocket.on('error', (error) => {
    connectionConsole.log(`${formatNow()} ${originatorToProxyPrefix} ERROR: [${error}]`)
  })

  var targetToProxyPrefix = `${targetInfo} to ${proxyInfo} <<`
  var targetToProxyPacketN = 0
  var targetToProxyOffset = 0

  var targetFilename = formatBinaryLogFilename(proxyInfo, targetInfo, conn_n)

  var remoteSocket = new net.Socket()
  remoteSocket.connect(targetPort, targetHost, function() {
    connectionConsole.log(`${formatNow()} ${targetToProxyPrefix} Reading from ${targetInfo} by ${proxyInfo}`)
  })

  remoteSocket.on('ready', () => {
    connectionConsole.log(`${formatNow()} ${targetToProxyPrefix} Remote target ${targetInfo} is ready, resume reading from originator ${originatorInfo}`)
    localSocket.resume()
  })

  remoteSocket.on('data', function(buffer) {
    n = buffer.length
    connectionConsole.log(`${formatNow()} ${targetToProxyPrefix} Received (packet ${targetToProxyPacketN}, offset ${targetToProxyOffset}) ${n} byte(s) from ${targetInfo}`)
    localSocket.write(buffer, 0, function() {
      connectionConsole.log(`${formatNow()} ${targetToProxyPrefix} Sent (packet ${this.packet_n}) to ${originatorInfo}`)
      connectionConsole.log(hexify(buffer, this.offset))
      fs.appendFileSync(targetFilename, buffer)
      connectionConsole.log(`${formatNow()} ${targetToProxyPrefix} Saved (packet ${this.packet_n})`)
    }.bind({
      packet_n: targetToProxyPacketN,
      offset: targetToProxyOffset,
    }))
    targetToProxyPacketN += 1
    targetToProxyOffset += n
  })

  remoteSocket.on('end', () => {
    connectionConsole.log(`${formatNow()} ${targetToProxyPrefix} Disconnected`)
  })

  remoteSocket.on('close', function(hadError) {
    connectionConsole.log(`${formatNow()} ${targetToProxyPrefix} Closed ${hadError ? ' with an error':''}`)
    localSocket.end()
  })

  remoteSocket.on('error', (error) => {
    connectionConsole.log(`${formatNow()} ${targetToProxyPrefix} ERROR: [${error}]`)
  })
}

const server = net.createServer({pauseOnConnect:true}, connectionProcessor)

server.on('error', (err) => {
  console.log(`Server error: {err}`)
})

server.listen(8888, () => {
  console.log('Listening')
})
