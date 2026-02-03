const API_URL = 'https://securecloud-hub-1.preview.emergentagent.com/api';

const token = localStorage.getItem('authToken');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
  window.location.href = '/auth/index.html';
}

document.getElementById('userEmail').textContent = user.email || user.phoneNumber || 'User';

const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const uploadMessage = document.getElementById('uploadMessage');
const filesGrid = document.getElementById('filesGrid');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');

uploadArea.addEventListener('click', () => {
  fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.style.background = 'rgba(102, 126, 234, 0.2)';
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.style.background = 'rgba(102, 126, 234, 0.05)';
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.style.background = 'rgba(102, 126, 234, 0.05)';
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    uploadFile(files[0]);
  }
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    uploadFile(file);
  }
});

async function uploadFile(file) {
  const maxSize = 50 * 1024 * 1024;
  
  if (file.size > maxSize) {
    showMessage('File size exceeds 50MB limit', 'error');
    return;
  }
  
  const blockedExtensions = ['.exe', '.bat', '.sh', '.cmd', '.com', '.app', '.msi', '.dmg'];
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  
  if (blockedExtensions.includes(fileExtension)) {
    showMessage('Executable files are not allowed for security reasons', 'error');
    return;
  }
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    showMessage('Uploading...', 'info');
    
    const response = await fetch(`${API_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      showMessage(data.error || 'Upload failed', 'error');
      return;
    }
    
    showMessage('File uploaded successfully!', 'success');
    fileInput.value = '';
    loadFiles();
  } catch (error) {
    console.error('Upload error:', error);
    showMessage('Network error. Please try again.', 'error');
  }
}

function showMessage(text, type) {
  uploadMessage.textContent = text;
  uploadMessage.className = `message ${type}`;
  uploadMessage.style.display = 'block';
  
  setTimeout(() => {
    uploadMessage.style.display = 'none';
  }, 5000);
}

async function loadFiles() {
  try {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'block';
    }
    
    const response = await fetch(`${API_URL}/files`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to load files');
    }
    
    displayFiles(data.files);
  } catch (error) {
    console.error('Load files error:', error);
    filesGrid.innerHTML = '<div class="loading">Failed to load files</div>';
  }
}

function displayFiles(files) {
  if (files.length === 0) {
    filesGrid.innerHTML = `
      <div class="empty-state">
        <i class='bx bx-folder-open'></i>
        <p>No files uploaded yet</p>
      </div>
    `;
    return;
  }
  
  filesGrid.innerHTML = files.map(file => {
    const fileIcon = getFileIcon(file.fileType);
    const fileSize = formatFileSize(file.fileSize);
    const uploadDate = new Date(file.uploadedAt).toLocaleDateString();
    
    return `
      <div class="file-card" data-testid="file-card-${file._id}">
        <div class="file-icon">
          <i class='bx ${fileIcon}'></i>
        </div>
        <div class="file-name" data-testid="file-name">${file.originalName}</div>
        <div class="file-info">Size: ${fileSize}</div>
        <div class="file-info">Uploaded: ${uploadDate}</div>
        <div class="file-actions">
          <button class="download-btn" data-testid="download-button-${file._id}" onclick="downloadFile('${file.fileUrl}', '${file.originalName}')">
            <i class='bx bx-download'></i> Download
          </button>
          <button class="delete-btn" data-testid="delete-button-${file._id}" onclick="deleteFile('${file._id}')">
            <i class='bx bx-trash'></i> Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function getFileIcon(fileType) {
  if (fileType.startsWith('image/')) return 'bxs-file-image';
  if (fileType.startsWith('video/')) return 'bxs-video';
  if (fileType.startsWith('audio/')) return 'bxs-music';
  if (fileType.includes('pdf')) return 'bxs-file-pdf';
  if (fileType.includes('word') || fileType.includes('document')) return 'bxs-file-doc';
  if (fileType.includes('sheet') || fileType.includes('excel')) return 'bxs-spreadsheet';
  if (fileType.includes('zip') || fileType.includes('rar')) return 'bxs-file-archive';
  return 'bxs-file';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function downloadFile(fileUrl, fileName) {
  const link = document.createElement('a');
  link.href = API_URL.replace('/api', '') + fileUrl;
  link.download = fileName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function deleteFile(fileId) {
  if (!confirm('Are you sure you want to delete this file?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      alert(data.error || 'Delete failed');
      return;
    }
    
    loadFiles();
  } catch (error) {
    console.error('Delete error:', error);
    alert('Network error. Please try again.');
  }
}

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/auth/index.html';
});

refreshBtn.addEventListener('click', () => {
  loadFiles();
});

loadFiles();
