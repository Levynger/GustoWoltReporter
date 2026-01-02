const express = require('express');
const router = express.Router();
const path = require('path');
const { requireManagerAuth, handleManagerLogin } = require('../middleware/auth');

/**
 * GET /manager/login
 * Show manager login page
 */
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
});

/**
 * POST /manager/login
 * Handle manager login
 */
router.post('/login', handleManagerLogin);

/**
 * GET /manager
 * Show manager dashboard (protected)
 */
router.get('/', requireManagerAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'manager-dashboard.html'));
});

module.exports = router;

