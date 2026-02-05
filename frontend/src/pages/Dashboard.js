import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Upload, 
  LogOut, 
  Trash2, 
  File, 
  Loader2, 
  Home, 
  FileText, 
  StickyNote, 
  Settings as SettingsIcon,
  Copy,
  Menu,
  X,
  Download,
  Eye,
  BarChart3,
  Edit2
} from 'lucide-react';
import Settings from './Settings';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Get greeting based on time of day (Asia/Calcutta timezone)
const getGreeting = () => {
  // Get current time in Asia/Calcutta (UTC+5:30)
  const now = new Date();
  const calcuttaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Calcutta' }));
  const hour = calcuttaTime.getHours();
  
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const { token, user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Active section
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Files state
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  // Notes state
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Text storage state
  const [texts, setTexts] = useState([]);
  const [textsLoading, setTextsLoading] = useState(false);
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [savingText, setSavingText] = useState(false);

  // General state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [greeting] = useState(getGreeting());

  // Preview modal state
  const [previewFile, setPreviewFile] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Storage stats state
  const [storageStats, setStorageStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Edit text state
  const [editingText, setEditingText] = useState(null);
  const [editTextTitle, setEditTextTitle] = useState('');
  const [editTextContent, setEditTextContent] = useState('');

  // Get display name
  const getDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    if (user?.phoneNumber) return user.phoneNumber;
    return 'User';
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Fetch data on section change
  useEffect(() => {
    if (isAuthenticated) {
      if (activeSection === 'myfiles' || activeSection === 'dashboard') {
        fetchFiles();
      }
      if (activeSection === 'notes' || activeSection === 'dashboard') {
        fetchNotes();
      }
      if (activeSection === 'textstorage' || activeSection === 'dashboard') {
        fetchTexts();
      }
      if (activeSection === 'dashboard') {
        fetchStorageStats();
        fetchAnalytics();
      }
      if (activeSection === 'analytics') {
        fetchAnalytics();
      }
    }
  }, [activeSection, isAuthenticated]);

  // Fetch storage stats
  const fetchStorageStats = async () => {
    setStatsLoading(true);
    try {
      const response = await axios.get(`${API}/storage/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStorageStats(response.data);
    } catch (error) {
      console.error('Fetch storage stats error:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await axios.get(`${API}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Fetch analytics error:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch files
  const fetchFiles = async () => {
    setFilesLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API}/files`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Fetch files error:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/');
      }
    } finally {
      setFilesLoading(false);
    }
  };

  // Fetch notes
  const fetchNotes = async () => {
    setNotesLoading(true);
    
    try {
      const response = await axios.get(`${API}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error('Fetch notes error:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/');
      }
    } finally {
      setNotesLoading(false);
    }
  };

  // Fetch texts
  const fetchTexts = async () => {
    setTextsLoading(true);
    
    try {
      const response = await axios.get(`${API}/texts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTexts(response.data.texts || []);
    } catch (error) {
      console.error('Fetch texts error:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/');
      }
    } finally {
      setTextsLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setSuccess('');
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await axios.post(`${API}/files/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      setSuccess('File uploaded successfully!');
      setSelectedFile(null);
      document.getElementById('file-input').value = '';
      await fetchFiles();
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle file delete
  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Delete this file?')) return;

    try {
      await axios.delete(`${API}/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('File deleted successfully!');
      await fetchFiles();
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.response?.data?.detail || 'Delete failed');
    }
  };

  // Handle save note
  const handleSaveNote = async (e) => {
    e.preventDefault();
    setSavingNote(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(
        `${API}/notes`,
        { title: noteTitle, content: noteContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Note saved successfully!');
      setNoteTitle('');
      setNoteContent('');
      await fetchNotes();
    } catch (error) {
      console.error('Save note error:', error);
      setError(error.response?.data?.detail || 'Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  // Handle delete note
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;

    try {
      await axios.delete(`${API}/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Note deleted successfully!');
      await fetchNotes();
    } catch (error) {
      console.error('Delete note error:', error);
      setError(error.response?.data?.detail || 'Delete failed');
    }
  };

  // Handle save text
  const handleSaveText = async (e) => {
    e.preventDefault();
    setSavingText(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(
        `${API}/texts`,
        { title: textTitle, content: textContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Text saved successfully!');
      setTextTitle('');
      setTextContent('');
      await fetchTexts();
    } catch (error) {
      console.error('Save text error:', error);
      setError(error.response?.data?.detail || 'Failed to save text');
    } finally {
      setSavingText(false);
    }
  };

  // Handle delete text
  const handleDeleteText = async (textId) => {
    if (!window.confirm('Delete this text?')) return;

    try {
      await axios.delete(`${API}/texts/${textId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Text deleted successfully!');
      await fetchTexts();
    } catch (error) {
      console.error('Delete text error:', error);
      setError(error.response?.data?.detail || 'Delete failed');
    }
  };

  // Copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  // Handle file preview
  const handlePreviewFile = (file) => {
    setPreviewFile(file);
    setPreviewModalOpen(true);
  };

  // Handle file download
  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const response = await axios.get(`${API}/files/download/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download file');
    }
  };

  // Handle edit text
  const handleEditText = (text) => {
    setEditingText(text);
    setEditTextTitle(text.title);
    setEditTextContent(text.content);
  };

  // Handle update text
  const handleUpdateText = async (e) => {
    e.preventDefault();
    setSavingText(true);
    setError('');
    setSuccess('');

    try {
      await axios.put(
        `${API}/texts/${editingText._id}`,
        { title: editTextTitle, content: editTextContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Text updated successfully!');
      setEditingText(null);
      setEditTextTitle('');
      setEditTextContent('');
      await fetchTexts();
    } catch (error) {
      console.error('Update text error:', error);
      setError(error.response?.data?.detail || 'Failed to update text');
    } finally {
      setSavingText(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Sidebar items
  const sidebarItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'upload', icon: Upload, label: 'Upload' },
    { id: 'myfiles', icon: File, label: 'My Files' },
    { id: 'notes', icon: StickyNote, label: 'Notes' },
    { id: 'textstorage', icon: FileText, label: 'Text Storage' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo / Title */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-blue-600">Cloud Storage</h1>
            <p className="text-sm text-gray-500 mt-1">Secure & Reliable</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${activeSection === item.id
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 md:px-6 py-4 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Greeting */}
            <div className="flex-1 md:flex-none">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                {greeting}, {getDisplayName()}! 👋
              </h2>
              <p className="text-sm text-gray-600 hidden md:block">
                Welcome back to your cloud storage
              </p>
            </div>

            {/* User Info */}
            <div className="hidden md:flex items-center gap-3 text-sm text-gray-600">
              <span>{user?.email || user?.phoneNumber}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-6">
          {/* Global Alerts */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 border-green-500 bg-green-50">
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Dashboard Overview</h3>
                <p className="text-gray-600 mt-1">Quick overview of your cloud storage</p>
              </div>

              {/* Storage Stats */}
              {storageStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Storage Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>
                          {(storageStats.storageUsed / (1024 * 1024 * 1024)).toFixed(2)} GB used of{' '}
                          {(storageStats.storageLimit / (1024 * 1024 * 1024)).toFixed(0)} GB
                        </span>
                        <span className="font-medium">{storageStats.percentageUsed.toFixed(1)}%</span>
                      </div>
                      <Progress value={storageStats.percentageUsed} className="h-2" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{storageStats.fileCount}</p>
                        <p className="text-sm text-gray-600">Files</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{storageStats.notesCount}</p>
                        <p className="text-sm text-gray-600">Notes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{storageStats.textsCount}</p>
                        <p className="text-sm text-gray-600">Texts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">Total Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">{files.length}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">Total Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">{notes.length}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">Text Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-purple-600">{texts.length}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Files */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Files</CardTitle>
                </CardHeader>
                <CardContent>
                  {filesLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    </div>
                  ) : files.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No files uploaded yet</p>
                  ) : (
                    <div className="space-y-2">
                      {files.slice(0, 5).map((file) => (
                        <div key={file._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <File className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm">{file.originalName}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(file.uploadedAt)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Upload Section */}
          {activeSection === 'upload' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Upload Files</h3>
                <p className="text-gray-600 mt-1">Upload your files to the cloud</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>File Upload</CardTitle>
                  <CardDescription>Select a file to upload (Max 50MB)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 items-end flex-col sm:flex-row">
                    <div className="flex-1 w-full">
                      <Input
                        id="file-input"
                        type="file"
                        onChange={handleFileSelect}
                        disabled={uploading}
                      />
                    </div>
                    <Button 
                      onClick={handleUpload} 
                      disabled={!selectedFile || uploading}
                      className="w-full sm:w-auto"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {uploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-gray-600 text-center">
                        Uploading: {uploadProgress}%
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* My Files Section */}
          {activeSection === 'myfiles' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">My Files</h3>
                <p className="text-gray-600 mt-1">View and manage your uploaded files</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Files ({files.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {filesLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-10 w-10 animate-spin mx-auto text-gray-400" />
                    </div>
                  ) : files.length === 0 ? (
                    <div className="text-center py-12">
                      <File className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No files uploaded yet</p>
                      <Button
                        onClick={() => setActiveSection('upload')}
                        className="mt-4"
                      >
                        Upload Your First File
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {files.map((file) => (
                        <div key={file._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {file.fileType.startsWith('image/') ? (
                              <img 
                                src={`${BACKEND_URL}${file.fileUrl}`} 
                                alt={file.originalName}
                                className="h-12 w-12 object-cover rounded flex-shrink-0"
                              />
                            ) : file.fileType === 'application/pdf' ? (
                              <FileText className="h-8 w-8 text-red-500 flex-shrink-0" />
                            ) : (
                              <File className="h-8 w-8 text-blue-500 flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{file.originalName}</p>
                              <div className="flex gap-4 mt-1">
                                <span className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</span>
                                <span className="text-xs text-gray-500">{formatDate(file.uploadedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {(file.fileType.startsWith('image/') || file.fileType === 'application/pdf') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePreviewFile(file)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadFile(file._id, file.originalName)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteFile(file._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notes Section */}
          {activeSection === 'notes' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Notes</h3>
                <p className="text-gray-600 mt-1">Create and manage your notes</p>
              </div>

              {/* Create Note */}
              <Card>
                <CardHeader>
                  <CardTitle>Create Note</CardTitle>
                  <CardDescription>Write a quick note</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveNote} className="space-y-4">
                    <Input
                      placeholder="Note title"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      required
                    />
                    <Textarea
                      placeholder="Note content..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={4}
                      required
                    />
                    <Button type="submit" disabled={savingNote}>
                      {savingNote ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Note'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Notes List */}
              <Card>
                <CardHeader>
                  <CardTitle>All Notes ({notes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {notesLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-10 w-10 animate-spin mx-auto text-gray-400" />
                    </div>
                  ) : notes.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">No notes yet</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {notes.map((note) => (
                        <Card key={note._id} className="relative">
                          <CardHeader>
                            <CardTitle className="text-lg pr-8">{note.title}</CardTitle>
                            <CardDescription className="text-xs">
                              {formatDate(note.updatedAt)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                              {note.content}
                            </p>
                          </CardContent>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-4 right-4"
                            onClick={() => handleDeleteNote(note._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Text Storage Section */}
          {activeSection === 'textstorage' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Text Storage</h3>
                <p className="text-gray-600 mt-1">Store and manage large text snippets</p>
              </div>

              {/* Save Text */}
              <Card>
                <CardHeader>
                  <CardTitle>Save Text</CardTitle>
                  <CardDescription>Store long text, code, or any content</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveText} className="space-y-4">
                    <Input
                      placeholder="Text title"
                      value={textTitle}
                      onChange={(e) => setTextTitle(e.target.value)}
                      required
                    />
                    <Textarea
                      placeholder="Paste your text content here..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      rows={8}
                      required
                    />
                    <Button type="submit" disabled={savingText}>
                      {savingText ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Text'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Texts List */}
              <Card>
                <CardHeader>
                  <CardTitle>Saved Texts ({texts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {textsLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-10 w-10 animate-spin mx-auto text-gray-400" />
                    </div>
                  ) : texts.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">No text saved yet</p>
                  ) : (
                    <div className="space-y-4">
                      {texts.map((text) => (
                        <Card key={text._id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{text.title}</CardTitle>
                                <CardDescription className="text-xs">
                                  {formatDate(text.updatedAt)}
                                </CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(text.content)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteText(text._id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                              <pre className="text-sm whitespace-pre-wrap font-mono">
                                {text.content}
                              </pre>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
