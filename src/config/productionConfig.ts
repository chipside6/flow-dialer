
// Production configuration values

export const ASTERISK_CONFIG = {
  apiUrl: import.meta.env.VITE_ASTERISK_API_URL || `http://192.168.0.197:8088`,
  username: import.meta.env.VITE_ASTERISK_API_USERNAME || 'admin',
  password: import.meta.env.VITE_ASTERISK_API_PASSWORD || 'password',
  serverIp: import.meta.env.VITE_ASTERISK_SERVER_IP || '192.168.0.197'
};

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  apiKey: import.meta.env.VITE_API_KEY || ''
};

export const GOIP_CONFIG = {
  portsPerUser: 4,
  maxCallsPerPort: 1
};
