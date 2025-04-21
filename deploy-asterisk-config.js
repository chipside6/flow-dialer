
/**
 * Automation script to pull SIP & dialplan configs from your Supabase edge function
 * and write them to Asterisk config files. Then reloads Asterisk automatically.
 * 
 * Run as root or with sufficient privileges on your Asterisk server.
 * 
 * Dependencies: node-fetch@^3 (for ESM; use require('undici') if using CJS)
 * Usage: node deploy-asterisk-config.js <CAMPAIGN_ID> <USER_ID> <SUPABASE_URL> <SERVICE_ROLE_JWT>
 */

import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';
import { execSync } from 'child_process';

const [,, CAMPAIGN_ID, USER_ID, SUPABASE_URL, SERVICE_ROLE_JWT] = process.argv;

if (!CAMPAIGN_ID || !USER_ID || !SUPABASE_URL || !SERVICE_ROLE_JWT) {
  console.error("Usage: node deploy-asterisk-config.js <CAMPAIGN_ID> <USER_ID> <SUPABASE_URL> <SERVICE_ROLE_JWT>");
  process.exit(1);
}

// 1. Call the Supabase Edge Function to get config
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/generate-campaign-dialplan`;

async function main() {
  console.log(`Requesting config for campaign: ${CAMPAIGN_ID} as user: ${USER_ID}`);

  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ campaignId: CAMPAIGN_ID, userId: USER_ID })
  });
  if (!response.ok) {
    console.error('Failed to fetch config:', await response.text());
    process.exit(2);
  }
  const config = await response.json();

  if (!config.success) {
    console.error('Error from API:', config.error || config.message);
    process.exit(3);
  }

  // 2. Write to Asterisk config files
  const EXT_PATH = '/etc/asterisk/extensions.conf';
  const SIP_PATH = '/etc/asterisk/pjsip.conf';

  console.log(`Writing dialplan config to ${EXT_PATH}`);
  await writeFile(EXT_PATH, config.dialplanConfig, 'utf8');
  console.log(`Writing SIP config to ${SIP_PATH}`);
  // You will need the SIP config from elsewhere - this function may just provide dialplan
  // If it also provides SIP config (e.g. config.sipConfig), uncomment next line
  // await writeFile(SIP_PATH, config.sipConfig, 'utf8');

  // 3. Reload Asterisk
  console.log('Reloading Asterisk...');
  execSync("asterisk -rx 'dialplan reload'");
  execSync("asterisk -rx 'pjsip reload'");
  console.log('Asterisk reload complete!');
}

main().catch(err => {
  console.error('Automation failed:', err);
  process.exit(99);
});
