
const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Campaign routes
router.get('/', async (req, res) => {
  // Logic for retrieving campaigns
});

router.post('/', async (req, res) => {
  // Logic for creating campaigns
});

module.exports = router;


module.exports = router;
