import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { fetchProfile } from '../lib/cloud';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) return setProfile(null);
    try {
      const p = await fetchProfile(userId);
      setProfile(p);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) loadProfile(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) loadProfile(newSession.user.id);
      else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const value = {
    enabled: isSupabaseConfigured,
    session,
    user: session?.user || null,
    profile,
    isPremium: Boolean(profile?.is_premium),
    loading,
    refreshProfile: () => loadProfile(session?.user?.id),
    signInWithPassword: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUpWithPassword: (email, password) =>
      supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/app` } }),
    sendMagicLink: (email) =>
      supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/app` } }),
    signOut: () => supabase.auth.signOut()
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
