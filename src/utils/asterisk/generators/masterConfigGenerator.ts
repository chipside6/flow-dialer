
import { sipConfigGenerator } from './sipConfigGenerator';

/**
 * Generates a complete Asterisk master configuration for the campaign system
 */
export const masterConfigGenerator = {
  /**
   * Generate the master configuration for Asterisk
   */
  generateMasterConfig: (): string => {
    // Generate a sample configuration for demonstration
    return `
; Asterisk Campaign System Master Configuration
; Generated on ${new Date().toISOString()}
; THIS IS AUTOMATICALLY GENERATED - DO NOT EDIT MANUALLY

[general]
; Global configurations
static=yes
writeprotect=no
clearglobalvars=no
priorityjumping=no
autofallthrough=yes

; ----------------------------------------
; Global Routing Contexts
; ----------------------------------------

[globals]
MAX_RETRIES=3
DIAL_TIMEOUT=30
TRANSFER_TIMEOUT=45

; ----------------------------------------
; Campaign Dialplan
; ----------------------------------------

[campaign-autodialer]
; Main entry point for campaign calls
exten => s,1,NoOp(Campaign autodialer call handler)
 same => n,Answer()
 same => n,Set(GROUP(\${GROUP_NAME})=\${CHANNEL})
 same => n,GotoIf($[\${GROUP_COUNT(\${GROUP_NAME})} > \${GROUP_LIMIT}]?port_busy)
 same => n,Set(CDR(userfield)=\${USER_ID})
 same => n,Set(CDR(accountcode)=\${CAMPAIGN_ID})
 same => n,AMD()
 same => n,GotoIf($["\${AMDSTATUS}" = "HUMAN"]?human:machine)
 same => n(human),NoOp(Human detected)
 same => n,Playback(\${GREETING_FILE})
 same => n,WaitExten(5)
 same => n,Hangup()
 same => n(machine),NoOp(Machine detected)
 same => n,Hangup()
 same => n(port_busy),NoOp(Port is busy, call limit reached)
 same => n,Busy(5)
 same => n,Hangup()

; Handle DTMF input 1 for transfer
exten => 1,1,NoOp(Transfer requested)
 same => n,Set(CALL_TRANSFERRED=1)
 same => n,Set(CDR(disposition)=TRANSFERRED)
 same => n,Dial(SIP/\${TRANSFER_NUMBER},\${TRANSFER_TIMEOUT})
 same => n,Hangup()

; ----------------------------------------
; GoIP Device Handling
; ----------------------------------------

[from-goip]
; Entry point for incoming GoIP calls
exten => _X.,1,NoOp(Incoming call from GoIP)
 same => n,Set(GROUP(\${CHANNEL})=in-call)
 same => n,Answer()
 same => n,Playback(hello-world)
 same => n,Hangup()

; ----------------------------------------
; Port Management
; ----------------------------------------

[port-manager]
; Used for checking port status
exten => check,1,NoOp(Checking port status)
 same => n,Return(\${GROUP_COUNT(\${PORT_GROUP})})

; ----------------------------------------
; AMI Configuration
; ----------------------------------------

; Add to manager.conf
;
; [dialer_api]
; secret = securePassword123
; deny=0.0.0.0/0.0.0.0
; permit=127.0.0.1/255.255.255.255
; read = system,call,log,verbose,command,agent,user,config,dtmf,reporting,cdr,dialplan,originate
; write = system,call,log,verbose,command,agent,user,config,dtmf,reporting,cdr,dialplan,originate
;

; ----------------------------------------
; PJSIP Configuration Template
; ----------------------------------------

; Add to pjsip.conf
;
; [goip-endpoint](!)
; type=endpoint
; context=from-goip
; disallow=all
; allow=ulaw,alaw
; transport=transport-udp
; direct_media=no
; force_rport=yes
; rewrite_contact=yes
; ice_support=no
; dtmf_mode=rfc4733
; max_audio_streams=1
; max_contacts=1
; device_state_busy_at=1
; rtp_timeout=30
;
; [goip-auth](!)
; type=auth
; auth_type=userpass
;
; [goip-aor](!)
; type=aor
; max_contacts=1
; qualify_frequency=30
; maximum_expiration=3600
; minimum_expiration=60
; default_expiration=120
; remove_existing=yes
;
; [goip-identify](!)
; type=identify
;

; ----------------------------------------
; Concurrency Control with GROUP
; ----------------------------------------

; The campaign-autodialer context uses GROUP() and GROUP_COUNT() functions
; to limit each port to a single concurrent call.
;
; Each port has its own GROUP name: port_[user_id]_[port_number]
; Each channel is added to this group when the call starts
; Before dialing, we check: GROUP_COUNT(group_name) <= 1
;
; This ensures only one call can use a particular port at any time

; ----------------------------------------
; Multiple Port Configuration Example
; ----------------------------------------

; Automatic port registration:
;${sipConfigGenerator.generateGoipPortConfig('example_user', 1)}
;
;${sipConfigGenerator.generateGoipPortConfig('example_user', 2)}
;
;${sipConfigGenerator.generateCampaignDialplan('example_campaign', 'example_user', 2)}
`;
  }
};
