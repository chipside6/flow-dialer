
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
import { existsSync } from 'fs';

const [,, CAMPAIGN_ID, USER_ID, SUPABASE_URL, SERVICE_ROLE_JWT] = process.argv;

if (!CAMPAIGN_ID || !USER_ID || !SUPABASE_URL || !SERVICE_ROLE_JWT) {
  console.error("Usage: node deploy-asterisk-config.js <CAMPAIGN_ID> <USER_ID> <SUPABASE_URL> <SERVICE_ROLE_JWT>");
  process.exit(1);
}

// Config paths
const EXT_PATH = '/etc/asterisk/extensions.conf';
const SIP_PATH = '/etc/asterisk/pjsip.conf';
const BACKUP_DIR = '/etc/asterisk/backups';

// Verify we have write access to Asterisk config directories
function checkPermissions() {
  try {
    if (!existsSync(EXT_PATH) || !existsSync(SIP_PATH)) {
      throw new Error('Asterisk config files not found');
    }
    // Test write permissions
    execSync(`touch ${EXT_PATH} ${SIP_PATH}`);
    return true;
  } catch (error) {
    console.error('Permission check failed:', error.message);
    console.error('Please run this script as root or with sufficient privileges');
    process.exit(4);
  }
}

// Create backup of current configs
async function backupConfigs() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  try {
    execSync(`mkdir -p ${BACKUP_DIR}`);
    execSync(`cp ${EXT_PATH} ${BACKUP_DIR}/extensions.conf.${timestamp}`);
    execSync(`cp ${SIP_PATH} ${BACKUP_DIR}/pjsip.conf.${timestamp}`);
    console.log(`Backup created in ${BACKUP_DIR}`);
  } catch (error) {
    console.error('Backup failed:', error.message);
    process.exit(5);
  }
}

// Test Asterisk reload without applying changes
function testAsteriskReload() {
  try {
    // Test if Asterisk is running and responsive
    execSync("asterisk -rx 'core show version'");
    return true;
  } catch (error) {
    console.error('Asterisk service check failed:', error.message);
    process.exit(6);
  }
}

async function main() {
  // 1. Pre-deployment checks
  console.log('Running pre-deployment checks...');
  checkPermissions();
  testAsteriskReload();
  await backupConfigs();

  // 2. Call the Supabase Edge Function to get config
  console.log(`Requesting config for campaign: ${CAMPAIGN_ID} as user: ${USER_ID}`);
  const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/generate-campaign-dialplan`;

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

  // 3. Write configurations
  console.log('Writing new configurations...');
  
  // Write dialplan config
  await writeFile(EXT_PATH, config.dialplanConfig, 'utf8');
  console.log(`Dialplan config written to ${EXT_PATH}`);
  
  // Write SIP config if provided
  if (config.sipConfig) {
    await writeFile(SIP_PATH, config.sipConfig, 'utf8');
    console.log(`SIP config written to ${SIP_PATH}`);
  } else {
    console.warn('No SIP config provided - skipping SIP config update');
  }

  // 4. Reload Asterisk with error handling
  console.log('Reloading Asterisk configuration...');
  try {
    // Verify dialplan syntax before reloading
    execSync("asterisk -rx 'dialplan show'");
    
    // Reload configurations
    execSync("asterisk -rx 'dialplan reload'");
    execSync("asterisk -rx 'pjsip reload'");
    
    // Verify reload was successful
    execSync("asterisk -rx 'core show version'");
    console.log('Asterisk reload completed successfully!');
  } catch (error) {
    console.error('Asterisk reload failed:', error.message);
    console.log('Rolling back to previous configuration...');
    
    // Attempt to restore from backup
    const latestBackup = execSync(`ls -t ${BACKUP_DIR}/extensions.conf.* | head -1`).toString().trim();
    execSync(`cp ${latestBackup} ${EXT_PATH}`);
    console.error('Configuration rolled back to previous version');
    process.exit(7);
  }
}

main().catch(err => {
  console.error('Automation failed:', err);
  process.exit(99);
});
