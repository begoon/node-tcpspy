const net = require('net')
const fs = require('fs')

function formatAddress(ip, port) {
    return ip.replace("::ffff:", "") + "(" + port + ")"   
}

function formatNow() {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
}

function formatNowAsName() {
    return formatNow().replace(/:/g, '-').replace(' ', '_')
}

function formatLogFilename(fromInfo, toInfo) {
    return `log-${formatNowAsName()}-9999-${fromInfo}-${toInfo}.log`
}

function connectionProcessor(localSocket) 
{
  var targetPort = 21
  var targetHost = 'speedtest.tele2.net'

  targetPort = 80
  targetHost = 'ipv4.download.thinkbroadband.com'

  var proxyInfo = formatAddress(localSocket.localAddress, localSocket.localPort)
  var originatorInfo = formatAddress(localSocket.remoteAddress, localSocket.remotePort)
  var targetInfo = formatAddress(targetHost, targetPort)

  consoleFilename = formatLogFilename(originatorInfo, targetInfo)
  connectionConsole = new console.Console({stdout: fs.createWriteStream(consoleFilename)})

  console.log(`Local connection accepted on ${proxyInfo} from=${originatorInfo} ${consoleFilename}`)

  originatorToProxyPrefix = `${originatorInfo} to ${proxyInfo} >>`

  connectionConsole.log(`${formatNow()} ${originatorToProxyPrefix} Reading from ${originatorInfo} by ${proxyInfo} started`)

  originatorToProxyPacketN = 0
  originatorToProxyOffset = 0

  originatorFile = "originator"
  fs.unlink(originatorFile, (error) => {})

  localSocket.on('data', (buffer) => {
    n = buffer.length
    connectionConsole.log(`${formatNow()} ${originatorToProxyPrefix} Received (packet ${originatorToProxyPacketN}, offset ${originatorToProxyOffset}) ${n} byte(s) from ${originatorInfo}`)
    remoteSocket.write(buffer, 0, () => {
      connectionConsole.log(`${formatNow()} ${originatorToProxyPrefix} Sent (packet ${originatorToProxyPacketN}) to ${targetInfo}`)
      fs.appendFile(originatorFile, buffer, (error) => {
        if (error) throw error
        connectionConsole.log(`${formatNow()} ${originatorToProxyPrefix} Saved (packet ${originatorToProxyPacketN}) to ${originatorFile}`)
      })
      originatorToProxyPacketN += 1
      originatorToProxyOffset += n
    })
  })

  localSocket.on('end', () => {
    connectionConsole.log(`${formatNow()} ${originatorToProxyPrefix} Disconnected`)
  })

  localSocket.on('close', (hadError) => {
    connectionConsole.log(`${formatNow()} ${originatorToProxyPrefix} Closed ${hadError ? ' with an error':''}`)
    console.log(`Connection finished on ${proxyInfo} from=${originatorInfo}`)
  })

  localSocket.on('error', (error) => {
    connectionConsole.log(`${formatNow()} ${originatorToProxyPrefix} ERROR: [${error}]`)
  })

  // targetToProxyLogFilename = formatLogFilename(targetInfo, proxyInfo)
  // targetToProxyConsole = new console.Console({stdout: fs.createWriteStream(targetToProxyLogFilename)})
  
  targetToProxyPrefix = `${targetInfo} to ${proxyInfo} <<`
  targetToProxyPacketN = 0
  targetToProxyOffset = 0

  targetFile = "target"
  fs.unlink(originatorFile, (error) => {})

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
    localSocket.write(buffer, 0, () => {
      connectionConsole.log(`${formatNow()} ${targetToProxyPrefix} Sent (packet ${targetToProxyPacketN}) to ${originatorInfo}`)
      fs.appendFile(targetFile, buffer, (error) => {
        if (error) throw error
        connectionConsole.log(`${formatNow()} ${targetToProxyPrefix} Saved (packet ${targetToProxyPacketN}) to ${targetFile}`)
      })
      targetToProxyPacketN += 1
      targetToProxyOffset += n
    })

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
