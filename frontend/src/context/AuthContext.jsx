import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { adminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ensure users/{uid} exists
  const ensureUserDoc = async (firebaseUser) => {
    try {
      await adminService.ensureUserDocument(
        firebaseUser.uid, 
        firebaseUser.email, 
        firebaseUser.displayName
      );
    } catch (error) {
      console.error('Error ensuring user document:', error);
    }
  };

  // Check admin status from Firestore
  const checkAdminStatus = async (userId) => {
    try {
      const status = await adminService.checkAdminStatus(userId);
      return status;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return { isAdmin: false, role: 'user' };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          try { localStorage.setItem('userToken', token); } catch (_) {}

          await ensureUserDoc(user);
          const adminStatus = await checkAdminStatus(user.uid);

          setUser({
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: user.photoURL,
            isAdmin: adminStatus.isAdmin,
            role: adminStatus.role
          });
        } catch (error) {
          console.error('Error setting up user:', error);
          setUser({
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: user.photoURL,
            isAdmin: false,
            role: 'user'
          });
        }
      } else {
        try { localStorage.removeItem('userToken'); } catch (_) {}
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      try {
        const token = await user.getIdToken();
        localStorage.setItem('userToken', token);
      } catch (_) {}

      await ensureUserDoc(user);
      const adminStatus = await checkAdminStatus(user.uid);

      setUser({
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL,
        isAdmin: adminStatus.isAdmin,
        role: adminStatus.role
      });

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.displayName || user.email?.split('@')[0] || 'User'}!`,
      });
    } catch (error) {
      let errorMessage = "Login failed";
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later";
          break;
        default:
          errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateFirebaseProfile(user, { displayName: name });
      try {
        const token = await user.getIdToken();
        localStorage.setItem('userToken', token);
      } catch (_) {}

      await ensureUserDoc({ ...user, displayName: name });

      setUser({
        uid: user.uid,
        email: user.email,
        name: name,
        photoURL: user.photoURL,
        isAdmin: false,
        role: 'user'
      });

      toast({
        title: "Registration successful",
        description: `Welcome to VaquaH, ${name}!`,
      });
    } catch (error) {
      let errorMessage = "Registration failed";
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "An account with this email already exists";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address";
          break;
        case 'auth/weak-password':
          errorMessage = "Password should be at least 6 characters";
          break;
        default:
          errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Registration failed",
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      try {
        const token = await user.getIdToken();
        localStorage.setItem('userToken', token);
      } catch (_) {}

      await ensureUserDoc(user);
      const adminStatus = await checkAdminStatus(user.uid);

      setUser({
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL,
        isAdmin: adminStatus.isAdmin,
        role: adminStatus.role
      });

      toast({
        title: "Google login successful",
        description: `Welcome, ${user.displayName || user.email?.split('@')[0] || 'User'}!`,
      });
    } catch (error) {
      console.error('Google sign in error:', error);
      let errorMessage = "Google sign-in failed";

      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in was cancelled";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Pop-up was blocked. Please allow pop-ups for this site";
      } else {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Google login failed",
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      try { localStorage.removeItem('userToken'); } catch (_) {}
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "An error occurred while logging out",
      });
    }
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      if (auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, userData);
        setUser(prev => prev ? { ...prev, ...userData } : null);

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Failed to update profile",
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
