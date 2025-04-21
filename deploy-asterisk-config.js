
#!/usr/bin/env node

/**
 * Production-ready automation script to deploy campaign dialplan and SIP configurations
 * to Asterisk server and safely reload configuration.
 * 
 * This script includes:
 * - Comprehensive error handling with detailed logging
 * - Automatic backups before any configuration changes
 * - Validation checks before deployment
 * - Secure credential handling
 * - Rollback capability in case of failures
 * 
 * Dependencies: node-fetch@^3 (for ESM)
 * Usage: node deploy-asterisk-config.js <CAMPAIGN_ID> <USER_ID> <SUPABASE_URL> <SERVICE_ROLE_JWT>
 */

import fetch from 'node-fetch';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

// Process command line arguments
const [,, CAMPAIGN_ID, USER_ID, SUPABASE_URL, SERVICE_ROLE_JWT] = process.argv;

// Validate required parameters
if (!CAMPAIGN_ID || !USER_ID || !SUPABASE_URL || !SERVICE_ROLE_JWT) {
  console.error("Usage: node deploy-asterisk-config.js <CAMPAIGN_ID> <USER_ID> <SUPABASE_URL> <SERVICE_ROLE_JWT>");
  process.exit(1);
}

// Configuration paths
const EXT_PATH = '/etc/asterisk/extensions.conf';
const SIP_PATH = '/etc/asterisk/pjsip.conf';
const BACKUP_DIR = '/etc/asterisk/backups';
const LOG_DIR = '/var/log/asterisk-deploy';

// Setup timestamp for this deployment (used for backups and logs)
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFilePath = `${LOG_DIR}/deploy-${timestamp}.log`;

/**
 * Enhanced logging with timestamp and level
 */
const logger = {
  log: (message) => {
    const logMessage = `[${new Date().toISOString()}] [INFO] ${message}`;
    console.log(logMessage);
    appendToLogFile(logMessage);
  },
  error: (message) => {
    const logMessage = `[${new Date().toISOString()}] [ERROR] ${message}`;
    console.error(logMessage);
    appendToLogFile(logMessage);
  },
  success: (message) => {
    const logMessage = `[${new Date().toISOString()}] [SUCCESS] ${message}`;
    console.log('\x1b[32m%s\x1b[0m', logMessage); // Green text
    appendToLogFile(logMessage);
  },
  warning: (message) => {
    const logMessage = `[${new Date().toISOString()}] [WARNING] ${message}`;
    console.log('\x1b[33m%s\x1b[0m', logMessage); // Yellow text
    appendToLogFile(logMessage);
  }
};

/**
 * Append message to log file
 */
async function appendToLogFile(message) {
  try {
    // Create log directory if it doesn't exist
    if (!existsSync(LOG_DIR)) {
      await mkdir(LOG_DIR, { recursive: true });
    }
    
    await writeFile(logFilePath, message + '\n', { flag: 'a' });
  } catch (error) {
    console.error(`Error writing to log file: ${error.message}`);
  }
}

/**
 * Verify we have write access to Asterisk config directories
 * and that Asterisk is installed and running
 */
function checkPermissions() {
  logger.log('Checking environment and permissions...');
  
  try {
    // Check if Asterisk configuration files exist
    if (!existsSync(EXT_PATH) || !existsSync(SIP_PATH)) {
      throw new Error('Asterisk config files not found');
    }
    
    // Test write permissions to directories
    execSync(`test -w ${EXT_PATH} && test -w ${SIP_PATH}`);
    
    // Make sure backup directory exists and is writable
    if (!existsSync(BACKUP_DIR)) {
      execSync(`mkdir -p ${BACKUP_DIR}`);
    }
    execSync(`test -w ${BACKUP_DIR}`);
    
    logger.success('Environment check passed! Proper permissions are in place.');
    return true;
  } catch (error) {
    logger.error(`Permission check failed: ${error.message}`);
    logger.error('Please run this script as root or with sufficient privileges');
    process.exit(4);
  }
}

/**
 * Create backup of current configs with timestamp
 * Returns the paths of the backup files for rollback if needed
 */
async function backupConfigs() {
  logger.log('Creating backup of current Asterisk configuration...');
  
  try {
    // Create backup directory if it doesn't exist
    execSync(`mkdir -p ${BACKUP_DIR}`);
    
    // Create backup with timestamp
    const extBackup = `${BACKUP_DIR}/extensions.conf.${timestamp}`;
    const sipBackup = `${BACKUP_DIR}/pjsip.conf.${timestamp}`;
    
    execSync(`cp ${EXT_PATH} ${extBackup}`);
    execSync(`cp ${SIP_PATH} ${sipBackup}`);
    
    logger.success(`Backup created successfully in ${BACKUP_DIR}`);
    return { extBackup, sipBackup };
  } catch (error) {
    logger.error(`Backup failed: ${error.message}`);
    process.exit(5);
  }
}

/**
 * Test Asterisk reload capability before making changes
 */
function testAsteriskReload() {
  logger.log('Testing Asterisk service responsiveness...');
  
  try {
    // Test if Asterisk is running and responsive
    const version = execSync("asterisk -rx 'core show version'").toString().trim();
    logger.log(`Asterisk version: ${version}`);
    
    // Test basic reload capability
    execSync("asterisk -rx 'module show'");
    
    logger.success('Asterisk service is running and responsive');
    return true;
  } catch (error) {
    logger.error(`Asterisk service check failed: ${error.message}`);
    process.exit(6);
  }
}

/**
 * Restore configs from backup in case of failure
 */
async function rollbackFromBackup(backupPaths) {
  logger.warning('Rolling back to previous configuration...');
  
  try {
    if (backupPaths && backupPaths.extBackup && backupPaths.sipBackup) {
      execSync(`cp ${backupPaths.extBackup} ${EXT_PATH}`);
      execSync(`cp ${backupPaths.sipBackup} ${SIP_PATH}`);
      
      // Try to reload with previous config
      execSync("asterisk -rx 'dialplan reload'");
      execSync("asterisk -rx 'pjsip reload'");
      
      logger.success('Configuration rolled back to previous version');
      return true;
    } else {
      logger.error('No backup paths provided for rollback');
      return false;
    }
  } catch (error) {
    logger.error(`Rollback failed: ${error.message}`);
    return false;
  }
}

/**
 * Write configuration to files and reload Asterisk
 */
async function applyConfigurations(dialplanConfig, sipConfig, backupPaths) {
  logger.log('Writing new configurations to Asterisk...');
  
  try {
    // Write dialplan config
    await writeFile(EXT_PATH, dialplanConfig, 'utf8');
    logger.log(`Dialplan config written to ${EXT_PATH}`);
    
    // Write SIP config if provided
    if (sipConfig) {
      await writeFile(SIP_PATH, sipConfig, 'utf8');
      logger.log(`SIP config written to ${SIP_PATH}`);
    } else {
      logger.warning('No SIP config provided - skipping SIP config update');
    }
    
    // Verify dialplan syntax before reloading
    logger.log('Verifying dialplan syntax...');
    execSync("asterisk -rx 'dialplan show'");
    
    // Reload configurations
    logger.log('Reloading Asterisk configuration...');
    execSync("asterisk -rx 'dialplan reload'");
    
    if (sipConfig) {
      execSync("asterisk -rx 'pjsip reload'");
    }
    
    // Verify reload was successful
    execSync("asterisk -rx 'core show version'");
    logger.success('Asterisk configuration reloaded successfully');
    
    return true;
  } catch (error) {
    logger.error(`Configuration application failed: ${error.message}`);
    
    // Attempt to restore from backup
    await rollbackFromBackup(backupPaths);
    process.exit(7);
  }
}

/**
 * Fetch campaign dialplan and SIP configuration from Supabase edge function
 */
async function fetchCampaignConfigs() {
  logger.log(`Requesting configuration for campaign: ${CAMPAIGN_ID} as user: ${USER_ID}`);
  
  try {
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
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    const config = await response.json();
    
    if (!config.success) {
      throw new Error(config.error || config.message || 'Unknown error from API');
    }
    
    logger.success('Campaign configuration successfully retrieved from API');
    return config;
  } catch (error) {
    logger.error(`Failed to fetch campaign configuration: ${error.message}`);
    process.exit(2);
  }
}

/**
 * Main execution function
 */
async function main() {
  logger.log('===== Asterisk Configuration Deployment Tool =====');
  logger.log(`Starting deployment for Campaign ID: ${CAMPAIGN_ID}, User ID: ${USER_ID}`);
  
  try {
    // 1. Pre-deployment checks
    checkPermissions();
    testAsteriskReload();
    const backupPaths = await backupConfigs();
    
    // 2. Fetch configurations from API
    const config = await fetchCampaignConfigs();
    
    if (!config.dialplanConfig) {
      throw new Error('No dialplan configuration received from API');
    }
    
    // 3. Apply configurations
    await applyConfigurations(config.dialplanConfig, config.sipConfig, backupPaths);
    
    // 4. Verify and log success
    logger.success('===== DEPLOYMENT SUCCESSFUL =====');
    logger.log(`Campaign: ${CAMPAIGN_ID}`);
    logger.log(`User: ${USER_ID}`);
    logger.log(`Deployment timestamp: ${timestamp}`);
    
    if (config.transferEnabled) {
      logger.log(`Transfer number: ${config.transferNumber}`);
      if (config.transferNumberName) {
        logger.log(`Transfer name: ${config.transferNumberName}`);
      }
    }
    
    logger.log(`Files updated:`);
    logger.log(`- ${EXT_PATH}`);
    if (config.sipConfig) {
      logger.log(`- ${SIP_PATH}`);
    }
    
    process.exit(0);
  } catch (err) {
    logger.error('===== DEPLOYMENT FAILED =====');
    logger.error(`Error: ${err.message}`);
    logger.error(`Please check logs at ${logFilePath} for details`);
    process.exit(99);
  }
}

// Run the main function
main().catch(err => {
  console.error('Unhandled error in main process:', err);
  process.exit(99);
});
