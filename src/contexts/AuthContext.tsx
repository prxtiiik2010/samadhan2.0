import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User, GoogleAuthProvider, signInWithPopup, signInAnonymously } from "firebase/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // We no longer gate by admin email/claims; treat any signed-in user as allowed for admin routes
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      // Allow any authenticated user
      setIsAdmin(Boolean(firebaseUser));
      setLoading(false);
      
      // If no user, try silent anonymous sign-in to satisfy read rules without explicit login
      if (!firebaseUser) {
        try {
          await signInAnonymously(auth);
        } catch {
          // ignore; anonymous provider may be disabled
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async signInWithEmail(email: string, password: string) {
        await signInWithEmailAndPassword(auth, email, password);
      },
      async signOutUser() {
        await signOut(auth);
      },
      async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      },
      isAdmin,
    }),
    [user, loading, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="p-8 text-center">Checking authentication…</div>;
  }
  if (!user) {
    return <div className="p-8 text-center">Unauthorized</div>;
  }
  return children;
};

export const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="p-8 text-center">Checking authentication…</div>;
  }
  if (!user) {
    return <div className="p-8 text-center">Unauthorized</div>;
  }
  return children;
};
