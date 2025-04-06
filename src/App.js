import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import HomeGuard from "./components/HomeGuard";

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
