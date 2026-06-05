const express = require('express');
const { body } = require('express-validator');
const { getServices, transaction, getHistory } = require('./transaction.controller');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

// Semua route wajib login
router.get('/services', authMiddleware, getServices);

router.post('/transaction', authMiddleware, [
  body('service_code')
    .notEmpty()
    .withMessage('Service code tidak boleh kosong'),
], transaction);

router.get('/transaction/history', authMiddleware, getHistory);

module.exports = router;