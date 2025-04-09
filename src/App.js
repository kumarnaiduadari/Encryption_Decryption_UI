import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import HomeGuard from "./components/HomeGuard";
import axios from "axios";

axios.defaults.withCredentials = true; // Enables cookie handling
axios.defaults.baseURL = "http://localhost:8000"; // Base URL for all requests

/* axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized errors globally
      window.location.href = "/"; // Redirect to login
    }
    return Promise.reject(error);
  }
); */

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/index" element={<AuthPage />} />
        <Route path="/" element={<AuthPage />} />
        <Route path="/home" element={<HomeGuard />} />
      </Routes>
    </Router>
  );
};

export default App;
