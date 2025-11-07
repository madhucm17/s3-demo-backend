import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

const API_URL = 'http://13.201.127.30:9092';

function App() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSingleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setSuccess('');
    }
  };

  const handleMultipleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      setError('');
      setSuccess('');
    }
  };

  const handleSingleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(response.data.message);
      setUploadedFiles([response.data]);
      setFile(null);
      document.getElementById('single-file-input').value = '';
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleMultipleUpload = async () => {
    if (files.length === 0) {
      setError('Please select files');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(`${API_URL}/upload-multiple`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(response.data.message);
      setUploadedFiles(response.data.files);
      setFiles([]);
      document.getElementById('multiple-file-input').value = '';
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="App">
      <div className="container">
        <h1>📤 File Upload to S3</h1>
        <p className="subtitle">Upload your files directly to Amazon S3</p>

        <div className="upload-sections">
          {/* Single File Upload */}
          <div className="upload-section">
            <h2>Single File Upload</h2>
            <div className="upload-box">
              <input
                id="single-file-input"
                type="file"
                onChange={handleSingleFileChange}
                className="file-input"
              />
              {file && (
                <div className="file-info">
                  <p><strong>Selected:</strong> {file.name}</p>
                  <p><strong>Size:</strong> {formatFileSize(file.size)}</p>
                  <p><strong>Type:</strong> {file.type}</p>
                </div>
              )}
              <button
                onClick={handleSingleUpload}
                disabled={!file || uploading}
                className="upload-btn"
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
          </div>

          {/* Multiple File Upload */}
          <div className="upload-section">
            <h2>Multiple File Upload</h2>
            <div className="upload-box">
              <input
                id="multiple-file-input"
                type="file"
                multiple
                onChange={handleMultipleFilesChange}
                className="file-input"
              />
              {files.length > 0 && (
                <div className="file-info">
                  <p><strong>Selected {files.length} file(s):</strong></p>
                  <ul>
                    {files.map((f, index) => (
                      <li key={index}>
                        {f.name} ({formatFileSize(f.size)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={handleMultipleUpload}
                disabled={files.length === 0 || uploading}
                className="upload-btn"
              >
                {uploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="message error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="message success">
            <strong>Success:</strong> {success}
          </div>
        )}

        {/* Uploaded Files Display */}
        {uploadedFiles.length > 0 && (
          <div className="uploaded-files">
            <h2>Uploaded Files</h2>
            <div className="files-grid">
              {uploadedFiles.map((uploadedFile, index) => (
                <div key={index} className="file-card">
                  <div className="file-header">
                    <h3>{uploadedFile.fileName}</h3>
                  </div>
                  <div className="file-details">
                    <p><strong>Size:</strong> {formatFileSize(uploadedFile.fileSize)}</p>
                    <p><strong>Type:</strong> {uploadedFile.fileType}</p>
                  </div>
                  <div className="file-actions">
                    <a
                      href={uploadedFile.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-btn"
                    >
                      View File
                    </a>
                    <button
                      onClick={() => navigator.clipboard.writeText(uploadedFile.fileUrl)}
                      className="copy-btn"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

