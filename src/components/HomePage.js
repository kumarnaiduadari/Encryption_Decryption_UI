import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaUpload, FaSignOutAlt, FaCopy } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import LoadingPage from "../common/LoadingPage";

const HomePage = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [textResult, setTextResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileResult, setFileResult] = useState(null);
  const [textError, setTextError] = useState("");
  const [fileError, setFileError] = useState("");
  const [showResultCard, setShowResultCard] = useState(false); // State to toggle result card
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const validateSession = async () => {
    try {
      const response = await axios.get("/current_user", {
        withCredentials: true,
      });
      return !!response.data.email;
    } catch (error) {
      console.error("Session validation failed:", error);
      return false;
    }
  };

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const isValidSession = await validateSession();
        if (!isValidSession) {
          window.location.href = "/";
          return;
        }
        const response = await axios.get("/current_user");
        setUserEmail(response.data.email);
        console.log("Email id for current user : ", response.data.email);
      } catch (error) {
        console.error("Error fetching user email:", error);
        // Handle unauthorized access
        if (error.response?.status === 401) {
          window.location.href = "/";
        }
      }
    };

    fetchUserEmail();
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const isValidSession = await validateSession();
        if (!isValidSession) {
          window.location.href = "/";
          return;
        }
        console.log("Email for full name :", userEmail);
        if (userEmail) {
          const response = await axios.post(
            "http://localhost:8000/get_user_full_name",
            { email: userEmail } // Send as request body
          );
          setUserName(response.data.full_name || "User");
        }
      } catch (error) {
        console.error("Couldn't fetch user name:", error);
        setUserName("User");
      }
    };

    fetchUserName();
  }, [userEmail]);
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileResult(null);
    setFileError("");
  };
  const encryptFile = async () => {
    const isValidSession = await validateSession();
    if (!isValidSession) {
      window.location.href = "/";
      return;
    }
    if (!file) {
      setFileError("Please select a file first.");
      return;
    }
    if (!userEmail) {
      setFileError("No email found.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", userEmail);
    setLoading(true);
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
      setFileResult({
        url: `http://localhost:8000/download?file_path=${encodeURIComponent(
          filePath
        )}`,
        name: `${file.name}.enc`,
      });
      setFileError("");
    } catch (err) {
      setFileError(err.response?.data?.detail || "File encryption failed.");
    }
    setLoading(false);
  };

  const decryptFile = async () => {
    const isValidSession = await validateSession();
    if (!isValidSession) {
      window.location.href = "/";
      return;
    }
    if (!file) {
      setFileError("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
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

      setFileResult({
        url: `http://localhost:8000/download?file_path=${encodeURIComponent(
          filePath
        )}`,
        name: `${file.name}.enc`,
      });
      setFileError("");
    } catch (err) {
      setFileError(err.response?.data?.detail || "File decryption failed.");
    }
    setLoading(false);
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
    const isValidSession = await validateSession();
    if (!isValidSession) {
      window.location.href = "/";
      return;
    }
    if (!text) {
      setTextError("Please enter text to encrypt.");
      return;
    }
    if (!userEmail) {
      setTextError("No email found.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/encrypt_text", {
        email: userEmail,
        text,
      });
      setTextResult(response.data.encrypted_text);
      setTextError("");
      setText("");
      setShowResultCard(true); // Show result card
    } catch (err) {
      setTextError(err.response?.data?.detail || "Text encryption failed.");
    }
    setLoading(false);
  };

  const decryptText = async () => {
    const isValidSession = await validateSession();
    if (!isValidSession) {
      window.location.href = "/";
      return;
    }
    if (!text) {
      setTextError("Please enter text to decrypt.");
      return;
    }
    setLoading(true);
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
    setLoading(false);
  };

  // Function to copy text to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(textResult);
    alert("Text copied to clipboard!");
  };

  const handleLogout = async () => {
    await axios.post(
      "http://localhost:8000/logout",
      {},
      {
        withCredentials: true,
      }
    );
    window.history.pushState(null, "", "/");
    navigate("/", { replace: true });
  };

  return (
    <div className="ed-home-container">
      {loading && <LoadingPage />}
      <header className="ed-header">
        <h1>Welcome {userName || "User"} to Encrypt and Decrypt WebApp</h1>
        <button
          className="ed-logout-button"
          onClick={handleLogout}
          title="Logout"
        >
          <FaSignOutAlt className="ed-logout-icon" />
        </button>
      </header>
      <div className="ed-cards-container">
        <div className="ed-card">
          <div className="ed-card-header">
            <h2>File Encryption</h2>
          </div>
          <div className="ed-card-body">
            <div className="ed-file-upload-container">
              <label htmlFor="ed-file-upload" className="ed-file-upload-label">
                <FaUpload className="ed-upload-icon" />
                <span>{file ? file.name : "Choose a file to upload"}</span>
              </label>
              <input
                id="ed-file-upload"
                type="file"
                ref={fileInputRef}
                className="ed-file-input-hidden"
                onChange={handleFileChange}
              />
            </div>
            {fileError && (
              <p className="ed-error-message">
                {typeof fileError === "string"
                  ? fileError
                  : JSON.stringify(fileError)}
              </p>
            )}
            {fileResult && (
              <button className="ed-download-btn" onClick={downloadFile}>
                Download {fileResult.name}
              </button>
            )}
            <div className="ed-button-group">
              <button
                className="ed-action-button ed-encrypt"
                onClick={encryptFile}
              >
                Encrypt File
              </button>
              <button
                className="ed-action-button ed-decrypt"
                onClick={decryptFile}
              >
                Decrypt File
              </button>
            </div>
          </div>
        </div>

        <div className="ed-card">
          <div className="ed-card-header">
            <h2>Text Encryption</h2>
          </div>
          <div className="ed-card-body">
            <textarea
              className="ed-text-input"
              placeholder="Enter your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
            {textError && (
              <p className="ed-error-message">
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
            <div className="ed-button-group">
              <button
                className="ed-action-button ed-encrypt"
                onClick={encryptText}
              >
                Encrypt Text
              </button>
              <button
                className="ed-action-button ed-decrypt"
                onClick={decryptText}
              >
                Decrypt Text
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Result Card */}
      {showResultCard && (
        <div className="ed-result-card">
          <div className="ed-card-header-text">
            <h3>Encrypted /Decrypted Text</h3>
            <FaCopy
              className="ed-copy-icon"
              onClick={copyToClipboard}
              title="Copy to clipboard"
            />
            <button
              className="ed-close-button"
              onClick={() => setShowResultCard(false)}
            >
              ×
            </button>
          </div>
          <div className="ed-card-body-result">
            <div className="ed-result-content">
              <p className="ed-text-result">{textResult}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
