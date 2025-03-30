import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FaUpload, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [textResult, setTextResult] = useState('');
  const [fileResult, setFileResult] = useState(null);
  const [textError, setTextError] = useState('');
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Get email from localStorage
  const email = localStorage.getItem('email');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileResult(null);
    setFileError('');
  };

  const encryptFile = async () => {
    if (!file) {
      setFileError('Please select a file first.');
      return;
    }
    if (!email) {
      setFileError('No email found in local storage.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);

    try {
      const response = await axios.post('http://localhost:8000/encrypt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setFileResult({ url, name: `encrypted_${file.name}` });
      setFileError('');
    } catch (err) {
      setFileError(err.response?.data?.detail || 'File encryption failed.');
    }
  };

  const decryptFile = async () => {
    if (!file) {
      setFileError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/decrypt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setFileResult({ url, name: `decrypted_${file.name}` });
      setFileError('');
    } catch (err) {
      setFileError(err.response?.data?.detail || 'File decryption failed.');
    }
  };

  const encryptText = async () => {
    if (!text) {
      setTextError('Please enter text to encrypt.');
      return;
    }
    if (!email) {
      setTextError('No email found in local storage.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/encrypt_text', {
        email, // Include email only for encryption
        text

      });
      setTextResult(response.data.encrypted_text);
      setTextError('');
      setText('');
    } catch (err) {
      setTextError(err.response?.data?.detail || 'Text encryption failed.');
    }
  };

  const decryptText = async () => {
    if (!text) {
      setTextError('Please enter text to decrypt.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/decrypt_text', {encrypted_text: text});
      setTextResult(response.data.decrypted_text);
      setTextError('');
      setText('');
    } catch (err) {
      setTextError(err.response?.data?.detail || 'Text decryption failed.');
    }
  };

  const handleLogout = () => {
    localStorage.setItem("authenticated", "false");
    //localStorage.removeItem('email'); // Clear email on logout
    navigate('/', { state: { message: 'You have been logged out' } });
  };

  return (
    <div className="home-container">
      <header className="header">
        <h1>Welcome to Encrypt and Decrypt App</h1>
        <button className="logout-button" onClick={handleLogout} title="Logout">
          <FaSignOutAlt className="logout-icon" />
        </button>
      </header>

      <div className="cards-container">
        <div className="card">
          <div className="card-header">
            <h2>File Encryption</h2>
          </div>
          <div className="card-body">
            <div className="file-upload-container">
              <label htmlFor="file-upload" className="file-upload-label">
                <FaUpload className="upload-icon" />
                <span>{file ? file.name : 'Choose a file to upload'}</span>
              </label>
              <input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                className="file-input-hidden"
                onChange={handleFileChange}
              />
            </div>
            {fileError && (
              <p className="error-message">
                {typeof fileError === 'string' ? fileError : JSON.stringify(fileError)}
              </p>
            )}
            {fileResult && (
              <p className="result">
                <a href={fileResult.url} download={fileResult.name}>
                  Download {fileResult.name}
                </a>
              </p>
            )}
            <div className="button-group">
              <button className="action-button encrypt" onClick={encryptFile}>
                Encrypt File
              </button>
              <button className="action-button decrypt" onClick={decryptFile}>
                Decrypt File
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Text Encryption</h2>
          </div>
          <div className="card-body">
            <textarea
              className="text-input"
              placeholder="Enter your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
            {textError && (
              <p className="error-message">
                {Array.isArray(textError)
                  ? textError.map((err, index) => (
                    <div key={index}>
                      {err.msg} (Location: {err.loc.join(' -> ')})
                    </div>
                  ))
                  : typeof textError == 'string'
                    ? textError
                    : JSON.stringify(textError)}
              </p>
            )}
            {textResult && <p className="result">Result: {textResult}</p>}
            <div className="button-group">
              <button className="action-button encrypt" onClick={encryptText}>
                Encrypt Text
              </button>
              <button className="action-button decrypt" onClick={decryptText}>
                Decrypt Text
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;