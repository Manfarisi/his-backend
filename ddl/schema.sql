CREATE TABLE IF NOT EXISTS users (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  email       VARCHAR(100) NOT NULL UNIQUE,
  first_name  VARCHAR(50)  NOT NULL,
  last_name   VARCHAR(50)  NOT NULL,
  password    VARCHAR(255) NOT NULL,
  -- profile_image disimpan sebagai URL string
  profile_image VARCHAR(255) DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saldo user dipisah dari tabel users agar lebih clean
-- dan mudah di-lock saat transaksi concurrent
CREATE TABLE IF NOT EXISTS balances (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  user_id    INT NOT NULL UNIQUE,
  balance    DECIMAL(15,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Master data layanan yang bisa dibeli (Pulsa, Voucher Game, dll)
CREATE TABLE IF NOT EXISTS services (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  service_code  VARCHAR(50)  NOT NULL UNIQUE,
  service_name  VARCHAR(100) NOT NULL,
  service_icon  VARCHAR(255) DEFAULT NULL,
  service_tarif DECIMAL(15,2) NOT NULL
);

-- Semua history transaksi (topup & pembayaran) disimpan di sini
CREATE TABLE IF NOT EXISTS transactions (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  user_id          INT NOT NULL,
  invoice_number   VARCHAR(50) NOT NULL UNIQUE,
  -- TOPUP atau PAYMENT
  transaction_type ENUM('TOPUP', 'PAYMENT') NOT NULL,
  -- service_id null jika TOPUP
  service_id       INT DEFAULT NULL,
  description      VARCHAR(255),
  total_amount     DECIMAL(15,2) NOT NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Seed data: master layanan
INSERT INTO services (service_code, service_name, service_tarif) VALUES
('PULSA',        'Pulsa',              10000),
('PGN',          'PGN',                50000),
('LISTRIK',      'Listrik',            50000),
('PDAM',         'PDAM Berlangganan',  40000),
('PBB',          'PBB',                40000),
('BPJS',         'BPJS Kesehatan',     25500),
('TELEPON',      'Telepon Rumah',      40000),
('VOUCHER_GAME', 'Voucher Game',       100000),
('VOUCHER_MAKANAN', 'Voucher Makanan', 100000),
('PAKET_DATA',   'Paket Data',         50000),
('MUSIK',        'Musik Berlangganan', 50000),
('FILM',         'Film Berlangganan',  50000)
ON DUPLICATE KEY UPDATE service_name = VALUES(service_name);