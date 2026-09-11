import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { setAuthToken } from "../services/api";

const UserContext = createContext(null);
const STORAGE_KEY = "skillpilot-auth";

export function UserProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (state.token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setAuthToken(state.token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setAuthToken(null);
    }
  }, [state]);

  const login = useCallback(({ token, user }) => {
    setState({
      token,
      ...(user || {}),
    });
  }, []);

  const updateUser = useCallback((patch) => {
    setState((prev) => ({
      ...prev,
      ...patch,
    }));
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setState({});
  }, []);

  const value = {
    ...state,
    isLoggedIn: !!state.token,
    login,
    updateUser,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const value = useContext(UserContext);

  if (!value) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return value;
}