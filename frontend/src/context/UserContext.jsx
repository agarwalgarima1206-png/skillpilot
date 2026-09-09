import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);
const STORAGE_KEY = "skillpilot-auth";

export function UserProvider({ children }) {
  const [state, setState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  });
  useEffect(() => {
    if (state.token) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else localStorage.removeItem(STORAGE_KEY);
  }, [state]);
  const login = ({ token, user }) => setState({ token, ...user });
  const updateUser = (patch) => setState(prev => ({ ...prev, ...patch }));
  const logout = () => setState({});
  return <UserContext.Provider value={{ ...state, isLoggedIn: !!state.token, login, updateUser, logout }}>{children}</UserContext.Provider>;
}
export function useUser() { const value = useContext(UserContext); if (!value) throw new Error("useUser must be used inside UserProvider"); return value; }
