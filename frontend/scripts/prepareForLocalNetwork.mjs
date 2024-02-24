import { networkInterfaces } from 'os'

const isValidIP = (ip) => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)

// Function to obtain the private IP address of the Wi-Fi interface
function getPrivateIPWiFi() {
  const interfaces = networkInterfaces()

  // Common keywords for Wi-Fi interfaces
  const wifiKeywords = ['wireless', 'wifi', 'wlan', 'wi-fi', 'wlp', 'wlx']

  // Iterate over all network interfaces
  for (const interfaceName of Object.keys(interfaces)) {
    // Check if the interface name contains any of the Wi-Fi keywords (case-insensitive)
    if (wifiKeywords.some((keyword) => new RegExp(keyword, 'i').test(interfaceName))) {
      // Iterate over the addresses of the Wi-Fi interface
      for (const detail of interfaces[interfaceName]) {
        // Filter IPv4 addresses that are not internal
        if (!detail.internal && detail.family === 'IPv4' && isValidIP(detail.address)) {
          return detail.address
        }
      }
    }
  }

  return 'Cannot obtain the private IP address of Wi-Fi interface'
}

const privateIPWifi = getPrivateIPWiFi()

if (!privateIPWifi || !isValidIP(privateIPWifi))
  throw new Error(`
Cannot obtain the private IP address of Wi-Fi interface. Please check your network connection:
- Ensure that you are connected to a Wi-Fi network
- Ensure that the Wi-Fi interface is up and running
- Ensure that the Wi-Fi interface has a valid private IP address

If you are in Linux, you can check the interfaces and their IP addresses using the following command:
$ ip -br -c a

If you are in macOS, you can run the following 
$ ipconfig getifaddr en0

If you are in Windows, you can run the following command to check the private IP address of the Wi-Fi interface:
$ ipconfig

------------------------------ 
Please copy the private IP address of the Wi-Fi interface and replace the value of NEXT_PUBLIC_SERVER_URL in the .env file with the obtained IP address.
------------------------------
`)

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
