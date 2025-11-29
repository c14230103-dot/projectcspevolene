// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('guest'); // 'guest' | 'user' | 'admin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await fetchUserRole(currentUser.id);
      } else {
        setRole('guest');
      }
      setLoading(false);
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await fetchUserRole(currentUser.id);
      } else {
        setRole('guest');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setRole(data.role);
    } else {
      setRole('user'); // fallback
    }
  };
// context/AuthContext.js

const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  // 1) Kalau Supabase kasih error (misal: "User already registered")
  if (error) {
    if (
      error.message &&
      error.message.toLowerCase().includes('user already registered')
    ) {
      throw new Error('Email sudah terdaftar. Silakan login.');
    }

    // error lain (password kurang, dsb.)
    throw error;
  }

  // 2) Kalau user null → anggap email sudah dipakai / tidak valid
  if (!data || !data.user) {
    throw new Error(
      'Email sudah terdaftar. Silakan login atau verifikasi email.'
    );
  }

  const newUser = data.user;

  // 3) SUPABASE TRICK:
  //    Kalau signup kedua kali dengan email yang sama,
  //    Supabase biasanya mengembalikan user.dan identities = []
  //    → artinya email sudah pernah terdaftar.
  const identities = Array.isArray(newUser.identities)
    ? newUser.identities
    : [];

  if (identities.length === 0) {
    // Jangan buat profile, jangan anggap akun baru
    throw new Error('Email sudah terdaftar. Silakan login.');
  }

  // 4) Buat profile default user
  const { error: profileError } = await supabase.from('profiles').insert({
    id: newUser.id,
    role: 'user',
  });

  if (profileError) {
    console.error('Gagal membuat profile:', profileError);
  }

  setUser(newUser);
  setRole('user');
  return newUser;
};


  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    const currentUser = data.user;
    setUser(currentUser);
    if (currentUser) {
      await fetchUserRole(currentUser.id);
    }
    return currentUser;
  };

const signOut = async () => {
  await supabase.auth.signOut();
  setUser(null);
  setRole('guest');
  location.reload(); 
};


  return (
    <AuthContext.Provider
      value={{ user, role, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
