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

function connectionProcessor(localSocket) 
{
  var targetPort = 21
  var targetHost = 'speedtest.tele2.net'

  targetPort = 80
  targetHost = 'ipv4.download.thinkbroadband.com'

  var proxyInfo = formatAddress(localSocket.localAddress, localSocket.localPort)
  var originatorInfo = formatAddress(localSocket.remoteAddress, localSocket.remotePort)
  var targetInfo = formatAddress(targetHost, targetPort)

  console.log(`Local connection accepted on ${proxyInfo} from=${originatorInfo}`)

  originatorToProxyPrefix = `${originatorInfo} to ${proxyInfo} >>`
  console.log(`${formatNow()} ${originatorToProxyPrefix} Reading from ${originatorInfo} by ${proxyInfo} started`)

  originatorToProxyPacketN = 0
  originatorToProxyOffset = 0

  originatorFile = "originator"
  fs.unlink(originatorFile, (error) => {})

  localSocket.on('data', (buffer) => {
    n = buffer.length
    console.log(`${formatNow()} ${originatorToProxyPrefix} Received (packet ${originatorToProxyPacketN}, offset ${originatorToProxyOffset}) ${n} byte(s) from ${originatorInfo}`)
    remoteSocket.write(buffer, 0, () => {
      console.log(`${formatNow()} ${originatorToProxyPrefix} Sent (packet ${originatorToProxyPacketN}) to ${targetInfo}`)
      fs.appendFile(originatorFile, buffer, (error) => {
        if (error) throw error
        console.log(`${formatNow()} ${originatorToProxyPrefix} Saved (packet ${originatorToProxyPacketN}) to ${originatorFile}`)
      })
      originatorToProxyPacketN += 1
      originatorToProxyOffset += n
    })
  })

  localSocket.on('end', () => {
    console.log(`${formatNow()} ${originatorToProxyPrefix} Disconnected`)
  })

  localSocket.on('close', (hadError) => {
    console.log(`${formatNow()} ${originatorToProxyPrefix} Closed ${hadError ? ' with an error':''}`)
  })

  localSocket.on('error', (error) => {
    console.log(`${formatNow()} ${originatorToProxyPrefix} ERROR: [${error}]`)
  })
  
  targetToProxyPrefix = `${targetInfo} to ${proxyInfo} <<`
  targetToProxyPacketN = 0
  targetToProxyOffset = 0

  targetFile = "target"
  fs.unlink(originatorFile, (error) => {})

  var remoteSocket = new net.Socket()
  remoteSocket.connect(targetPort, targetHost, function() {
    console.log(`${formatNow()} ${targetToProxyPrefix} Reading from ${targetInfo} by ${proxyInfo}`)
  })

  remoteSocket.on('ready', () => {
    console.log(`${formatNow()} ${targetToProxyPrefix} Remote target ${targetInfo} is ready, resume reading from originator ${originatorInfo}`)
    localSocket.resume() 
  })

  remoteSocket.on('data', function(buffer) {
    n = buffer.length
    console.log(`${formatNow()} ${targetToProxyPrefix} Received (packet ${targetToProxyPacketN}, offset ${targetToProxyOffset}) ${n} byte(s) from ${targetInfo}`)
    localSocket.write(buffer, 0, () => {
      console.log(`${formatNow()} ${targetToProxyPrefix} Sent (packet ${targetToProxyPacketN}) to ${originatorInfo}`)
      fs.appendFile(targetFile, buffer, (error) => {
        if (error) throw error
        console.log(`${formatNow()} ${targetToProxyPrefix} Saved (packet ${targetToProxyPacketN}) to ${targetFile}`)
      })
      targetToProxyPacketN += 1
      targetToProxyOffset += n
    })

  })

  remoteSocket.on('end', () => {
    console.log(`${formatNow()} ${targetToProxyPrefix} Disconnected`)
  })

  remoteSocket.on('close', function(hadError) {
    console.log(`${formatNow()} ${targetToProxyPrefix} Closed ${hadError ? ' with an error':''}`)
    localSocket.end()
  })

  remoteSocket.on('error', (error) => {
    console.log(`${formatNow()} ${targetToProxyPrefix} ERROR: [${error}]`)
  })
}

const server = net.createServer({pauseOnConnect:true}, connectionProcessor)

server.on('error', (err) => {
  console.log(`Server error: {err}`)
})

server.listen(8888, () => {
  console.log('Listening')
})
