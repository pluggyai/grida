import shelljs from 'shelljs'
import os from 'os'

export async function openMitmweb() {
  console.log('Opening mitmweb')
  await configureProxyInDevice()
  try {
    shelljs.exec('mitmweb', {
      async: true,
      silent: true,
    })
  } catch (error: any) {
    console.log(error)
    if (error.message.includes('address already in use')) {
      console.log('mitmweb not found, please install mitmproxy')
    }
  }
}

export async function configureProxyInDevice() {
  const ip = getInternalIpv4()
  shelljs.exec(`adb shell settings put global http_proxy ${ip}:8080`)
}

export async function restoreProxyConfigurationInDevice() {
  shelljs.exec(`adb shell settings put global http_proxy :0`)
}

function getInternalIpv4(): string {
  const interfaces = os.networkInterfaces()
  let internalIPv4

  for (const key in interfaces) {
    interfaces[key]?.forEach((details) => {
      if (!internalIPv4 && details.family === 'IPv4' && !details.internal) {
        internalIPv4 = details.address
      }
    })
  }

  return internalIPv4
}
