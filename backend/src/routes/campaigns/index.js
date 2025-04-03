
const express = require('express');
const router = express.Router();

// Import controllers
const campaignController = require('./campaignController');
const campaignStatsController = require('./campaignStatsController');
const campaignConfigController = require('./campaignConfigController');

// CRUD Routes
router.get('/', campaignController.getAllCampaigns);
router.post('/', campaignController.createCampaign);

// Stats Routes
router.get('/call-count/:userId', campaignStatsController.getCampaignCallCount);

// Configuration Routes
router.get('/asterisk-config/:campaignId', campaignConfigController.generateAsteriskConfig);

module.exports = router;
