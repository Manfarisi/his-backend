const express = require('express');
const { body } = require('express-validator');
const { getBalance, topUp } = require('./balance.controller');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

// Semua route balance wajib login (pakai authMiddleware)
router.get('/balance', authMiddleware, getBalance);

router.post('/topup', authMiddleware, [
  body('top_up_amount')
    .isNumeric().withMessage('Parameter amount hanya boleh angka')
    .custom(val => val > 0).withMessage('Parameter amount harus lebih besar dari 0'),
], topUp);

module.exports = router;