
/**
 * Utility for generating Asterisk configuration files
 */

/**
 * Generate SIP configuration for a GoIP device
 */
export const generateSipConfig = (
  username: string,
  password: string,
  host: string = '0.0.0.0',
  port: number = 5060
): string => {
  return `
[goip]
type=peer
host=${host}
port=${port}
username=${username}
secret=${password}
fromuser=${username}
context=autodialer
disallow=all
allow=ulaw
allow=alaw
dtmfmode=rfc2833
insecure=port,invite
nat=force_rport,comedia
qualify=yes
directmedia=no
rtp_timeout=30
transport=udp
`;
};

/**
 * Generate dialplan configuration for the autodialer with human detection and press-1 routing
 */
export const generateDialplan = (
  soundsPath: string = '/var/lib/asterisk/sounds/campaigns'
): string => {
  return `
[autodialer]
exten => s,1,NoOp(Autodialer call started)
exten => s,n,Answer()
exten => s,n,AMD()
exten => s,n,GotoIf($["${AMDSTATUS}" = "HUMAN"]?playmsg,1:hangup,1)

exten => playmsg,1,NoOp(Human detected, playing greeting)
exten => playmsg,n,Playback(\${GREETING_FILE})
exten => playmsg,n,Read(digit,1,5)
exten => playmsg,n,GotoIf($["${digit}" = "1"]?transfer,1:hangup,1)

exten => transfer,1,NoOp(Transferring call to \${TRANSFER_NUMBER})
exten => transfer,n,Set(TRANSFER_REQUESTED=1)
exten => transfer,n,Dial(SIP/\${TRANSFER_NUMBER},30,g)
exten => transfer,n,Hangup()

exten => hangup,1,NoOp(Call ended without transfer)
exten => hangup,n,Hangup()

; Handle AMD originated calls
exten => h,1,NoOp(Call hangup handler)
exten => h,n,Set(CDR(userfield)=\${USER_ID})
exten => h,n,Set(CDR(accountcode)=\${CAMPAIGN_ID})
exten => h,n,NoOp(Call status: \${DIALSTATUS})
exten => h,n,NoOp(AMD status: \${AMDSTATUS})
exten => h,n,NoOp(Transfer requested: \${TRANSFER_REQUESTED})
`;
};

/**
 * Generate Voicemail detection AGI script with human detection and press-1 routing
 */
export const generateAgiScript = (): string => {
  return `#!/usr/bin/env python3
import sys
import os
import re
import time
from asterisk.agi import *

agi = AGI()
agi.verbose("Autodialer AGI script started")

# Get variables passed from the dialplan
campaign_id = agi.get_variable('CAMPAIGN_ID')
user_id = agi.get_variable('USER_ID')
greeting_file = agi.get_variable('GREETING_FILE')
transfer_number = agi.get_variable('TRANSFER_NUMBER')

# Log call info
agi.verbose(f"Call info - Campaign: {campaign_id}, User: {user_id}, Greeting: {greeting_file}, Transfer: {transfer_number}")

# Wait for call to be answered
agi.verbose("Waiting for answer")
agi.wait_for_answer()

# Try to detect if this is a human or voicemail
agi.verbose("Detecting voicemail")
result = agi.exec_command('AMD')
amd_status = agi.get_variable('AMDSTATUS')
amd_cause = agi.get_variable('AMDCAUSE')

agi.verbose(f"AMD result: status={amd_status}, cause={amd_cause}")

# If voicemail is detected, hang up
if amd_status == 'MACHINE':
    agi.verbose("Voicemail detected, hanging up")
    agi.hangup()
    sys.exit(0)

# If human is detected, play greeting and wait for input
agi.verbose("Human detected, playing greeting")
if greeting_file:
    agi.stream_file(greeting_file)
else:
    agi.stream_file('beep')

# Wait for input
agi.verbose("Waiting for digit 1 to transfer")
result = agi.wait_for_digit(timeout=5000)  # 5 seconds

if result == 49:  # ASCII for "1"
    agi.verbose(f"User pressed 1, transferring to {transfer_number}")
    agi.set_variable('TRANSFER_REQUESTED', '1')
    agi.exec_command('Dial', f'SIP/{transfer_number},30,g')
else:
    agi.verbose("No input received or invalid input, hanging up")

agi.hangup()
sys.exit(0)
`;
};

/**
 * Generate complete Asterisk configuration package with human detection and press-1 routing
 */
export const generateAsteriskConfigs = (
  username: string,
  password: string,
  host: string = '0.0.0.0',
  port: number = 5060,
  soundsPath: string = '/var/lib/asterisk/sounds/campaigns'
): { 
  sipConfig: string;
  dialplanConfig: string;
  agiScript: string;
  installInstructions: string;
} => {
  return {
    sipConfig: generateSipConfig(username, password, host, port),
    dialplanConfig: generateDialplan(soundsPath),
    agiScript: generateAgiScript(),
    installInstructions: `
# Asterisk Autodialer Installation Instructions

## 1. Install Required Dependencies

\`\`\`bash
apt-get update
apt-get install -y asterisk python3 python3-pip
pip3 install asterisk-agi
\`\`\`

## 2. Configure Asterisk

### Create SIP Configuration
Save this to /etc/asterisk/sip_autodialer.conf:

\`\`\`
${generateSipConfig(username, password, host, port)}
\`\`\`

Then include it in your main sip.conf:

\`\`\`
#include "sip_autodialer.conf"
\`\`\`

### Create Dialplan Configuration
Save this to /etc/asterisk/extensions_autodialer.conf:

\`\`\`
${generateDialplan(soundsPath)}
\`\`\`

Then include it in your main extensions.conf:

\`\`\`
#include "extensions_autodialer.conf"
\`\`\`

### Create the AGI Script
Save this to /var/lib/asterisk/agi-bin/autodialer.agi:

\`\`\`python
${generateAgiScript()}
\`\`\`

Make it executable:

\`\`\`bash
chmod +x /var/lib/asterisk/agi-bin/autodialer.agi
\`\`\`

### Create Sounds Directory
Create a directory for campaign audio files:

\`\`\`bash
mkdir -p ${soundsPath}
chown -R asterisk:asterisk ${soundsPath}
\`\`\`

## 3. Setting up Automatic Machine Detection (AMD)

Ensure AMD is properly configured in Asterisk:

\`\`\`bash
echo '[amd]
initial_silence = 2500
greeting = 1500
after_greeting_silence = 800
total_analysis_time = 5000
min_word_length = 100
between_words_silence = 50
maximum_number_of_words = 3
silence_threshold = 256' > /etc/asterisk/amd.conf
\`\`\`

## 4. Reload Asterisk Configuration

\`\`\`bash
asterisk -rx "module reload app_amd.so"
asterisk -rx "sip reload"
asterisk -rx "dialplan reload"
\`\`\`

## 5. Test the Setup

Make a test call using the Asterisk CLI:

\`\`\`bash
asterisk -rx "channel originate SIP/goip/15551234567 application AGI autodialer.agi,test.wav,15551234567,test,test"
\`\`\`

## 6. Troubleshooting

Check Asterisk logs:

\`\`\`bash
tail -f /var/log/asterisk/full
\`\`\`

Test SIP connectivity:

\`\`\`bash
asterisk -rx "sip show peers"
\`\`\`
`
  };
};
