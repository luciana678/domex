import { networkInterfaces } from 'os'

// Function to obtain the private IP address of the Wi-Fi interface
function getPrivateIPWiFi() {
  const interfaces = os.networkInterfaces()

  // Look for the Wi-Fi interface
  const wifiInterface = interfaces['Wi-Fi'] || interfaces['wlan0'] || interfaces['wlp2s0'] // This may vary depending on the operating system

  if (!wifiInterface) {
    return 'Wi-Fi interface not found'
  }
  // Iterate over the addresses of the Wi-Fi interface
  for (const detail of wifiInterface) {
    // Filter IPv4 addresses that are not local
    if (!detail.internal && detail.family === 'IPv4') {
      return detail.address
    }
  }
  return 'Cannot obtain the private IP address of Wi-Fi interface'
}

const isValidIP = (ip) => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)

const privateIPWifi = getPrivateIPWiFi()
if (!privateIPWifi || !isValidIP(privateIPWifi))
  throw new Error('Cannot obtain the private IP address of Wi-Fi interface')

// Replace .env file with the obtained IP address in NEXT_PUBLIC_SERVER_URL
import { readFileSync, writeFileSync } from 'fs'

const envFilePath = '.env.local'
const existingEnvVars = readFileSync(envFilePath, 'utf8')

// Replace the value of NEXT_PUBLIC_SERVER_URL with the obtained IP address
let updatedEnvVars = existingEnvVars.replace(
  /NEXT_PUBLIC_SERVER_URL=.*/,
  `NEXT_PUBLIC_SERVER_URL="http://${privateIPWifi}:5000"`,
)

// If NEXT_PUBLIC_SERVER_URL is not present, add it to the end of the file
if (!updatedEnvVars.includes('NEXT_PUBLIC_SERVER_URL')) {
  updatedEnvVars += `\nNEXT_PUBLIC_SERVER_URL="http://${privateIPWifi}:5000"`
}

writeFileSync(envFilePath, updatedEnvVars)

console.log('The .env file has been updated with the private IP address of the Wi-Fi interface.')
