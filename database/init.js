const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'incidents.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

/**
 * Initialize the database and create tables if they don't exist
 */
function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
    });

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wolt_id TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        screenshot_path TEXT,
        report_date TEXT NOT NULL,
        worker_name TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.run(createTableSQL, (err) => {
      if (err) {
        console.error('Error creating table:', err);
        reject(err);
        return;
      }
      console.log('Database table initialized');
      resolve(db);
    });
  });
}

/**
 * Get database instance
 */
function getDatabase() {
  return new sqlite3.Database(dbPath);
}

module.exports = {
  initDatabase,
  getDatabase
};

