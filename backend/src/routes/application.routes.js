const express = require('express');
const router = express.Router();
const { 
  getAllApplications, 
  createApplication, 
  updateApplication, 
  deleteApplication 
} = require('../controllers/application.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/rbac');

// Semua route dilindungi JWT
router.use(authenticateToken);

router.get('/', getAllApplications);
router.post('/', authorizeRoles(1), createApplication);        // Admin Only
router.put('/:id', authorizeRoles(1), updateApplication);     // Admin Only
router.delete('/:id', authorizeRoles(1), deleteApplication);  // Admin Only

module.exports = router;