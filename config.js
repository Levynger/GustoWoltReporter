// Configuration file
// In production, use environment variables for passwords

module.exports = {
  // Server configuration
  port: process.env.PORT || 3001,
  
  // Authentication passwords
  // Change these in production!
  workerPassword: process.env.WORKER_PASSWORD || 'alon',
  managerPassword: process.env.MANAGER_PASSWORD || 'levy',
  
  // Session configuration
  sessionSecret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  
  // File upload configuration
  uploadDir: './public/uploads',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  
  // Database path
  dbPath: './database/incidents.db'
};

