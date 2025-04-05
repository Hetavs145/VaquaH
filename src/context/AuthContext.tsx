
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { userService, User } from '../services/userService';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      const currentUser = userService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    loadUser();

    // Initialize Google Sign-In
    const loadGoogleSignIn = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      window.onload = () => {
        console.log("Google Sign-In script loaded");
      };

      return () => {
        document.body.removeChild(script);
      };
    };

    loadGoogleSignIn();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userData = await userService.login({ email, password });
      setUser(userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.response?.data?.message || "Invalid email or password",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const userData = await userService.register({ name, email, password });
      setUser(userData);
      toast({
        title: "Registration successful",
        description: `Welcome to VaquaH, ${name}!`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.response?.data?.message || "Registration failed",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    userService.logout();
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      const updatedUser = await userService.updateProfile(userData);
      setUser(prev => prev ? { ...prev, ...updatedUser } : updatedUser);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.response?.data?.message || "Failed to update profile",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      // Call the googleAuthenticate method from userService
      const userData = await userService.googleAuthenticate("google-auth-token");
      setUser(userData);
      
      toast({
        title: "Google login successful",
        description: `Welcome, ${userData.name}!`,
      });
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        variant: "destructive",
        title: "Google login failed",
        description: "Unable to sign in with Google",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        signInWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
