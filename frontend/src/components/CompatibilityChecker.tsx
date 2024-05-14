'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { WEBRTC_SUPPORT } from 'simple-peer'

const CompatibilityChecker = () => {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    console.log('Checking WebRTC compatibility')
    const checkWebRTCCompatibility = () => {
      try {
        if (WEBRTC_SUPPORT) throw new Error('WebRTC no es compatible')

        const peer = new RTCPeerConnection()
        peer.close() // close the peer connection

        // Redirect to home page if not already there and WebRTC is supported
        if (pathname === '/not-supported') router.push('/')
      } catch (error) {
        // Redirect to not-supported page if not already there
        if (pathname !== '/not-supported') router.push('/not-supported')
      }
    }

    checkWebRTCCompatibility()
  }, [pathname, router]) // Execute only when pathname or router changes

  return null
}

export default CompatibilityChecker
