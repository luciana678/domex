import { networkInterfaces } from 'os'

// Function to obtain the private IP address of the Wi-Fi interface
function obtenerIPPrivadaWiFi() {
  const interfaces = networkInterfaces()

  // We look for the Wi-Fi interface
  const interfazWiFi = interfaces['Wi-Fi'] || interfaces['wlan0'] || interfaces['wlp2s0'] // This may vary depending on the operating system
  if (!interfazWiFi) {
    return 'Wi-Fi interface not found'
  }
  // Iterate over the addresses of the Wi-Fi interface
  for (const detalle of interfazWiFi) {
    // Filter IPv4 addresses that are not local
    if (!detalle.internal && detalle.family === 'IPv4') {
      return detalle.address
    }
  }
  return 'Cannot obtain the private IP address of Wi-Fi interface'
}

const isValidIP = (ip) => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)

const ipPrivadaWiFi = obtenerIPPrivadaWiFi()
if (!ipPrivadaWiFi || !isValidIP(ipPrivadaWiFi))
  throw new Error('Cannot obtain the private IP address of Wi-Fi interface')

// Replace .env file with the obtained IP address in NEXT_PUBLIC_SERVER_URL
import { readFileSync, writeFileSync } from 'fs'

const envFilePath = '.env.local'
const existingEnvVars = readFileSync(envFilePath, 'utf8')

// Replace the value of NEXT_PUBLIC_SERVER_URL with the obtained IP address
const updatedEnvVars = existingEnvVars.replace(
  /NEXT_PUBLIC_SERVER_URL=.*/,
  `NEXT_PUBLIC_SERVER_URL="http://${ipPrivadaWiFi}:5000"`,
)

writeFileSync(envFilePath, updatedEnvVars)

console.log('The .env file has been updated with the private IP address of the Wi-Fi interface.')
