const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db'); 

const app = express();
const PORT = process.env.PORT || 3000;

const authRoutes = require('./modules/auth/auth.route');
const balanceRoutes = require('./modules/balance/balance.route');
const transactionRoutes = require('./modules/transaction/transaction.route');

// Middleware wajib
app.use(cors());
app.use(express.json()); // Supaya bisa membaca body JSON dari Postman

// Cek Koneksi Database
pool.getConnection()
  .then(connection => {
    console.log('Database terhubung dengan sukses!');
    connection.release();
  })
  .catch(err => {
    console.error('Gagal terhubung ke database:', err.message);
  });

// Route testing dasar
app.get('/', (req, res) => {
  res.json({ message: "Assignment Backend Developer" });
});

app.use(authRoutes);
app.use(balanceRoutes);
app.use(transactionRoutes);


// Jalankan Server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});