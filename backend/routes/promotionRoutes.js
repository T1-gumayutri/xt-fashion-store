const router = require('express').Router();
const ctrl = require('../controllers/promotionController');

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.post('/validate', ctrl.validate);

module.exports = router;