const express = require('express');
const router = express.Router();
const categoryCtrl = require('../controllers/categoryController');

router.get('/', categoryCtrl.getAllCategories);
router.get('/:id', categoryCtrl.getCategoryById);
router.post('/', categoryCtrl.createCategory);
router.put('/:id', categoryCtrl.updateCategory);
router.delete('/:id', categoryCtrl.deleteCategory);

module.exports = router;
