const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/messageController');

router.post('/', ctrl.createMessage);
router.get('/', ctrl.getAllMessages);
router.get('/:id', ctrl.getMessageById);
router.delete('/:id', ctrl.deleteMessage);

module.exports = router;