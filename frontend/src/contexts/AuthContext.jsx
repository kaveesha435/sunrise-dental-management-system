import { createContext, useCallback, useContext, useEffect, useReducer, useState } from 'react';

/**
 * Authentication context — single source of truth for the logged-in user.
 *
 * Provides:
 *   user          — current UserResponse or null
 *   loading       — true while checking localStorage on initial mount
 *   login(creds)  — calls the API, stores token, updates user
 *   logout()      — clears storage and resets user state
 */

const AuthContext = createContext(null);

const STORAGE_KEY_TOKEN = 'sd_auth_token';
const STORAGE_KEY_USER  = 'sd_auth_user';
const STORAGE_TYPE_KEY  = 'sd_storage_type'; // 'local' | 'session'

// -------------------------------------------------------
// Helper — pick the right storage based on "remember me"
// -------------------------------------------------------
function getStorage() {
  const type = localStorage.getItem(STORAGE_TYPE_KEY);
  return type === 'session' ? sessionStorage : localStorage;
}

function readStoredSession() {
  // Check both storages — user might have refreshed the page
  const stores = [localStorage, sessionStorage];
  for (const store of stores) {
    const token = store.getItem(STORAGE_KEY_TOKEN);
    const userData = store.getItem(STORAGE_KEY_USER);
    if (token && userData) {
      try {
        return { token, user: JSON.parse(userData) };
      } catch {
        // corrupted data — clear it
        store.removeItem(STORAGE_KEY_TOKEN);
        store.removeItem(STORAGE_KEY_USER);
      }
    }
  }
  return null;
}

// -------------------------------------------------------
// Provider
// -------------------------------------------------------
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — restore session from storage
  useEffect(() => {
    const session = readStoredSession();
    if (session) {
      setUser(session.user);
    }
    setLoading(false);
  }, []);

  /**
   * Stores the auth response and updates user state.
   * @param {Object} authData — { token, user, expiresIn }
   * @param {boolean} rememberMe — use localStorage (true) or sessionStorage (false)
   */
  const storeSession = useCallback((authData, rememberMe) => {
    const store = rememberMe ? localStorage : sessionStorage;
    const storageType = rememberMe ? 'local' : 'session';

    localStorage.setItem(STORAGE_TYPE_KEY, storageType);
    store.setItem(STORAGE_KEY_TOKEN, authData.token);
    store.setItem(STORAGE_KEY_USER, JSON.stringify(authData.user));

    setUser(authData.user);
  }, []);

  /**
   * Called by the AuthService after a successful API response.
   * Not a direct API caller — the service layer handles that.
   */
  const login = useCallback((authData, rememberMe = false) => {
    storeSession(authData, rememberMe);
  }, [storeSession]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_TYPE_KEY);
    sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_USER);
    setUser(null);
  }, []);

  /**
   * Returns the stored JWT token for use in API calls.
   */
  const getToken = useCallback(() => {
    return getStorage().getItem(STORAGE_KEY_TOKEN);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

// -------------------------------------------------------
// Hook
// -------------------------------------------------------

/**
 * useAuth — hook to access the authentication context.
 * Must be called within <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
