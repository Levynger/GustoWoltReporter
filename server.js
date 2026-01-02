const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./config');
const { initDatabase } = require('./database/init');

// Import routes
const workerRoutes = require('./routes/worker');
const managerRoutes = require('./routes/manager');
const apiRoutes = require('./routes/api');

const app = express();

// Initialize database
initDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/worker', workerRoutes);
app.use('/manager', managerRoutes);
app.use('/api', apiRoutes);

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/worker');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.message && err.message.includes('file')) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Worker form: http://localhost:${PORT}/worker`);
  console.log(`Manager dashboard: http://localhost:${PORT}/manager`);
});

