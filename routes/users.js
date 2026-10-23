const express = require('express');
const profileController = require('../controllers/profileController');

const router = express.Router();

router.get('/', profileController.listPublic);
router.get('/:username', profileController.publicShow);

module.exports = router;
