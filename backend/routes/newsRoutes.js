const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/newsController');

router.get('/', ctrl.getAllNews);
router.get('/:id', ctrl.getNewsById);
router.post('/', ctrl.createNews);
router.put('/:id', ctrl.updateNews);
router.delete('/:id', ctrl.deleteNews);

module.exports = router;