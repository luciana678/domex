export const getIceServers = () => {
  switch (process.env.ICESERVER || 'local') {
    case 'local':
      return []
    case 'metered':
      return [
        {
          urls: 'stun:global.stun.twilio.com:3478',
        },
        {
          urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
          credential: 'webrtc',
          username: 'webrtc',
        },
        {
          urls: 'turn:192.158.29.39:3478?transport=udp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808',
        },
        {
          username: 'dc2d2894d5a9023620c467b0e71cfa6a35457e6679785ed6ae9856fe5bdfa269',
          credential: 'tE2DajzSJwnsSbc123',
          urls: 'turn:global.turn.twilio.com:3478?transport=tcp',
        },
        {
          username: 'dc2d2894d5a9023620c467b0e71cfa6a35457e6679785ed6ae9856fe5bdfa269',
          credential: 'tE2DajzSJwnsSbc123',
          urls: 'turn:global.turn.twilio.com:3478?transport=udp',
        },
        {
          username: 'dc2d2894d5a9023620c467b0e71cfa6a35457e6679785ed6ae9856fe5bdfa269',
          credential: 'tE2DajzSJwnsSbc123',
          urls: 'turn:global.turn.twilio.com:443?transport=tcp',
        },
      ]
  }
}
