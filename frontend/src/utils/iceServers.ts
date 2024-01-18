export const getIceServers = () => {
  switch (process.env.NEXT_PUBLIC_ICESERVER || 'local') {
    case 'local':
      return []
    case 'metered':
      return [
        {
          urls: 'stun:stun.relay.metered.ca:80',
        },
        {
          urls: 'turn:standard.relay.metered.ca:80',
          username: '15699d5ca0bd7792ecb2978e',
          credential: '35dZCNXjieQtQbR+',
        },
        {
          urls: 'turn:standard.relay.metered.ca:80?transport=tcp',
          username: '15699d5ca0bd7792ecb2978e',
          credential: '35dZCNXjieQtQbR+',
        },
        {
          urls: 'turn:standard.relay.metered.ca:443',
          username: '15699d5ca0bd7792ecb2978e',
          credential: '35dZCNXjieQtQbR+',
        },
        {
          urls: 'turns:standard.relay.metered.ca:443?transport=tcp',
          username: '15699d5ca0bd7792ecb2978e',
          credential: '35dZCNXjieQtQbR+',
        },
      ]
  }
}
