const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// SIP provider routes
router.get('/', async (req, res) => {
  // Logic for getting SIP providers
});

router.post('/', async (req, res) => {
  // Logic for adding SIP provider
});

module.exports = router;

