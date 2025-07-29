import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseAvailable } from '../lib/supabase';

export type UserRole = 'household' | 'collector' | 'company' | 'admin';

interface AuthUser extends User {
  role?: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: AuthUser | null; error: any }>;
  signUp: (email: string, password: string, userData: any, role: UserRole) => Promise<{ user: AuthUser | null; error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const getInitialSession = async () => {
      try {
        if (supabase && isSupabaseAvailable()) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const authUser: AuthUser = {
              ...session.user,
              role: session.user.user_metadata?.role as UserRole || 'household'
            };
            setUser(authUser);
          }
        } else {
          // Demo mode - check localStorage for mock user
          const demoUser = localStorage.getItem('demoUser');
          if (demoUser) {
            setUser(JSON.parse(demoUser));
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    if (supabase && isSupabaseAvailable()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
          
          if (session?.user) {
            const authUser: AuthUser = {
              ...session.user,
              role: session.user.user_metadata?.role as UserRole || 'household'
            };
            setUser(authUser);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<{ user: AuthUser | null; error: any }> => {
    // Always try demo mode first for better UX
    const demoUsers = {
      'admin@wastechain.ai': { role: 'admin', name: 'Admin User' },
      'household@demo.com': { role: 'household', name: 'Demo Household' },
      'collector@demo.com': { role: 'collector', name: 'Demo Collector' },
      'company@demo.com': { role: 'company', name: 'Demo Company' }
    };

    const demoUserData = demoUsers[email as keyof typeof demoUsers];
    if (demoUserData && password === 'demo123') {
      const mockUser: AuthUser = {
        id: `demo-${demoUserData.role}`,
        email,
        role: demoUserData.role as UserRole,
        user_metadata: {
          role: demoUserData.role,
          full_name: demoUserData.name
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        app_metadata: {},
        confirmed_at: new Date().toISOString()
      };

      setUser(mockUser);
      localStorage.setItem('demoUser', JSON.stringify(mockUser));
      return { user: mockUser, error: null };
    }

    // Try Supabase if demo credentials don't match
    if (supabase && isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (data.user) {
          const authUser: AuthUser = {
            ...data.user,
            role: data.user.user_metadata?.role as UserRole || 'household'
          };
          setUser(authUser);
          return { user: authUser, error: null };
        }
      } catch (supabaseError) {
        console.warn('Supabase authentication failed, falling back to demo mode:', supabaseError);
        // Fall through to error below
      }
    }

    // If we get here, neither demo nor Supabase worked
    return { user: null, error: new Error('Invalid credentials. Try demo credentials or check your connection.') };
  };

  const signUp = async (
    email: string,
    password: string,
    userData: any,
    role: UserRole
  ): Promise<{ user: AuthUser | null; error: any }> => {
    // Try Supabase first for sign up if available
    if (supabase && isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
              ...userData
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          const authUser: AuthUser = {
            ...data.user,
            role
          };
          return { user: authUser, error: null };
        }
      } catch (supabaseError) {
        console.warn('Supabase signup failed, falling back to demo mode:', supabaseError);
        // Fall through to demo mode
      }
    }

    // Demo mode sign up (fallback or primary)
    const mockUser: AuthUser = {
      id: `demo-${role}-${Date.now()}`,
      email,
      role,
      user_metadata: {
        role,
        ...userData
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      app_metadata: {},
      confirmed_at: new Date().toISOString()
    };

    setUser(mockUser);
    localStorage.setItem('demoUser', JSON.stringify(mockUser));
    return { user: mockUser, error: null };
  };

  const signOut = async (): Promise<void> => {
    try {
      if (supabase && isSupabaseAvailable()) {
        await supabase.auth.signOut();
      } else {
        // Demo mode sign out
        localStorage.removeItem('demoUser');
      }
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
