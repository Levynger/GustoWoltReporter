const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { requireManagerAuth, handleLogout } = require('../middleware/auth');

/**
 * GET /api/incidents
 * Get all incidents with optional filters
 * Query params: dateFrom, dateTo, category, status
 */
router.get('/incidents', requireManagerAuth, (req, res) => {
  const { dateFrom, dateTo, category, status } = req.query;
  
  const db = getDatabase();
  let query = 'SELECT * FROM incidents WHERE 1=1';
  const params = [];
  
  if (dateFrom) {
    query += ' AND report_date >= ?';
    params.push(dateFrom);
  }
  
  if (dateTo) {
    query += ' AND report_date <= ?';
    params.push(dateTo);
  }
  
  if (category && category !== 'all') {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching incidents:', err);
      return res.status(500).json({ error: 'Failed to fetch incidents' });
    }
    
    res.json(rows);
  });
});

/**
 * GET /api/incidents/:id
 * Get single incident by ID
 */
router.get('/incidents/:id', requireManagerAuth, (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  db.get('SELECT * FROM incidents WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching incident:', err);
      return res.status(500).json({ error: 'Failed to fetch incident' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    res.json(row);
  });
});

/**
 * POST /api/incidents
 * Create new incident (from worker form)
 */
router.post('/incidents', (req, res) => {
  const { wolt_id, category, description, report_date, worker_name, screenshot_path } = req.body;
  
  if (!wolt_id || !category || !report_date || !worker_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const db = getDatabase();
  const query = `
    INSERT INTO incidents (wolt_id, category, description, screenshot_path, report_date, worker_name)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [wolt_id, category, description || null, screenshot_path || null, report_date, worker_name], function(err) {
    if (err) {
      console.error('Error creating incident:', err);
      return res.status(500).json({ error: 'Failed to create incident' });
    }
    
    res.json({ 
      success: true, 
      id: this.lastID,
      message: 'Incident reported successfully' 
    });
  });
});

/**
 * PATCH /api/incidents/:id
 * Update incident status
 */
router.patch('/incidents/:id', requireManagerAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  
  const validStatuses = ['pending', 'resolved', 'dealt_with', 'escalation'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  const db = getDatabase();
  const query = 'UPDATE incidents SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  
  db.run(query, [status, id], function(err) {
    if (err) {
      console.error('Error updating incident:', err);
      return res.status(500).json({ error: 'Failed to update incident' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    res.json({ success: true, message: 'Incident updated successfully' });
  });
});

/**
 * POST /api/logout
 * Handle logout
 */
router.post('/logout', handleLogout);

module.exports = router;

