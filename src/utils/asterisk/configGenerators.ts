
// Define interface for SIP configuration parameters
export interface SipConfigParams {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  transport?: string;
  dtmfMode?: string;
  context?: string;
  provider?: string;
}

// Define interface for dialplan configuration parameters
export interface DialplanConfigParams {
  context?: string;
  extension?: string;
  priority?: number;
  application?: string;
  data?: string;
  provider?: string;
}

/**
 * Generate a SIP configuration file based on provided parameters
 */
export const generateSipConfig = (params: SipConfigParams = {}): string => {
  const {
    host = 'sip.example.com',
    port = 5060,
    username = 'user',
    password = 'password',
    transport = 'udp',
    dtmfMode = 'rfc2833',
    context = 'default',
    provider = 'default'
  } = params;

  return `
[${provider}]
type=endpoint
context=${context}
disallow=all
allow=ulaw
transport=${transport}
auth=${provider}_auth
aors=${provider}_aor
direct_media=no
dtmf_mode=${dtmfMode}

[${provider}_auth]
type=auth
auth_type=userpass
username=${username}
password=${password}

[${provider}_aor]
type=aor
contact=sip:${username}@${host}:${port}
`;
};

/**
 * Generate a dialplan configuration file based on provided parameters
 */
export const generateDialplanConfig = (params: DialplanConfigParams = {}): string => {
  const {
    context = 'outbound',
    extension = '_X.',
    priority = 1,
    application = 'Dial',
    data = 'SIP/${EXTEN}@provider,30',
    provider = 'default'
  } = params;

  return `
[${context}]
exten => ${extension},${priority},${application}(${data})
same => n,Hangup()
`;
};

export const configGenerators = {
  generateSipConfig,
  generateDialplanConfig
};
