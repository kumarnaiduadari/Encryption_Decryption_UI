import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import HomeGuard from './components/HomeGuard';
import { AuthProvider } from './components/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/index" element={<AuthPage />} />
          <Route path="/" element={<AuthPage />} />
          <Route path="/home" element={<HomeGuard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
