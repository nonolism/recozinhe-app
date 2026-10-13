/**
 * Guarda quem está logado. O token fica salvo no celular (AsyncStorage),
 * então o usuário não precisa entrar de novo toda vez que abre o app.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

import * as api from './api';

const STORAGE_KEY = 'recozinhe.token';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  async function saveToken(value) {
    api.setToken(value);
    setTokenState(value);
    if (value) await AsyncStorage.setItem(STORAGE_KEY, value);
    else await AsyncStorage.removeItem(STORAGE_KEY);
  }

  useEffect(() => {
    api.setUnauthorizedHandler(() => saveToken(null));
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        api.setToken(saved);
        setTokenState(saved);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = {
    token,
    loading,
    async signIn(username, password) {
      const data = await api.login(username, password);
      await saveToken(data.token);
    },
    async signUp(fields) {
      const data = await api.register(fields);
      await saveToken(data.token);
    },
    async signOut() {
      await saveToken(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
