const express = require('express');
const characterController = require('../controllers/characterController');
const { requireAuth } = require('../middlewares/auth');
const { characterUpload } = require('../middlewares/upload');

const router = express.Router();
const characterFormUpload = characterUpload.fields([
  { name: 'photos', maxCount: 12 },
  { name: 'bg_file', maxCount: 1 }
]);

router.get('/', characterController.index);
router.get('/nuevo', requireAuth, characterController.showCreate);
router.post('/', requireAuth, characterFormUpload, characterController.create);

router.get('/:id', characterController.show);
router.get('/:id/editar', requireAuth, characterController.showEdit);
router.post('/:id/editar', requireAuth, characterFormUpload, characterController.update);
router.post('/:id/eliminar', requireAuth, characterController.destroy);

router.post('/:id/relaciones', requireAuth, characterController.addRelation);
router.post('/:id/relaciones/:relationId/eliminar', requireAuth, characterController.removeRelation);

module.exports = router;
