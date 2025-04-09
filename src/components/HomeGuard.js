import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import HomePage from "./HomePage";
import axios from "axios";
import LoadingPage from "../common/LoadingPage";

function HomeGuard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Session validation effect
  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/validate_session",
          { withCredentials: true } // Send cookies automatically
        );

        setIsAuthenticated(response.data.authenticated);
      } catch (error) {
        console.error("Session validation error:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  // Back button prevention effect (keep existing)
  useEffect(() => {
    const preventBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    preventBack();
    window.addEventListener("popstate", preventBack);

    return () => {
      window.removeEventListener("popstate", preventBack);
    };
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  return isAuthenticated ? <HomePage /> : <Navigate to="/" replace />;
}

export default HomeGuard;
