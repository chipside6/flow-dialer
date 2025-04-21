
// Production configuration values

export const ASTERISK_CONFIG = {
  apiUrl: import.meta.env.VITE_ASTERISK_API_URL || '',
  username: import.meta.env.VITE_ASTERISK_API_USERNAME || '',
  password: import.meta.env.VITE_ASTERISK_API_PASSWORD || '',
  serverIp: import.meta.env.VITE_ASTERISK_SERVER_IP || ''
};

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  apiKey: import.meta.env.VITE_API_KEY || ''
};

export const GOIP_CONFIG = {
  portsPerUser: 4,
  maxCallsPerPort: 1
};
