const express = require('express');
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middlewares/auth');
const { avatarUpload } = require('../middlewares/upload');

const router = express.Router();

router.use(requireAuth);

router.get('/', profileController.show);
router.post('/avatar', avatarUpload.single('avatar'), profileController.updateAvatar);
router.post('/password', profileController.changePassword);

module.exports = router;
