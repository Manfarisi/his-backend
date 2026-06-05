const { validationResult } = require('express-validator');
const db = require('../../config/db');

// GET /balance — Cek saldo user yang sedang login
const getBalance = async (req, res) => {
  try {
    // req.user.id didapat dari JWT yang sudah diverifikasi middleware
    const [rows] = await db.execute(
      'SELECT balance FROM balances WHERE user_id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'Data balance tidak ditemukan',
        data: null,
      });
    }

    return res.status(200).json({
      status: 0,
      message: 'Get Balance Berhasil',
      data: { balance: rows[0].balance },
    });
  } catch (err) {
    console.error('Get balance error:', err);
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: null,
    });
  }
};

// POST /topup — Tambah saldo
const topUp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      status: 102,
      message: firstError.msg,
      data: null,
    });
  }

  const { top_up_amount } = req.body;
  const userId = req.user.id;

  // Gunakan connection manual untuk transaksi DB
  // Tujuannya: kalau salah satu query gagal, semua di-rollback
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Update saldo — balance + jumlah topup
    await connection.execute(
      'UPDATE balances SET balance = balance + ? WHERE user_id = ?',
      [top_up_amount, userId]
    );

    // Buat invoice number unik: INV + timestamp
    const invoiceNumber = `INV${Date.now()}`;

    // Catat transaksi topup ke history
    await connection.execute(
      `INSERT INTO transactions 
        (user_id, invoice_number, transaction_type, description, total_amount) 
       VALUES (?, ?, 'TOPUP', 'Top Up balance', ?)`,
      [userId, invoiceNumber, top_up_amount]
    );

    // Ambil saldo terbaru setelah topup
    const [balanceRows] = await connection.execute(
      'SELECT balance FROM balances WHERE user_id = ?',
      [userId]
    );

    await connection.commit();

    return res.status(200).json({
      status: 0,
      message: 'Top Up Balance berhasil',
      data: { balance: balanceRows[0].balance },
    });
  } catch (err) {
    await connection.rollback();
    console.error('Top up error:', err);
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: null,
    });
  } finally {
    // Selalu kembalikan connection ke pool setelah selesai
    connection.release();
  }
};

module.exports = { getBalance, topUp };