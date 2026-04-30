<?php
// config.php - Koneksi database
// HAPUS header() dari sini, pindahkan ke api.php

$host = 'localhost';
$dbname = 'blog_cms_new';
$username = 'root';
$password = 'root'; // Sesuaikan dengan password Anda

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die(json_encode(['error' => 'Koneksi database gagal: ' . $e->getMessage()]));
}
?>