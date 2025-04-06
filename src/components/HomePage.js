import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaUpload, FaSignOutAlt, FaCopy } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [textResult, setTextResult] = useState("");
  const [fileResult, setFileResult] = useState(null);
  const [textError, setTextError] = useState("");
  const [fileError, setFileError] = useState("");
  const [showResultCard, setShowResultCard] = useState(false); // State to toggle result card
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  const email = localStorage.getItem("email");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileResult(null);
    setFileError("");
  };
  const encryptFile = async () => {
    if (!file) {
      setFileError("Please select a file first.");
      return;
    }
    if (!email) {
      setFileError("No email found in local storage.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);

    try {
      const response = await axios.post(
        "http://localhost:8000/encrypt",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      ); // Remove responseType: 'blob'
      const filePath = response.data.file_path; // Get the file path from the response

      // Create a download link and trigger the download
      const link = document.createElement("a");
      link.href = `http://localhost:8000/download?file_path=${encodeURIComponent(
        filePath
      )}`; // Create a download URL
      link.setAttribute("download", `${file.name}.enc`); // Set the download filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setFileResult({ url: null, name: `${file.name}.enc` }); // Update fileResult
      setFileError("");
    } catch (err) {
      setFileError(err.response?.data?.detail || "File encryption failed.");
    }
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const email = localStorage.getItem("email");
        if (email) {
          const response = await axios.post(
            "http://localhost:8000/get_user_full_name",
            { email } // Send as request body
          );
          setUserName(response.data.full_name || "User");
        }
      } catch (error) {
        console.error("Couldn't fetch user name:", error);
        setUserName("User");
      }
    };

    fetchUserName();
  }, []);

  const decryptFile = async () => {
    if (!file) {
      setFileError("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:8000/decrypt",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const filePath = response.data.file_path;

      // Remove .enc from the filename
      let decryptedFileName = file.name;
      if (decryptedFileName.endsWith(".enc")) {
        decryptedFileName = decryptedFileName.slice(0, -4); // Remove last 4 characters (.enc)
      }

      // Create a download link and trigger the download
      const link = document.createElement("a");
      link.href = `http://localhost:8000/download?file_path=${encodeURIComponent(
        filePath
      )}`;
      link.setAttribute("download", decryptedFileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setFileResult({ url: null, name: decryptedFileName });
      setFileError("");
    } catch (err) {
      setFileError(err.response?.data?.detail || "File decryption failed.");
    }
  };

  const downloadFile = () => {
    if (!fileResult || !fileResult.url) {
      setFileError("No file available for download.");
      return;
    }

    const link = document.createElement("a");
    link.href = fileResult.url;
    link.setAttribute("download", fileResult.name || "encrypted_file.enc");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const encryptText = async () => {
    if (!text) {
      setTextError("Please enter text to encrypt.");
      return;
    }
    if (!email) {
      setTextError("No email found in local storage.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/encrypt_text", {
        email,
        text,
      });
      setTextResult(response.data.encrypted_text);
      setTextError("");
      setText("");
      setShowResultCard(true); // Show result card
    } catch (err) {
      setTextError(err.response?.data?.detail || "Text encryption failed.");
    }
  };

  const decryptText = async () => {
    if (!text) {
      setTextError("Please enter text to decrypt.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/decrypt_text", {
        encrypted_text: text,
      });
      setTextResult(response.data.decrypted_text);
      setTextError("");
      setText("");
      setShowResultCard(true); // Show result card
    } catch (err) {
      setTextError(err.response?.data?.detail || "Text decryption failed.");
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(textResult);
    alert("Text copied to clipboard!");
  };

  const handleLogout = () => {
    localStorage.setItem("authenticated", "false");
    navigate("/", { state: { message: "You have been logged out" } });
  };

  return (
    <div className="home-container">
      <header className="header">
        <h1>Welcome {userName || "User"} to Encrypt and Decrypt WebApp</h1>
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
                <span>{file ? file.name : "Choose a file to upload"}</span>
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
                {typeof fileError === "string"
                  ? fileError
                  : JSON.stringify(fileError)}
              </p>
            )}
            {fileResult && (
              <button className="download-btn" onClick={downloadFile}>
                Download {fileResult.name}
              </button>
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
                        {err.msg} (Location: {err.loc.join(" -> ")})
                      </div>
                    ))
                  : typeof textError === "string"
                  ? textError
                  : JSON.stringify(textError)}
              </p>
            )}
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

      {/* Result Card */}
      {showResultCard && (
        <div className="result-card">
          <div className="card-header-text">
            <h3>Encrypted /Decrypted Text</h3>
            <FaCopy
              className="copy-icon"
              onClick={copyToClipboard}
              title="Copy to clipboard"
            />
            <button
              className="close-button"
              onClick={() => setShowResultCard(false)}
            >
              ×
            </button>
          </div>
          <div className="card-body-result">
            <div className="result-content">
              <p className="text-result">{textResult}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
