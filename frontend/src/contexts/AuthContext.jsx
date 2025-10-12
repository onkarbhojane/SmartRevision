import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Axios instance
const authAPI = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Global error interceptor
authAPI.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
);

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // ---- TOKEN MANAGEMENT ----
  const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  const getTokens = () => ({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  });

  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  // ---- INITIALIZE AUTH ----
  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = localStorage.getItem('user');
      const { accessToken } = getTokens();
      if (storedUser && accessToken) setUser(JSON.parse(storedUser));
      setLoading(false);
    };
    initializeAuth();
  }, []);

  // ---- AUTO REFRESH TOKEN EVERY 15 MINUTES ----
  useEffect(() => {
    const { refreshToken } = getTokens();
    if (!refreshToken) return;

    const refreshAuthToken = async () => {
      try {
        const { data } = await authAPI.post('/auth/refresh', { refreshToken });
        setTokens(data.accessToken, data.refreshToken);
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
      }
    };

    const interval = setInterval(refreshAuthToken, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  // ---- LOGIN ----
  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const { status, data } = await authAPI.post('/auth/login', { email, password });

      if (status === 200) {
        const userData = {
          id: data.user._id || data.user.id,
          email: data.user.email || data.user.email_id,
          name: data.user.name,
          avatar: data.user.avatar || '',
          role: data.user.role || 'user',
        };

        setTokens(data.accessToken, data.refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        toast.success(`Welcome back, ${userData.name}!`);
        return { success: true, user: userData };
      } else {
        toast.error(data.msg || 'Login failed');
        return { success: false, error: data.msg || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.msg || 'Login failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  };

  // ---- REGISTER ----
  const register = async (userData) => {
    setAuthLoading(true);
    try {
      const { status, data } = await authAPI.post('/auth/register', userData);

      if (status === 201) {
        const newUser = {
          id: data.user._id,
          email: data.user.email_id,
          name: data.user.name,
          avatar: data.user.avatar || '',
          role: data.user.role || 'user',
        };

        setTokens(data.accessToken, data.refreshToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);

        toast.success(`Welcome to SmartLearnAI, ${newUser.name}!`);
        return { success: true, user: newUser };
      } else if (status === 400) {
        toast.error(data.msg || 'User already exists');
        return { success: false, error: data.msg || 'User already exists' };
      } else {
        toast.error(data.msg || 'Registration failed');
        return { success: false, error: data.msg || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.msg || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  };

  // ---- LOGOUT ----
  const logout = async () => {
    try {
      const { accessToken } = getTokens();
      if (accessToken) {
        await authAPI.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${accessToken}` } });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearTokens();
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  // ---- UPDATE PROFILE ----
  const updateProfile = async (profileData) => {
    try {
      const { accessToken } = getTokens();
      const { data } = await authAPI.put('/auth/profile', profileData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const updatedUser = { ...user, ...data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success('Profile updated successfully');
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('Failed to update profile');
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  };

  // ---- CHANGE PASSWORD ----
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { accessToken } = getTokens();
      const { data } = await authAPI.post(
        '/auth/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (data.success) {
        toast.success('Password changed successfully');
        return { success: true };
      } else {
        toast.error(data.msg || 'Password change failed');
        return { success: false, error: data.msg };
      }
    } catch (error) {
      console.error('Password change failed:', error);
      toast.error('Failed to change password');
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  };

  // ---- FORGOT PASSWORD ----
  const forgotPassword = async (email) => {
    try {
      const { data } = await authAPI.post('/auth/forgot-password', { email });

      if (data.success) {
        toast.success('Password reset instructions sent to your email');
        return { success: true };
      } else {
        toast.error(data.msg || 'Password reset failed');
        return { success: false, error: data.msg };
      }
    } catch (error) {
      console.error('Forgot password failed:', error);
      toast.error('Failed to send reset instructions');
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  };

  // ---- RESET PASSWORD ----
  const resetPassword = async (token, newPassword) => {
    try {
      const { data } = await authAPI.post('/auth/reset-password', { token, newPassword });

      if (data.success) {
        toast.success('Password reset successfully');
        return { success: true };
      } else {
        toast.error(data.msg || 'Password reset failed');
        return { success: false, error: data.msg };
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      toast.error('Failed to reset password');
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  };

  const value = {
    user,
    loading,
    authLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    getTokens,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
