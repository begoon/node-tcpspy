'use strict';

const net = require('net')
const fs = require('fs')
const hexify = require('./hexify')
const parse_flags = require('./flags').parse;

var connections_n = 0

try {
  var flags = parse_flags(process.argv);
} catch (e) {
  process.exit(1);
}

if (!flags) process.exit(2);

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

  const targetPort = flags.remote_port;
  const targetHost = flags.remote_host;

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
    let n = buffer.length
    connectionConsole.log(`${formatNow()} ${originatorToProxyPrefix} Received (packet ${originatorToProxyPacketN}, offset ${originatorToProxyOffset}) ${n} byte(s) from ${originatorInfo}`)
    remoteSocket.write(buffer, 0, function() {
      connectionConsole.log(`${formatNow()} ${originatorToProxyPrefix} Sent (packet ${this.packet_n}) to ${targetInfo}`)
      if (flags.log_hexify) {
        connectionConsole.log(hexify.hexify(buffer, this.offset))
      }
      connectionConsole.log(`${formatNow()} ${originatorToProxyPrefix} Saved (packet ${this.packet_n})`)
    }.bind({
      packet_n: originatorToProxyPacketN,
      offset: originatorToProxyOffset,
    }))
    originatorToProxyPacketN += 1
    originatorToProxyOffset += n
  })

  if (flags.log_binary) {
    localSocket.pipe(fs.createWriteStream(originatorFilename));
  }

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
    let n = buffer.length
    connectionConsole.log(`${formatNow()} ${targetToProxyPrefix} Received (packet ${targetToProxyPacketN}, offset ${targetToProxyOffset}) ${n} byte(s) from ${targetInfo}`)
    localSocket.write(buffer, 0, function() {
      connectionConsole.log(`${formatNow()} ${targetToProxyPrefix} Sent (packet ${this.packet_n}) to ${originatorInfo}`)
      if (flags.log_hexify) {
        connectionConsole.log(hexify.hexify(buffer, this.offset))
      }
      connectionConsole.log(`${formatNow()} ${targetToProxyPrefix} Saved (packet ${this.packet_n})`)
    }.bind({
      packet_n: targetToProxyPacketN,
      offset: targetToProxyOffset,
    }))
    targetToProxyPacketN += 1
    targetToProxyOffset += n
  })

  if (flags.log_binary) {
    remoteSocket.pipe(fs.createWriteStream(targetFilename));
  }

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

server.listen(flags.listen_port, () => {
  console.log(flags);
  console.log(`Listening on port ${flags.listen_port}, target ${flags.remote_host}:${flags.remote_port}`)
})
