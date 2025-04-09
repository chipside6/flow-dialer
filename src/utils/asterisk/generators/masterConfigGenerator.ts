
/**
 * Generates the master Asterisk configuration for the autodialer system
 */
export const masterConfigGenerator = {
  generateMasterConfig: () => {
    return `
# ======================================================================
# Asterisk AutoDialer Master Configuration
# ======================================================================
# This file contains the complete configuration for setting up your
# Asterisk server to work with the autodialer system.
# 
# Installation Instructions:
# 1. Copy this file to your Asterisk server
# 2. From the directory containing this file, run:
#    sudo bash ./install-autodialer.sh
#
# ======================================================================

# ---- SIP Configuration (/etc/asterisk/sip.conf) ----

[general]
context=default
allowguest=no
allowoverlap=no
bindport=5060
bindaddr=0.0.0.0
srvlookup=no
disallow=all
allow=ulaw
allow=alaw
alwaysauthreject=yes
useragent=Asterisk AutoDialer
directmedia=no
nat=force_rport,comedia
session-timers=refuse
videosupport=no

# GoIP Device Configuration
# Replace with your GoIP device settings
[goip_trunk]
type=peer
host=dynamic
context=from-goip
disallow=all
allow=ulaw
allow=alaw
dtmfmode=rfc2833
insecure=port,invite
nat=force_rport,comedia
qualify=yes
directmedia=no

# ---- Extensions Configuration (/etc/asterisk/extensions.conf) ----

[from-goip]
exten => _X.,1,NoOp(Incoming call from GoIP device)
exten => _X.,n,Set(CALLERID(name)=\${CALLERID(num)})
exten => _X.,n,Goto(autodialer,s,1)

[autodialer]
exten => s,1,NoOp(Autodialer call started)
exten => s,n,Answer()
exten => s,n,Wait(1)
exten => s,n,Set(TIMEOUT(digit)=5)
exten => s,n,Set(TIMEOUT(response)=10)
exten => s,n,AGI(autodialer.agi)
exten => s,n,Hangup()

; Handle key press 1 for transfer
exten => 1,1,NoOp(Transferring call)
exten => 1,n,Set(TRANSFER_REQUESTED=1)
exten => 1,n,Dial(\${TRANSFER_NUMBER},30,g)
exten => 1,n,Hangup()

; Handle hangup
exten => h,1,NoOp(Call ended)
exten => h,n,System(curl -s "\${API_URL}/call_ended?call_id=\${CALL_ID}&status=\${DIALSTATUS}&duration=\${ANSWEREDTIME}")

# ---- USER CAMPAIGN ROUTER CONTEXT ----
# This context is needed for dynamic campaign routing
[user-campaign-router]
; This context handles fetching configuration for any user/campaign with efficient caching
exten => _X.,1,NoOp(Fetching configuration for: \${EXTEN})
exten => _X.,n,Set(USER_ID=\${CUT(EXTEN,_,1)})
exten => _X.,n,Set(CAMPAIGN_ID=\${CUT(EXTEN,_,2)})
exten => _X.,n,Set(CACHE_FILE=/tmp/campaign-config-\${USER_ID}-\${CAMPAIGN_ID}.conf)
exten => _X.,n,Set(CACHE_TIME=/tmp/campaign-config-\${USER_ID}-\${CAMPAIGN_ID}.time)
exten => _X.,n,TrySystem(test -f \${CACHE_FILE})
exten => _X.,n,GotoIf($[$\{SYSTEMSTATUS\} = SUCCESS]?cache_check:fetch_new)
exten => _X.,n(cache_check),TrySystem(find \${CACHE_FILE} -mmin -60 | grep -q \${CACHE_FILE})
exten => _X.,n,GotoIf($[$\{SYSTEMSTATUS\} = SUCCESS]?use_cache:fetch_new)
exten => _X.,n(use_cache),NoOp(Using cached configuration)
exten => _X.,n,Goto(campaign-\${CAMPAIGN_ID},s,1)
exten => _X.,n(fetch_new),NoOp(Fetching fresh configuration)
exten => _X.,n,System(curl -s "\${API_URL}/configs/asterisk-campaign/\${USER_ID}/\${CAMPAIGN_ID}?token=\${API_TOKEN}" > \${CACHE_FILE})
exten => _X.,n,System(date +%s > \${CACHE_TIME})
exten => _X.,n,System(asterisk -rx "dialplan reload")
exten => _X.,n,NoOp(Configuration loaded for user \${USER_ID}, campaign \${CAMPAIGN_ID})
exten => _X.,n,Goto(campaign-\${CAMPAIGN_ID},s,1)

# ---- AGI Script (/var/lib/asterisk/agi-bin/autodialer.agi) ----

#!/usr/bin/env python3
import sys
import os
import requests
from asterisk.agi import AGI

# Initialize AGI
agi = AGI()
agi.verbose("Autodialer AGI script started")

# Get campaign ID from arguments or channel variables
campaign_id = agi.get_variable("CAMPAIGN_ID") or "unknown"
user_id = agi.get_variable("USER_ID") or "unknown"
transfer_number = agi.get_variable("TRANSFER_NUMBER") or "0"
greeting_file = agi.get_variable("GREETING_FILE") or "greeting"

# Log call start
agi.verbose(f"Processing call for campaign {campaign_id} and user {user_id}")

# Play greeting
agi.verbose(f"Playing greeting: {greeting_file}")
agi.appexec("Playback", greeting_file)

# Wait for digit
agi.verbose("Waiting for digit press")
result = agi.get_data("beep", 10000, 1)

# Check if user pressed 1
if result == "1":
    agi.verbose("User pressed 1, transferring")
    agi.set_variable("TRANSFER_REQUESTED", "1")
    agi.set_variable("TRANSFER_NUMBER", transfer_number)
    agi.appexec("Goto", "autodialer,1,1")
else:
    agi.verbose("No digit received or not 1, hanging up")

agi.verbose("AGI script completed")
sys.exit(0)

# ---- Installation Script (install-autodialer.sh) ----

#!/bin/bash
echo "Installing Asterisk AutoDialer Configuration"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
apt update
apt install -y asterisk asterisk-modules asterisk-core-sounds-en python3 python3-pip
pip3 install asterisk-agi requests

# Create configuration files
echo "Creating configuration files..."

# Extract SIP configuration
cat > /etc/asterisk/sip_autodialer.conf << 'EOF'
[general]
context=default
allowguest=no
allowoverlap=no
bindport=5060
bindaddr=0.0.0.0
srvlookup=no
disallow=all
allow=ulaw
allow=alaw
alwaysauthreject=yes
useragent=Asterisk AutoDialer
directmedia=no
nat=force_rport,comedia
session-timers=refuse
videosupport=no

# GoIP Device Configuration
[goip_trunk]
type=peer
host=dynamic
context=from-goip
disallow=all
allow=ulaw
allow=alaw
dtmfmode=rfc2833
insecure=port,invite
nat=force_rport,comedia
qualify=yes
directmedia=no
EOF

# Extract Extensions configuration
cat > /etc/asterisk/extensions_autodialer.conf << 'EOF'
[from-goip]
exten => _X.,1,NoOp(Incoming call from GoIP device)
exten => _X.,n,Set(CALLERID(name)=\${CALLERID(num)})
exten => _X.,n,Goto(autodialer,s,1)

[autodialer]
exten => s,1,NoOp(Autodialer call started)
exten => s,n,Answer()
exten => s,n,Wait(1)
exten => s,n,Set(TIMEOUT(digit)=5)
exten => s,n,Set(TIMEOUT(response)=10)
exten => s,n,AGI(autodialer.agi)
exten => s,n,Hangup()

; Handle key press 1 for transfer
exten => 1,1,NoOp(Transferring call)
exten => 1,n,Set(TRANSFER_REQUESTED=1)
exten => 1,n,Dial(\${TRANSFER_NUMBER},30,g)
exten => 1,n,Hangup()

; Handle hangup
exten => h,1,NoOp(Call ended)
exten => h,n,System(curl -s "\${API_URL}/call_ended?call_id=\${CALL_ID}&status=\${DIALSTATUS}&duration=\${ANSWEREDTIME}")

[user-campaign-router]
; This context handles fetching configuration for any user/campaign with efficient caching
exten => _X.,1,NoOp(Fetching configuration for: \${EXTEN})
exten => _X.,n,Set(USER_ID=\${CUT(EXTEN,_,1)})
exten => _X.,n,Set(CAMPAIGN_ID=\${CUT(EXTEN,_,2)})
exten => _X.,n,Set(CACHE_FILE=/tmp/campaign-config-\${USER_ID}-\${CAMPAIGN_ID}.conf)
exten => _X.,n,Set(CACHE_TIME=/tmp/campaign-config-\${USER_ID}-\${CAMPAIGN_ID}.time)
exten => _X.,n,TrySystem(test -f \${CACHE_FILE})
exten => _X.,n,GotoIf($[$\{SYSTEMSTATUS\} = SUCCESS]?cache_check:fetch_new)
exten => _X.,n(cache_check),TrySystem(find \${CACHE_FILE} -mmin -60 | grep -q \${CACHE_FILE})
exten => _X.,n,GotoIf($[$\{SYSTEMSTATUS\} = SUCCESS]?use_cache:fetch_new)
exten => _X.,n(use_cache),NoOp(Using cached configuration)
exten => _X.,n,Goto(campaign-\${CAMPAIGN_ID},s,1)
exten => _X.,n(fetch_new),NoOp(Fetching fresh configuration)
exten => _X.,n,System(curl -s "\${API_URL}/configs/asterisk-campaign/\${USER_ID}/\${CAMPAIGN_ID}?token=\${API_TOKEN}" > \${CACHE_FILE})
exten => _X.,n,System(date +%s > \${CACHE_TIME})
exten => _X.,n,System(asterisk -rx "dialplan reload")
exten => _X.,n,NoOp(Configuration loaded for user \${USER_ID}, campaign \${CAMPAIGN_ID})
exten => _X.,n,Goto(campaign-\${CAMPAIGN_ID},s,1)
EOF

# Create AGI directory if it doesn't exist
mkdir -p /var/lib/asterisk/agi-bin

# Extract AGI script
cat > /var/lib/asterisk/agi-bin/autodialer.agi << 'EOF'
#!/usr/bin/env python3
import sys
import os
import requests
from asterisk.agi import AGI

# Initialize AGI
agi = AGI()
agi.verbose("Autodialer AGI script started")

# Get campaign ID from arguments or channel variables
campaign_id = agi.get_variable("CAMPAIGN_ID") or "unknown"
user_id = agi.get_variable("USER_ID") or "unknown"
transfer_number = agi.get_variable("TRANSFER_NUMBER") or "0"
greeting_file = agi.get_variable("GREETING_FILE") or "greeting"

# Log call start
agi.verbose(f"Processing call for campaign {campaign_id} and user {user_id}")

# Play greeting
agi.verbose(f"Playing greeting: {greeting_file}")
agi.appexec("Playback", greeting_file)

# Wait for digit
agi.verbose("Waiting for digit press")
result = agi.get_data("beep", 10000, 1)

# Check if user pressed 1
if result == "1":
    agi.verbose("User pressed 1, transferring")
    agi.set_variable("TRANSFER_REQUESTED", "1")
    agi.set_variable("TRANSFER_NUMBER", transfer_number)
    agi.appexec("Goto", "autodialer,1,1")
else:
    agi.verbose("No digit received or not 1, hanging up")

agi.verbose("AGI script completed")
sys.exit(0)
EOF

# Make AGI script executable
chmod +x /var/lib/asterisk/agi-bin/autodialer.agi

# Update main configuration files to include our configuration
if ! grep -q "#include \"sip_autodialer.conf\"" /etc/asterisk/sip.conf; then
  echo "#include \"sip_autodialer.conf\"" >> /etc/asterisk/sip.conf
fi

if ! grep -q "#include \"extensions_autodialer.conf\"" /etc/asterisk/extensions.conf; then
  echo "#include \"extensions_autodialer.conf\"" >> /etc/asterisk/extensions.conf
fi

# Restart Asterisk
echo "Restarting Asterisk..."
systemctl restart asterisk

# Reload Asterisk configuration
echo "Reloading Asterisk configuration..."
asterisk -rx "module reload"
asterisk -rx "sip reload"
asterisk -rx "dialplan reload"

echo "Installation complete!"
echo "Your Asterisk server is now configured for the autodialer system."
echo "Check the status with: systemctl status asterisk"
echo "View SIP peers with: asterisk -rx \"sip show peers\""
`;
  },
  
  generateSipConfig: (userId: string, portNumber: number, password: string) => {
    return `
[goip_${userId}_port${portNumber}]
type=peer
host=dynamic
port=5060
username=goip_${userId}_port${portNumber}
secret=${password}
fromuser=goip_${userId}_port${portNumber}
context=from-goip
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
  }
};
