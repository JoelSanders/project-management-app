import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and makes auth object available to any child component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to handle user login
  const login = async (email, password) => {
    try {
      setError('');
      // This would be replaced with an actual API call
      // For now, we'll simulate a successful login with mock data
      const userData = { id: '1', email, name: 'Test User', role: 'user' };
      
      // Store user data in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentUser(userData);
      return { success: true, requiresMfa: true }; // Simulate MFA requirement
    } catch (err) {
      setError('Failed to log in');
      return { success: false, error: err.message };
    }
  };

  // Function to handle MFA verification
  const verifyMfa = async (code) => {
    try {
      setError('');
      // This would be replaced with an actual API call to verify the MFA code
      // For now, we'll simulate a successful verification if code is "123456"
      if (code === '123456') {
        return { success: true };
      } else {
        setError('Invalid MFA code');
        return { success: false, error: 'Invalid MFA code' };
      }
    } catch (err) {
      setError('Failed to verify MFA');
      return { success: false, error: err.message };
    }
  };

  // Function to handle user registration
  const register = async (name, email, password) => {
    try {
      setError('');
      // This would be replaced with an actual API call
      // For now, we'll simulate a successful registration
      return { success: true };
    } catch (err) {
      setError('Failed to create an account');
      return { success: false, error: err.message };
    }
  };

  // Function to handle user logout
  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  // Value object that will be passed to any consuming components
  const value = {
    currentUser,
    login,
    register,
    logout,
    verifyMfa,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
