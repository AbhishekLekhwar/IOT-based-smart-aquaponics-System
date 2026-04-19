const express = require('express');
const router = express.Router();
const { exportCSV, exportJSON } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

router.get('/csv', protect, exportCSV);
router.get('/json', protect, exportJSON);

module.exports = router;
