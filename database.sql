-- Buat database BARU (gunakan nama ini biar tidak bentrok)
CREATE DATABASE IF NOT EXISTS blog_cms_final;
USE blog_cms_final;

-- ============================================
-- TABEL PENULIS
-- ============================================
CREATE TABLE IF NOT EXISTS penulis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    bio TEXT,
    foto VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABEL KATEGORI
-- ============================================
CREATE TABLE IF NOT EXISTS kategori (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(50) NOT NULL UNIQUE,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABEL ARTIKEL
-- ============================================
CREATE TABLE IF NOT EXISTS artikel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(200) NOT NULL,
    isi TEXT NOT NULL,
    penulis_id INT,
    kategori_id INT,
    gambar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (penulis_id) REFERENCES penulis(id) ON DELETE SET NULL,
    FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE SET NULL
);

-- ============================================
-- DATA CONTOH PENULIS
-- ============================================
INSERT INTO penulis (nama, email, bio, foto) VALUES
('Ahmad Rizki', 'ahmad@example.com', 'Penulis senior teknologi dengan pengalaman 10 tahun di bidang web development', NULL),
('Siti Nurhaliza', 'siti@example.com', 'Pecinta literasi dan edukasi, aktif menulis artikel pendidikan', NULL),
('Budi Santoso', 'budi@example.com', 'Content creator berbasis web,专注于 teknologi dan startup', NULL),
('Dewi Anggraeni', 'dewi@example.com', 'Ahli marketing digital dan sosial media', NULL),
('Fajar Setiawan', 'fajar@example.com', 'Pengembang full-stack dan penulis buku programming', NULL);

-- ============================================
-- DATA CONTOH KATEGORI
-- ============================================
INSERT INTO kategori (nama_kategori, deskripsi) VALUES
('Teknologi', 'Artikel tentang perkembangan teknologi terbaru, software, hardware, dan inovasi digital'),
('Pendidikan', 'Artikel edukasi, tips belajar, metode pengajaran, dan perkembangan dunia pendidikan'),
('Lifestyle', 'Tip kesehatan, gaya hidup sehat, produktivitas, dan keseimbangan hidup'),
('Bisnis', 'Strategi bisnis, kewirausahaan, marketing, dan manajemen usaha'),
('Programming', 'Tutorial coding, bahasa pemrograman, framework, dan best practices development'),
('Design', 'UI/UX design, graphic design, tips desain, dan tools untuk desainer');

-- ============================================
-- DATA CONTOH ARTIKEL
-- ============================================
INSERT INTO artikel (judul, isi, penulis_id, kategori_id, gambar) VALUES
('Belajar PHP untuk Pemula', 'PHP adalah bahasa pemrograman yang populer untuk web development. Dalam artikel ini kita akan belajar dasar-dasar PHP termasuk sintaks, variabel, array, dan fungsi. PHP sangat mudah dipelajari bagi pemula karena dokumentasinya yang lengkap dan komunitas yang besar.', 1, 1, NULL),

('Tips Mengelola Waktu Efektif', 'Mengatur waktu dengan baik adalah kunci produktivitas. Pelajari metode Pomodoro, Eisenhower Matrix, dan teknik time blocking untuk meningkatkan efisiensi kerja sehari-hari.', 2, 3, NULL),

('Startup Digital di Era Modern', 'Peluang bisnis digital semakin terbuka lebar. Artikel ini membahas strategi membangun startup dari nol, cara mendapatkan modal, dan tips marketing untuk produk digital.', 3, 4, NULL),

('Memahami Konsep OOP di JavaScript', 'Object Oriented Programming di JavaScript berbeda dengan bahasa lain. Pelajari tentang class, constructor, inheritance, dan polymorphism dalam JavaScript modern (ES6+).', 4, 5, NULL),

('Cara Membuat Desain UI yang Menarik', 'Desain UI yang baik meningkatkan pengalaman pengguna. Pelajari prinsip-prinsip desain seperti hierarchy, contrast, balance, dan tips memilih warna yang tepat.', 5, 6, NULL),

('React JS untuk Pemula', 'React adalah library JavaScript paling populer. Artikel ini akan memandu Anda membuat komponen pertama, memahami state dan props, serta lifecycle component.', 1, 5, NULL),

('Strategi Content Marketing 2024', 'Content marketing terus berkembang. Pelajari strategi terbaru untuk membuat konten yang viral, SEO friendly, dan engaging untuk audiens target.', 3, 4, NULL),

('Cara Belajar Efektif untuk Mahasiswa', 'Tips dan trik belajar efektif untuk mahasiswa agar lebih mudah memahami materi kuliah dan mendapatkan nilai bagus.', 2, 2, NULL);

-- ============================================
-- CEK DATA (OPSIONAL - UNTUK VERIFIKASI)
-- ============================================
SELECT 'penulis' as tabel, COUNT(*) as jumlah FROM penulis
UNION ALL
SELECT 'kategori', COUNT(*) FROM kategori
UNION ALL
SELECT 'artikel', COUNT(*) FROM artikel;
