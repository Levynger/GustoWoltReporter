const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const { requireWorkerAuth, handleWorkerLogin } = require('../middleware/auth');
const { getDatabase } = require('../database/init');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', config.uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'screenshot-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (config.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter: fileFilter
});

/**
 * GET /worker/login
 * Show worker login page
 */
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
});

/**
 * POST /worker/login
 * Handle worker login
 */
router.post('/login', handleWorkerLogin);

/**
 * GET /worker
 * Show worker form (protected)
 */
router.get('/', requireWorkerAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'worker-form.html'));
});

/**
 * POST /worker/submit
 * Handle incident submission (protected)
 */
router.post('/submit', requireWorkerAuth, upload.single('screenshot'), async (req, res) => {
  try {
    const { wolt_id, wolt_delivery_id, category, description, report_date, worker_name, amount } = req.body;
    
    // Validation
    if (!wolt_id || !wolt_delivery_id || !category || !report_date || !worker_name) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Validate amount for specific categories
    if ((category === 'remake_approved' || category === 'refund_promised') && (!amount || amount <= 0)) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false, 
        message: 'סכום נדרש לסוג תקלה זה' 
      });
    }
    
    // Store worker name in cookie for future use
    res.cookie('worker_name', worker_name, { 
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      httpOnly: false // Allow client-side access
    });
    
    // Get screenshot path if uploaded
    const screenshot_path = req.file ? `/uploads/${req.file.filename}` : null;
    
    // Create incident directly in database
    const db = getDatabase();
    const query = `
      INSERT INTO incidents (wolt_id, wolt_delivery_id, category, description, screenshot_path, report_date, worker_name, amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const amountValue = (category === 'remake_approved' || category === 'refund_promised') ? parseFloat(amount) : null;
    
    console.log('Inserting incident:', { wolt_id, wolt_delivery_id, category, report_date, worker_name, amount: amountValue });
    
    db.run(query, [wolt_id, wolt_delivery_id, category, description || null, screenshot_path || null, report_date, worker_name, amountValue], function(err) {
      if (err) {
        console.error('Error creating incident:', err);
        // Clean up uploaded file if database insert fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ 
          success: false, 
          message: 'Error submitting incident. Please try again.' 
        });
      }
      
      console.log(`Incident created successfully with ID: ${this.lastID}`);
      res.json({ 
        success: true, 
        message: 'Incident reported successfully!' 
      });
    });
  } catch (error) {
    console.error('Error submitting incident:', error);
    // Clean up uploaded file if error occurs
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting incident. Please try again.' 
    });
  }
});

module.exports = router;

