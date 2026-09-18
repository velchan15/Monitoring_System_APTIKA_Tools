const express = require('express');
const router = express.Router();
const { 
  getIncidents, 
  getIncidentById, 
  createIncident, 
  updateIncidentStatus 
} = require('../controllers/incidentController');
const { authenticateToken } = require('../middlewares/auth');

// Hapus authenticateToken-nya dulu buat testing
router.get('/', getIncidents);
router.get('/:id', getIncidentById);
router.post('/', createIncident);
router.put('/:id/status', updateIncidentStatus);

module.exports = router;