import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { api } from '@/lib/api';

export type Usuario = {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: string;
  activo?: boolean;
};

type AuthContextValue = {
  user: Usuario | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'salarioapp.auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(async (raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as { token?: string };
        if (!parsed.token) return;
        const me = await api<Usuario>('/api/auth/me', { token: parsed.token });
        setToken(parsed.token);
        setUser(me);
      })
      .catch(() => AsyncStorage.removeItem(STORAGE_KEY))
      .finally(() => setReady(true));
  }, []);

  async function persist(nextToken: string, nextUser: Usuario) {
    setToken(nextToken);
    setUser(nextUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken }));
  }

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      login: async (email: string, password: string) => {
        const data = await api<{ token: string; usuario: Usuario }>('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        await persist(data.token, data.usuario);
      },
      register: async (nombre: string, email: string, password: string) => {
        const data = await api<{ token: string; usuario: Usuario }>('/api/auth/register', {
          method: 'POST',
          body: { nombre, email, password },
        });
        await persist(data.token, data.usuario);
      },
      logout: async () => {
        setUser(null);
        setToken(null);
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    }),
    [user, token, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
