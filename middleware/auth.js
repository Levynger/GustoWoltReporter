const config = require('../config');

/**
 * Middleware to check if user is authenticated as worker
 */
function requireWorkerAuth(req, res, next) {
  if (req.session && req.session.workerAuthenticated) {
    return next();
  }
  res.redirect('/worker/login');
}

/**
 * Middleware to check if user is authenticated as manager
 */
function requireManagerAuth(req, res, next) {
  if (req.session && req.session.managerAuthenticated) {
    return next();
  }
  res.redirect('/manager/login');
}

/**
 * Handle worker login
 */
function handleWorkerLogin(req, res) {
  const { password } = req.body;
  
  if (password === config.workerPassword) {
    req.session.workerAuthenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
}

/**
 * Handle manager login
 */
function handleManagerLogin(req, res) {
  const { password } = req.body;
  
  if (password === config.managerPassword) {
    req.session.managerAuthenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
}

/**
 * Handle logout
 */
function handleLogout(req, res) {
  const { type } = req.body;
  
  if (type === 'worker') {
    req.session.workerAuthenticated = false;
  } else if (type === 'manager') {
    req.session.managerAuthenticated = false;
  }
  
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error logging out' });
    }
    res.json({ success: true });
  });
}

module.exports = {
  requireWorkerAuth,
  requireManagerAuth,
  handleWorkerLogin,
  handleManagerLogin,
  handleLogout
};

