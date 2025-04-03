
const express = require('express');
const router = express.Router();

// Import config generators
const { getUserConfig } = require('./userConfigGenerator');
const { getMasterConfig } = require('./masterConfigGenerator');
const { getCampaignConfig } = require('./campaignConfigGenerator');
const { setupCacheCleanup } = require('./cacheService');

// Routes
router.get('/asterisk-user/:userId', getUserConfig);
router.get('/asterisk-master', getMasterConfig);
router.get('/asterisk-campaign/:userId/:campaignId', getCampaignConfig);

// Set up the cache cleanup
setupCacheCleanup();

module.exports = router;
