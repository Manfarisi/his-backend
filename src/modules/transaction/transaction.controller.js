const { validationResult } = require('express-validator');
const db = require('../../config/db');

// GET /services — List semua layanan yang tersedia
const getServices = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT service_code, service_name, service_icon, service_tarif FROM services'
    );

    return res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: rows,
    });
  } catch (err) {
    console.error('Get services error:', err);
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: null,
    });
  }
};

// POST /transaction — Bayar layanan
const transaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      status: 102,
      message: firstError.msg,
      data: null,
    });
  }

  const { service_code } = req.body;
  const userId = req.user.id;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Cek apakah service_code valid
    const [serviceRows] = await connection.execute(
      'SELECT * FROM services WHERE service_code = ?',
      [service_code]
    );

    if (serviceRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        status: 102,
        message: 'Service atau Layanan tidak ditemukan',
        data: null,
      });
    }

    const service = serviceRows[0];

    // Cek saldo user cukup atau tidak
    const [balanceRows] = await connection.execute(
      'SELECT balance FROM balances WHERE user_id = ?',
      [userId]
    );

    const currentBalance = parseFloat(balanceRows[0].balance);
    const tarif = parseFloat(service.service_tarif);

    if (currentBalance < tarif) {
      await connection.rollback();
      return res.status(400).json({
        status: 102,
        message: 'Saldo tidak mencukupi',
        data: null,
      });
    }

    // Kurangi saldo
    await connection.execute(
      'UPDATE balances SET balance = balance - ? WHERE user_id = ?',
      [tarif, userId]
    );

    const invoiceNumber = `INV${Date.now()}`;

    // Catat transaksi pembayaran
    await connection.execute(
      `INSERT INTO transactions 
        (user_id, invoice_number, transaction_type, service_id, description, total_amount) 
       VALUES (?, ?, 'PAYMENT', ?, ?, ?)`,
      [userId, invoiceNumber, service.id, service.service_name, tarif]
    );

    await connection.commit();

    return res.status(200).json({
      status: 0,
      message: 'Transaksi berhasil',
      data: {
        invoice_number: invoiceNumber,
        service_code: service.service_code,
        service_name: service.service_name,
        transaction_type: 'PAYMENT',
        total_amount: tarif,
        created_on: new Date(),
      },
    });
  } catch (err) {
    await connection.rollback();
    console.error('Transaction error:', err);
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: null,
    });
  } finally {
    connection.release();
  }
};

// GET /transaction/history — Riwayat transaksi
const getHistory = async (req, res) => {
  const userId = req.user.id;
  // Support pagination: ?offset=0&limit=5
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 5;

  try {
    const [rows] = await db.execute(
      `SELECT 
        t.invoice_number,
        t.transaction_type,
        COALESCE(s.service_name, 'Top Up Balance') AS description,
        t.total_amount,
        t.created_at AS created_on
       FROM transactions t
       LEFT JOIN services s ON t.service_id = s.id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    return res.status(200).json({
      status: 0,
      message: 'Get History Berhasil',
      data: {
        offset,
        limit,
        records: rows,
      },
    });
  } catch (err) {
    console.error('Get history error:', err);
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: null,
    });
  }
};

module.exports = { getServices, transaction, getHistory };