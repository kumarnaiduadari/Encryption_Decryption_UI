import React from "react";
import {Navigate } from "react-router-dom";
import HomePage from "./HomePage";

import { useEffect } from 'react';

function HomeGuard() {

    
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

  
    const isAuthenticated = localStorage.getItem("authenticated");
    console.log("status:" + isAuthenticated);
  
    if (isAuthenticated === "true") {
      return <HomePage />;
    } else {
      return <Navigate to="/" />;
    }
  }
  
  export default HomeGuard;
  