<?php
// upload.php - Handler upload file gambar
header('Content-Type: application/json');

$targetDir = "uploads/";

// Buat folder jika belum ada
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_FILES['file']) && $_FILES['file']['error'] == 0) {
        $file = $_FILES['file'];
        $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file['name']);
        $targetFile = $targetDir . $fileName;
        
        // Cek tipe file
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file['type'], $allowedTypes)) {
            echo json_encode(['success' => false, 'error' => 'Tipe file tidak diizinkan. Gunakan JPG, PNG, GIF, atau WEBP.']);
            exit();
        }
        
        // Cek ukuran file (max 5MB)
        if ($file['size'] > 5 * 1024 * 1024) {
            echo json_encode(['success' => false, 'error' => 'Ukuran file terlalu besar. Maksimal 5MB.']);
            exit();
        }
        
        // Upload file
        if (move_uploaded_file($file['tmp_name'], $targetFile)) {
            echo json_encode([
                'success' => true, 
                'file_path' => $targetFile,
                'message' => 'File berhasil diupload'
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Gagal mengupload file']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Tidak ada file yang diupload']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Method tidak diizinkan']);
}
?>
