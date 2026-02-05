import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, LogOut, Trash2, File, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const Dashboard = () => {
  const { token, user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [greeting] = useState(getGreeting());

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Fetch files on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles();
    }
  }, [isAuthenticated]);

  // Fetch user files
  const fetchFiles = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API}/files`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Fetch files error:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        logout();
        navigate('/');
      } else {
        setError('Failed to fetch files');
      }
    } finally {
      setLoading(false);
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
      const response = await axios.post(`${API}/files/upload`, formData, {
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
      // Reset file input
      document.getElementById('file-input').value = '';
      // Refresh file list
      await fetchFiles();
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        logout();
        navigate('/');
      } else if (error.response) {
        setError(error.response.data.error || 'Upload failed');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle file delete
  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    setError('');
    
    try {
      await axios.delete(`${API}/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('File deleted successfully!');
      await fetchFiles();
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        logout();
        navigate('/');
      } else if (error.response) {
        setError(error.response.data.error || 'Delete failed');
      } else {
        setError('Network error. Please try again.');
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow p-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">File Storage Dashboard</h1>
            <p className="text-sm text-gray-600">
              {user?.email || user?.phoneNumber || 'User'}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>
              Select a file to upload to your cloud storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
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
                  {uploadProgress}% uploaded
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-50">
                <AlertDescription className="text-green-700">
                  {success}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Files List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Files</CardTitle>
            <CardDescription>
              {files.length} file{files.length !== 1 ? 's' : ''} uploaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <File className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No files uploaded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file._id}>
                        <TableCell className="font-medium">
                          {file.originalName}
                        </TableCell>
                        <TableCell>{file.fileType}</TableCell>
                        <TableCell>{formatFileSize(file.fileSize)}</TableCell>
                        <TableCell>{formatDate(file.uploadedAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(file._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
