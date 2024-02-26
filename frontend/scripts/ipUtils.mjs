import { networkInterfaces } from 'os'

export const isValidIP = (ip) => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)

// Function to obtain the private IP address of the Wi-Fi interface
export function getPrivateIPWiFi() {
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
