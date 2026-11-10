const express = require('express');
const timelineController = require('../controllers/timelineController');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

router.get('/', timelineController.index);
router.post('/', requireAuth, timelineController.create);
router.post('/:id/eliminar', requireAuth, timelineController.destroy);

module.exports = router;
