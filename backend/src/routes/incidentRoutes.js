const express = require('express');
const router = express.Router();
const { 
  getIncidents, 
  getIncidentById, 
  createIncident, 
  updateIncidentStatus 
} = require('../controllers/incidentController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, getIncidents);
router.get('/:id', authenticateToken, getIncidentById);
router.post('/', authenticateToken, createIncident);
router.put('/:id/status', authenticateToken, updateIncidentStatus);

module.exports = router;