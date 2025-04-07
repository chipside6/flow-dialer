
const express = require('express');
const router = express.Router();
const columnUtils = require('./columnUtils');

// Column utilities
router.get('/column-exists/:table/:column', columnUtils.checkColumnExists);
router.get('/table-columns/:table', columnUtils.getTableColumns);

module.exports = router;
