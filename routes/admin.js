const express = require('express');
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.use(requireAdmin);

router.get('/', adminController.index);
router.post('/usuarios/:id/password', adminController.resetPassword);
router.post('/usuarios/:id/eliminar', adminController.deleteUser);

module.exports = router;
