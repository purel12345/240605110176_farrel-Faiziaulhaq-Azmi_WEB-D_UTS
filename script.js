async function testConnection() {
    try {
        const response = await fetch(`${API_BASE}?action=statistik`);
        const data = await response.json();
        console.log('API Test Response:', data);
        return data;
    } catch(error) {
        console.error('API Connection Error:', error);
        return null;
    }
}

const API_BASE = 'api.php';
const UPLOAD_URL = 'upload.php';

let currentTab = 'dashboard';
let editId = null;

let cachePenulis = [];
let cacheKategori = [];

const contentContainer = document.getElementById('content-container');
const pageTitle = document.getElementById('page-title');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close');
const refreshBtn = document.getElementById('refresh-btn');

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Loaded - Sistem CMS Siap');
    
    // Test koneksi API
    const testResult = await testConnection();
    if (!testResult || testResult.error) {
        showAlert('Gagal terhubung ke server. Cek koneksi database.', 'error');
        contentContainer.innerHTML = `
            <div class="loading" style="color:red;">
                ❌ Gagal terhubung ke server!<br>
                Pastikan:<br>
                1. MySQL server berjalan<br>
                2. Database blog_cms sudah diimport<br>
                3. Konfigurasi database di config.php benar
            </div>
        `;
        return;
    }
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            updatePageTitle();
            loadContent();
        });
    });
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadContent();
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
            editId = null;
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            editId = null;
        }
    });
    
    loadContent();
});

function updatePageTitle() {
    const titles = {
        dashboard: 'Dashboard',
        artikel: 'Manajemen Artikel',
        penulis: 'Manajemen Penulis',
        kategori: 'Manajemen Kategori'
    };
    pageTitle.textContent = titles[currentTab] || 'Dashboard';
}

async function loadContent() {
    if (!contentContainer) return;
    contentContainer.innerHTML = '<div class="loading">🔄 Memuat data...</div>';
    
    try {
        switch(currentTab) {
            case 'dashboard': await loadDashboard(); break;
            case 'artikel': await loadArtikel(); break;
            case 'penulis': await loadPenulis(); break;
            case 'kategori': await loadKategori(); break;
            default: await loadDashboard();
        }
    } catch(error) {
        console.error('Load content error:', error);
        contentContainer.innerHTML = '<div class="loading">❌ Gagal memuat data. <button onclick="location.reload()">Coba Lagi</button></div>';
    }
}

// ========== DASHBOARD ==========
async function loadDashboard() {
    try {
        const [statsRes, artikelRes, penulisRes] = await Promise.all([
            fetch(`${API_BASE}?action=statistik`),
            fetch(`${API_BASE}?action=artikel`),
            fetch(`${API_BASE}?action=penulis`)
        ]);
        
        const stats = await statsRes.json();
        let artikel = await artikelRes.json();
        let penulis = await penulisRes.json();
        
        artikel = Array.isArray(artikel) ? artikel : [];
        penulis = Array.isArray(penulis) ? penulis : [];
        
        const html = `
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-icon">📝</div><h3>Total Artikel</h3><div class="stat-number">${stats.total_artikel || 0}</div></div>
                <div class="stat-card"><div class="stat-icon">👤</div><h3>Total Penulis</h3><div class="stat-number">${stats.total_penulis || 0}</div></div>
                <div class="stat-card"><div class="stat-icon">🏷️</div><h3>Total Kategori</h3><div class="stat-number">${stats.total_kategori || 0}</div></div>
            </div>
            <div class="table-container">
                <div style="padding: 1rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0;"><strong>📰 Artikel Terbaru</strong></div>
                <table class="data-table"><thead><tr><th>Judul</th><th>Penulis</th><th>Kategori</th><th>Tanggal</th></tr></thead>
                <tbody>${artikel.slice(0, 5).map(art => `
                    <tr><td><strong>${escapeHtml(art.judul || '-')}</strong></td><td>${escapeHtml(art.penulis_nama || '-')}</td>
                    <td><span class="badge">${escapeHtml(art.kategori_nama || '-')}</span></td><td>${formatDate(art.created_at)}</td>
                </tr>`).join('')}${artikel.length === 0 ? '<tr><td colspan="4">Belum ada artikel</td>' : ''}</tbody>
                </table>
            </div>
        `;
        contentContainer.innerHTML = html;
    } catch(error) {
        console.error('Dashboard error:', error);
        contentContainer.innerHTML = '<div class="loading">❌ Gagal memuat dashboard</div>';
    }
}

// ========== FUNGSI UPLOAD FILE ==========
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(UPLOAD_URL, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success) {
            showAlert('File berhasil diupload!', 'success');
            return result.file_path;
        } else {
            showAlert(result.error || 'Gagal upload file', 'error');
            return null;
        }
    } catch(error) {
        console.error('Upload error:', error);
        showAlert('Error upload file', 'error');
        return null;
    }
}

// ========== ARTIKEL ==========
async function loadArtikel() {
    try {
        const [artikelRes, penulisRes, kategoriRes] = await Promise.all([
            fetch(`${API_BASE}?action=artikel`),
            fetch(`${API_BASE}?action=penulis`),
            fetch(`${API_BASE}?action=kategori`)
        ]);
        
        let artikel = await artikelRes.json();
        cachePenulis = await penulisRes.json();
        cacheKategori = await kategoriRes.json();
        
        artikel = Array.isArray(artikel) ? artikel : [];
        cachePenulis = Array.isArray(cachePenulis) ? cachePenulis : [];
        cacheKategori = Array.isArray(cacheKategori) ? cacheKategori : [];
        
        const html = `
            <div style="margin-bottom: 1rem;">
                <button class="btn-add" onclick="window.showArtikelForm(null)">➕ Tambah Artikel</button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>Judul</th><th>Penulis</th><th>Kategori</th><th>Gambar</th><th>Tanggal</th><th>Aksi</th></tr></thead>
                    <tbody>
                        ${artikel.map(art => `
                            <tr>
                                <td>${art.id}</td>
                                <td><strong>${escapeHtml(art.judul)}</strong></td>
                                <td>${escapeHtml(art.penulis_nama || '-')}</td>
                                <td><span class="badge">${escapeHtml(art.kategori_nama || '-')}</span></td>
                                <td>${art.gambar ? `<img src="${art.gambar}" class="image-thumb" style="width:40px;height:40px;object-fit:cover;border-radius:8px;">` : '-'}</td>
                                <td>${formatDate(art.created_at)}</td>
                                <td>
                                    <button class="btn-edit" onclick="window.editArtikel(${art.id})">✏️ Edit</button>
                                    <button class="btn-delete" onclick="window.deleteArtikel(${art.id})">🗑️ Hapus</button>
                                </td>
                            </tr>
                        `).join('')}
                        ${artikel.length === 0 ? '<tr><td colspan="7" style="text-align:center">Belum ada artikel. Klik "Tambah Artikel" untuk mulai.</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
        contentContainer.innerHTML = html;
    } catch(error) {
        console.error('Artikel error:', error);
        contentContainer.innerHTML = '<div class="loading">❌ Gagal memuat artikel</div>';
    }
}

window.showArtikelForm = function(data) {
    editId = data ? data.id : null;
    modalTitle.textContent = editId ? '✏️ Edit Artikel' : '➕ Tambah Artikel';
    
    let gambarPreview = '';
    let gambarValue = '';
    
    if (data && data.gambar) {
        gambarPreview = `<div class="image-preview"><img src="${data.gambar}" style="max-width:150px;border-radius:8px;"></div>`;
        gambarValue = data.gambar;
    }
    
    modalBody.innerHTML = `
        <form id="artikel-form" enctype="multipart/form-data">
            <div class="form-group">
                <label>📌 Judul Artikel *</label>
                <input type="text" name="judul" value="${escapeHtml(data?.judul || '')}" required placeholder="Masukkan judul artikel">
            </div>
            <div class="form-group">
                <label>📄 Isi Artikel *</label>
                <textarea name="isi" required placeholder="Tulis konten artikel di sini..." rows="8">${escapeHtml(data?.isi || '')}</textarea>
            </div>
            <div class="form-group">
                <label>👤 Penulis</label>
                <select name="penulis_id">
                    <option value="">-- Pilih Penulis --</option>
                    ${cachePenulis.map(p => `<option value="${p.id}" ${data?.penulis_id == p.id ? 'selected' : ''}>${escapeHtml(p.nama)}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>🏷️ Kategori</label>
                <select name="kategori_id">
                    <option value="">-- Pilih Kategori --</option>
                    ${cacheKategori.map(k => `<option value="${k.id}" ${data?.kategori_id == k.id ? 'selected' : ''}>${escapeHtml(k.nama_kategori)}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>🖼️ Gambar Artikel</label>
                <div class="file-input-group">
                    <input type="file" id="gambar_file" accept="image/jpeg,image/png,image/gif,image/webp">
                    <button type="button" class="btn-upload" id="uploadGambarBtn">📤 Upload Gambar</button>
                </div>
                <input type="hidden" name="gambar" id="gambar_url" value="${gambarValue}">
                <div id="gambar_preview">${gambarPreview}</div>
                <small style="color:#64748b">Maksimal ukuran 5MB, format: JPG, PNG, GIF, WEBP</small>
            </div>
            <button type="submit" class="btn-submit">💾 Simpan</button>
        </form>
    `;
    
    // Setup upload handler
    const uploadBtn = document.getElementById('uploadGambarBtn');
    const fileInput = document.getElementById('gambar_file');
    const gambarUrlInput = document.getElementById('gambar_url');
    const previewDiv = document.getElementById('gambar_preview');
    
    if (uploadBtn) {
        uploadBtn.onclick = async () => {
            const file = fileInput.files[0];
            if (!file) {
                showAlert('Pilih file gambar terlebih dahulu!', 'error');
                return;
            }
            
            uploadBtn.textContent = '⏳ Mengupload...';
            uploadBtn.disabled = true;
            
            const filePath = await uploadFile(file);
            
            if (filePath) {
                gambarUrlInput.value = filePath;
                previewDiv.innerHTML = `<div class="image-preview"><img src="${filePath}" style="max-width:150px;border-radius:8px;"></div>`;
                showAlert('Gambar berhasil diupload!', 'success');
            }
            
            uploadBtn.textContent = '📤 Upload Gambar';
            uploadBtn.disabled = false;
            fileInput.value = '';
        };
    }
    
    document.getElementById('artikel-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const submitData = {
            judul: formData.get('judul'),
            isi: formData.get('isi'),
            penulis_id: formData.get('penulis_id') || null,
            kategori_id: formData.get('kategori_id') || null,
            gambar: formData.get('gambar')
        };
        
        try {
            const url = editId ? `${API_BASE}?action=artikel&id=${editId}` : `${API_BASE}?action=artikel`;
            const response = await fetch(url, {
                method: editId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });
            
            const result = await response.json();
            if (result.success) {
                modal.style.display = 'none';
                await loadArtikel();
                showAlert(result.message, 'success');
                editId = null;
            } else {
                showAlert(result.error || 'Gagal menyimpan', 'error');
            }
        } catch(error) {
            showAlert('Error menyimpan data', 'error');
        }
    });
    
    modal.style.display = 'block';
};

window.editArtikel = async function(id) {
    try {
        const response = await fetch(`${API_BASE}?action=artikel&id=${id}`);
        const artikel = await response.json();
        if (artikel && artikel.id) {
            window.showArtikelForm(artikel);
        } else {
            showAlert('Artikel tidak ditemukan', 'error');
        }
    } catch(error) {
        showAlert('Error mengambil data artikel', 'error');
    }
};

window.deleteArtikel = async function(id) {
    if (confirm('⚠️ Apakah Anda yakin ingin menghapus artikel ini?')) {
        try {
            const response = await fetch(`${API_BASE}?action=artikel&id=${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                await loadArtikel();
                showAlert(result.message, 'success');
            } else {
                showAlert(result.error || 'Gagal menghapus', 'error');
            }
        } catch(error) {
            showAlert('Error menghapus data', 'error');
        }
    }
};

// ========== PENULIS ==========
async function loadPenulis() {
    try {
        const response = await fetch(`${API_BASE}?action=penulis`);
        let penulis = await response.json();
        penulis = Array.isArray(penulis) ? penulis : [];
        
        const html = `
            <div style="margin-bottom: 1rem;">
                <button class="btn-add" onclick="window.showPenulisForm(null)">➕ Tambah Penulis</button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>Foto</th><th>Nama</th><th>Email</th><th>Bio</th><th>Aksi</th></tr></thead>
                    <tbody>
                        ${penulis.map(p => `
                            <tr>
                                <td>${p.id}</td>
                                <td>${p.foto ? `<img src="${p.foto}" class="image-thumb" style="width:40px;height:40px;object-fit:cover;border-radius:50%;">` : '📷'}</td>
                                <td><strong>${escapeHtml(p.nama)}</strong></td>
                                <td>${escapeHtml(p.email)}</td>
                                <td>${escapeHtml(p.bio || '-')}</td>
                                <td>
                                    <button class="btn-edit" onclick="window.editPenulis(${p.id})">✏️ Edit</button>
                                    <button class="btn-delete" onclick="window.deletePenulis(${p.id})">🗑️ Hapus</button>
                                </td>
                            </tr>
                        `).join('')}
                        ${penulis.length === 0 ? '<tr><td colspan="6" style="text-align:center">Belum ada penulis</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
        contentContainer.innerHTML = html;
    } catch(error) {
        console.error('Penulis error:', error);
        contentContainer.innerHTML = '<div class="loading">❌ Gagal memuat penulis</div>';
    }
}

window.showPenulisForm = function(data) {
    editId = data ? data.id : null;
    modalTitle.textContent = editId ? '✏️ Edit Penulis' : '➕ Tambah Penulis';
    
    let fotoPreview = '';
    let fotoValue = '';
    
    if (data && data.foto) {
        fotoPreview = `<div class="image-preview"><img src="${data.foto}" style="max-width:100px;height:100px;object-fit:cover;border-radius:50%;"></div>`;
        fotoValue = data.foto;
    }
    
    modalBody.innerHTML = `
        <form id="penulis-form">
            <div class="form-group">
                <label>📛 Nama Lengkap *</label>
                <input type="text" name="nama" value="${escapeHtml(data?.nama || '')}" required>
            </div>
            <div class="form-group">
                <label>📧 Email *</label>
                <input type="email" name="email" value="${escapeHtml(data?.email || '')}" required>
            </div>
            <div class="form-group">
                <label>📝 Bio</label>
                <textarea name="bio" rows="3">${escapeHtml(data?.bio || '')}</textarea>
            </div>
            <div class="form-group">
                <label>🖼️ Foto Profil</label>
                <div class="file-input-group">
                    <input type="file" id="foto_file" accept="image/jpeg,image/png,image/gif,image/webp">
                    <button type="button" class="btn-upload" id="uploadFotoBtn">📤 Upload Foto</button>
                </div>
                <input type="hidden" name="foto" id="foto_url" value="${fotoValue}">
                <div id="foto_preview">${fotoPreview}</div>
            </div>
            <button type="submit" class="btn-submit">💾 Simpan</button>
        </form>
    `;
    
    const uploadBtn = document.getElementById('uploadFotoBtn');
    const fileInput = document.getElementById('foto_file');
    const fotoUrlInput = document.getElementById('foto_url');
    const previewDiv = document.getElementById('foto_preview');
    
    if (uploadBtn) {
        uploadBtn.onclick = async () => {
            const file = fileInput.files[0];
            if (!file) { showAlert('Pilih file foto terlebih dahulu!', 'error'); return; }
            
            uploadBtn.textContent = '⏳ Mengupload...';
            uploadBtn.disabled = true;
            
            const filePath = await uploadFile(file);
            
            if (filePath) {
                fotoUrlInput.value = filePath;
                previewDiv.innerHTML = `<div class="image-preview"><img src="${filePath}" style="max-width:100px;height:100px;object-fit:cover;border-radius:50%;"></div>`;
            }
            
            uploadBtn.textContent = '📤 Upload Foto';
            uploadBtn.disabled = false;
            fileInput.value = '';
        };
    }
    
    document.getElementById('penulis-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const submitData = {
            nama: formData.get('nama'),
            email: formData.get('email'),
            bio: formData.get('bio'),
            foto: formData.get('foto')
        };
        
        try {
            const url = editId ? `${API_BASE}?action=penulis&id=${editId}` : `${API_BASE}?action=penulis`;
            const response = await fetch(url, {
                method: editId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });
            
            const result = await response.json();
            if (result.success) {
                modal.style.display = 'none';
                await loadPenulis();
                showAlert(result.message, 'success');
                editId = null;
            } else {
                showAlert(result.error || 'Gagal menyimpan', 'error');
            }
        } catch(error) {
            showAlert('Error menyimpan data', 'error');
        }
    });
    
    modal.style.display = 'block';
};

window.editPenulis = async (id) => {
    console.log('Edit penulis ID:', id);
    try {
        const res = await fetch(`${API_BASE}?action=penulis&id=${id}`);
        const data = await res.json();
        console.log('Data penulis:', data);
        
        if (data && data.id) {
            showPenulisForm(data);
        } else {
            showAlert('Penulis tidak ditemukan!', 'error');
        }
    } catch(error) {
        console.error('Error:', error);
        showAlert('Gagal mengambil data penulis', 'error');
    }
};

window.deletePenulis = async function(id) {
    if (confirm('⚠️ Hapus penulis ini? Artikel terkait akan kehilangan penulis.')) {
        try {
            const response = await fetch(`${API_BASE}?action=penulis&id=${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                await loadPenulis();
                showAlert(result.message, 'success');
            } else {
                showAlert(result.error || 'Gagal menghapus', 'error');
            }
        } catch(error) {
            showAlert('Error menghapus data', 'error');
        }
    }
};

// ========== KATEGORI ==========
async function loadKategori() {
    try {
        const response = await fetch(`${API_BASE}?action=kategori`);
        let kategori = await response.json();
        kategori = Array.isArray(kategori) ? kategori : [];
        
        const html = `
            <div style="margin-bottom: 1rem;">
                <button class="btn-add" onclick="window.showKategoriForm(null)">➕ Tambah Kategori</button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>Nama Kategori</th><th>Deskripsi</th><th>Aksi</th></tr></thead>
                    <tbody>
                        ${kategori.map(k => `
                            <tr>
                                <td>${k.id}</td>
                                <td><span class="badge">${escapeHtml(k.nama_kategori)}</span></td>
                                <td>${escapeHtml(k.deskripsi || '-')}</td>
                                <td>
                                    <button class="btn-edit" onclick="window.editKategori(${k.id})">✏️ Edit</button>
                                    <button class="btn-delete" onclick="window.deleteKategori(${k.id})">🗑️ Hapus</button>
                                </td>
                            </tr>
                        `).join('')}
                        ${kategori.length === 0 ? '<tr><td colspan="4" style="text-align:center">Belum ada kategori</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
        contentContainer.innerHTML = html;
    } catch(error) {
        console.error('Kategori error:', error);
        contentContainer.innerHTML = '<div class="loading">❌ Gagal memuat kategori</div>';
    }
}

window.showKategoriForm = function(data) {
    editId = data ? data.id : null;
    modalTitle.textContent = editId ? '✏️ Edit Kategori' : '➕ Tambah Kategori';
    
    modalBody.innerHTML = `
        <form id="kategori-form">
            <div class="form-group">
                <label>🏷️ Nama Kategori *</label>
                <input type="text" name="nama_kategori" value="${escapeHtml(data?.nama_kategori || '')}" required placeholder="Contoh: Teknologi, Pendidikan">
            </div>
            <div class="form-group">
                <label>📝 Deskripsi</label>
                <textarea name="deskripsi" rows="3" placeholder="Deskripsi singkat tentang kategori ini...">${escapeHtml(data?.deskripsi || '')}</textarea>
            </div>
            <button type="submit" class="btn-submit">💾 Simpan</button>
        </form>
    `;
    
    document.getElementById('kategori-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const submitData = {
            nama_kategori: formData.get('nama_kategori'),
            deskripsi: formData.get('deskripsi')
        };
        
        try {
            const url = editId ? `${API_BASE}?action=kategori&id=${editId}` : `${API_BASE}?action=kategori`;
            const response = await fetch(url, {
                method: editId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });
            
            const result = await response.json();
            if (result.success) {
                modal.style.display = 'none';
                await loadKategori();
                showAlert(result.message, 'success');
                editId = null;
            } else {
                showAlert(result.error || 'Gagal menyimpan', 'error');
            }
        } catch(error) {
            showAlert('Error menyimpan data', 'error');
        }
    });
    
    modal.style.display = 'block';
};

window.editKategori = async function(id) {
    try {
        const response = await fetch(`${API_BASE}?action=kategori&id=${id}`);
        const kategori = await response.json();
        if (kategori && kategori.id) {
            window.showKategoriForm(kategori);
        } else {
            showAlert('Kategori tidak ditemukan', 'error');
        }
    } catch(error) {
        showAlert('Error mengambil data kategori', 'error');
    }
};

window.deleteKategori = async function(id) {
    if (confirm('⚠️ Hapus kategori ini?')) {
        try {
            const response = await fetch(`${API_BASE}?action=kategori&id=${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                await loadKategori();
                showAlert(result.message, 'success');
            } else {
                showAlert(result.error || 'Gagal menghapus', 'error');
            }
        } catch(error) {
            showAlert('Error menghapus data', 'error');
        }
    }
};

// ========== UTILITY FUNCTIONS ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID');
    } catch {
        return dateStr;
    }
}

function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = type === 'success' ? `✅ ${message}` : `❌ ${message}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
    `;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}