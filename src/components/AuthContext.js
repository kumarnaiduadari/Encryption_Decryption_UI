
import React, { createContext, useContext, useState } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Custom Hook to access Auth Context
export const useAuth = () => useContext(AuthContext);

// AuthProvider component to wrap the app
export const AuthProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(null);

  return (
    <AuthContext.Provider value={{ userEmail, setUserEmail }}>
      {children}
    </AuthContext.Provider>
  );
};
