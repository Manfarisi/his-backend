# HIS Backend REST API

REST API untuk aplikasi HIS (Health Information System) yang mencakup modul Registrasi, Login, Cek Saldo, Top Up, dan Transaksi pembayaran layanan.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Token)
- **Query:** Raw Query + Prepared Statement (mysql2)
- **Deploy:** Railway.app

## Struktur Project

```
his-backend/
├── src/
│   ├── config/
│   │   └── db.js                       # Konfigurasi koneksi MySQL
│   ├── middleware/
│   │   └── auth.js                     # JWT Authentication Middleware
│   └── modules/
│       ├── auth/
│       │   ├── auth.controller.js      # Logic Register & Login
│       │   └── auth.route.js           # Route Register & Login
│       ├── balance/
│       │   ├── balance.controller.js   # Logic Cek Saldo & Top Up
│       │   └── balance.route.js        # Route Cek Saldo & Top Up
│       └── transaction/
│           ├── transaction.controller.js  # Logic Transaksi & History
│           └── transaction.route.js       # Route Transaksi & History
├── ddl/
│   └── schema.sql      # DDL Database (struktur tabel + seed data)
├── .env.example        # Contoh konfigurasi environment
├── .gitignore
└── package.json
```

## Database Design

```
users
├── id (PK)
├── email (UNIQUE)
├── first_name
├── last_name
├── password (bcrypt hashed)
├── profile_image
└── created_at

balances
├── id (PK)
├── user_id (FK → users)
├── balance
└── updated_at

services
├── id (PK)
├── service_code (UNIQUE)
├── service_name
├── service_icon
└── service_tarif

transactions
├── id (PK)
├── user_id (FK → users)
├── invoice_number (UNIQUE)
├── transaction_type (TOPUP | PAYMENT)
├── service_id (FK → services, nullable)
├── description
├── total_amount
└── created_at
```

## ⚙️ Setup & Instalasi

### 1. Clone Repository
```bash
git clone https://github.com/Manfarisi/his-backend.git
cd his-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment
```bash
cp .env.example .env
```

Edit file `.env` sesuai konfigurasi database:
```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=his_db

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=12h
```

### 4. Setup Database
```bash
mysql -u root -p < ddl/schema.sql
```

### 5. Jalankan Server
```bash
# Development
npm run dev

# Production
npm start
```

Server berjalan di `http://localhost:3000`

##  API Endpoints

Base URL Production: `https://his-backend-production-ef7a.up.railway.app`

### Public (Tanpa Token)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/registration` | Registrasi user baru |
| POST | `/login` | Login dan mendapatkan token |

### Private (Butuh Bearer Token)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/balance` | Cek saldo |
| POST | `/topup` | Top up saldo |
| GET | `/services` | List layanan tersedia |
| POST | `/transaction` | Bayar layanan |
| GET | `/transaction/history` | Riwayat transaksi |

### Contoh Request

**POST /registration**
```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "password123"
}
```

**POST /login**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**POST /topup** *(Bearer Token required)*
```json
{
  "top_up_amount": 100000
}
```

**POST /transaction** *(Bearer Token required)*
```json
{
  "service_code": "PULSA"
}
```
