<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistem Manajemen Blog | CMS</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="logo">
                <h2>✍️ BlogCMS</h2>
                <p>Sistem Manajemen Blog</p>
            </div>
            <nav class="nav-menu">
                <button class="nav-btn active" data-tab="dashboard">
                    <span class="icon">📊</span> Dashboard
                </button>
                <button class="nav-btn" data-tab="artikel">
                    <span class="icon">📝</span> Artikel
                </button>
                <button class="nav-btn" data-tab="penulis">
                    <span class="icon">👤</span> Penulis
                </button>
                <button class="nav-btn" data-tab="kategori">
                    <span class="icon">🏷️</span> Kategori
                </button>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <header class="header">
                <h1 id="page-title">Dashboard</h1>
                <div class="header-actions">
                    <button id="refresh-btn" class="btn-refresh">🔄 Refresh</button>
                </div>
            </header>

            <div id="content-container">
                <div class="loading">🔄 Memuat data...</div>
            </div>
        </main>
    </div>

    <!-- Modal untuk Form -->
    <div id="modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title">Form</h3>
                <span class="close">&times;</span>
            </div>
            <div id="modal-body"></div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>