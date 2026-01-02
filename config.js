// Configuration file
// In production, use environment variables for passwords

module.exports = {
  // Server configuration
  port: process.env.PORT || 3001,
  
  // Authentication passwords
  // Change these in production!
  workerPassword: process.env.WORKER_PASSWORD || 'alon123',
  managerPassword: process.env.MANAGER_PASSWORD || 'levy123',
  
  // Session configuration
  sessionSecret: process.env.SESSION_SECRET || 'a7f3d9e2b8c1f4a6d9e3b7c2f5a8d1e4b9c3f6a7d2e5b8c1f4a9d3e6b7c2f5a8',
  
  // File upload configuration
  uploadDir: './public/uploads',
  maxFileSize: 8 * 1024 * 1024, // 8MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  
  // Database path
  dbPath: './database/incidents.db'
};

