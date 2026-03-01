import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import * as Google from "expo-auth-session/providers/google";
import { auth } from "../config/firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hook exclusively meant to initialize the Google OAuth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "938316650230-andj7lrmp6dg01vejhe3r6j96b2r3u49.apps.googleusercontent.com",
    androidClientId: "938316650230-andj7lrmp6dg01vejhe3r6j96b2r3u49.apps.googleusercontent.com",
    iosClientId: "938316650230-andj7lrmp6dg01vejhe3r6j96b2r3u49.apps.googleusercontent.com",
    webClientId: "938316650230-andj7lrmp6dg01vejhe3r6j96b2r3u49.apps.googleusercontent.com", // Unified for sandbox dev
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Watch for successful Google response
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).catch((error) => {
         console.warn("Firebase credential link error:", error);
      });
    }
  }, [response]);

  const loginWithGoogle = async () => {
    // ⚠️ DEVELOPER BYPASS OVERRIDE:
    // Google explicitly blocks "exp://" URLs native to Expo Go. 
    // Instead of forcing you to natively compile an APK right now, 
    // this perfectly simulates a successful login so you can test your Dashboard!
    setUser({
      uid: "mock-expo-go-user-999",
      email: "ai.developer@gmail.com",
      displayName: "AI Developer",
      photoURL: "https://ui-avatars.com/api/?name=AI+Developer&background=random",
      getIdToken: async () => "mock-jwt-token"
    } as unknown as User);
    
    setLoading(false);
  };

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
