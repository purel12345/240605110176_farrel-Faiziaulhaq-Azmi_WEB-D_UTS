<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

try {
    switch($action) {
        // ========== STATISTIK ==========
        case 'statistik':
            $totalPenulis = $pdo->query("SELECT COUNT(*) as total FROM penulis")->fetch()['total'];
            $totalKategori = $pdo->query("SELECT COUNT(*) as total FROM kategori")->fetch()['total'];
            $totalArtikel = $pdo->query("SELECT COUNT(*) as total FROM artikel")->fetch()['total'];
            
            echo json_encode([
                'success' => true,
                'total_penulis' => (int)$totalPenulis,
                'total_kategori' => (int)$totalKategori,
                'total_artikel' => (int)$totalArtikel
            ]);
            break;
        
        // ========== PENULIS ==========
        case 'penulis':
            if ($method == 'GET') {
                if ($id) {
                    // GET by ID
                    $stmt = $pdo->prepare("SELECT * FROM penulis WHERE id = ?");
                    $stmt->execute([$id]);
                    $data = $stmt->fetch();
                    echo json_encode($data ?: null);
                } else {
                    // GET all
                    $stmt = $pdo->query("SELECT * FROM penulis ORDER BY created_at DESC");
                    echo json_encode($stmt->fetchAll());
                }
            }
            elseif ($method == 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $stmt = $pdo->prepare("INSERT INTO penulis (nama, email, bio, foto) VALUES (?, ?, ?, ?)");
                $stmt->execute([
                    $input['nama'], 
                    $input['email'], 
                    $input['bio'] ?? '', 
                    $input['foto'] ?? ''
                ]);
                echo json_encode(['success' => true, 'message' => 'Penulis berhasil ditambahkan', 'id' => $pdo->lastInsertId()]);
            }
            elseif ($method == 'PUT' && $id) {
                $input = json_decode(file_get_contents('php://input'), true);
                $stmt = $pdo->prepare("UPDATE penulis SET nama=?, email=?, bio=?, foto=? WHERE id=?");
                $stmt->execute([
                    $input['nama'], 
                    $input['email'], 
                    $input['bio'] ?? '', 
                    $input['foto'] ?? '', 
                    $id
                ]);
                echo json_encode(['success' => true, 'message' => 'Penulis berhasil diupdate']);
            }
            elseif ($method == 'DELETE' && $id) {
                $stmt = $pdo->prepare("DELETE FROM penulis WHERE id=?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'message' => 'Penulis berhasil dihapus']);
            }
            break;
        
        // ========== KATEGORI ==========
        case 'kategori':
            if ($method == 'GET') {
                if ($id) {
                    // GET by ID
                    $stmt = $pdo->prepare("SELECT * FROM kategori WHERE id = ?");
                    $stmt->execute([$id]);
                    $data = $stmt->fetch();
                    echo json_encode($data ?: null);
                } else {
                    // GET all
                    $stmt = $pdo->query("SELECT * FROM kategori ORDER BY created_at DESC");
                    echo json_encode($stmt->fetchAll());
                }
            }
            elseif ($method == 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $stmt = $pdo->prepare("INSERT INTO kategori (nama_kategori, deskripsi) VALUES (?, ?)");
                $stmt->execute([$input['nama_kategori'], $input['deskripsi'] ?? '']);
                echo json_encode(['success' => true, 'message' => 'Kategori berhasil ditambahkan', 'id' => $pdo->lastInsertId()]);
            }
            elseif ($method == 'PUT' && $id) {
                $input = json_decode(file_get_contents('php://input'), true);
                $stmt = $pdo->prepare("UPDATE kategori SET nama_kategori=?, deskripsi=? WHERE id=?");
                $stmt->execute([$input['nama_kategori'], $input['deskripsi'] ?? '', $id]);
                echo json_encode(['success' => true, 'message' => 'Kategori berhasil diupdate']);
            }
            elseif ($method == 'DELETE' && $id) {
                $stmt = $pdo->prepare("DELETE FROM kategori WHERE id=?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'message' => 'Kategori berhasil dihapus']);
            }
            break;
        
        // ========== ARTIKEL ==========
        case 'artikel':
            if ($method == 'GET') {
                if ($id) {
                    // GET by ID
                    $stmt = $pdo->prepare("
                        SELECT a.*, p.nama as penulis_nama, p.foto as penulis_foto, k.nama_kategori as kategori_nama 
                        FROM artikel a 
                        LEFT JOIN penulis p ON a.penulis_id = p.id 
                        LEFT JOIN kategori k ON a.kategori_id = k.id 
                        WHERE a.id = ?
                    ");
                    $stmt->execute([$id]);
                    $data = $stmt->fetch();
                    echo json_encode($data ?: null);
                } else {
                    // GET all
                    $stmt = $pdo->query("
                        SELECT a.*, p.nama as penulis_nama, p.foto as penulis_foto, k.nama_kategori as kategori_nama 
                        FROM artikel a 
                        LEFT JOIN penulis p ON a.penulis_id = p.id 
                        LEFT JOIN kategori k ON a.kategori_id = k.id 
                        ORDER BY a.created_at DESC
                    ");
                    echo json_encode($stmt->fetchAll());
                }
            }
            elseif ($method == 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $stmt = $pdo->prepare("INSERT INTO artikel (judul, isi, penulis_id, kategori_id, gambar) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([
                    $input['judul'], 
                    $input['isi'], 
                    $input['penulis_id'] ?: null, 
                    $input['kategori_id'] ?: null, 
                    $input['gambar'] ?? ''
                ]);
                echo json_encode(['success' => true, 'message' => 'Artikel berhasil ditambahkan', 'id' => $pdo->lastInsertId()]);
            }
            elseif ($method == 'PUT' && $id) {
                $input = json_decode(file_get_contents('php://input'), true);
                $stmt = $pdo->prepare("UPDATE artikel SET judul=?, isi=?, penulis_id=?, kategori_id=?, gambar=? WHERE id=?");
                $stmt->execute([
                    $input['judul'], 
                    $input['isi'], 
                    $input['penulis_id'] ?: null, 
                    $input['kategori_id'] ?: null, 
                    $input['gambar'] ?? '', 
                    $id
                ]);
                echo json_encode(['success' => true, 'message' => 'Artikel berhasil diupdate']);
            }
            elseif ($method == 'DELETE' && $id) {
                $stmt = $pdo->prepare("DELETE FROM artikel WHERE id=?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'message' => 'Artikel berhasil dihapus']);
            }
            break;
        
        default:
            echo json_encode([
                'error' => 'Action tidak dikenal', 
                'available' => ['statistik', 'penulis', 'kategori', 'artikel']
            ]);
    }
} catch(Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>