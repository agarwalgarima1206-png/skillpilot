import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);
const STORAGE_KEY = "skillpilot-session";

export function UserProvider({ children }) {
  const [state, setState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setSession = (patch) => setState((prev) => ({ ...prev, ...patch }));
  const clearSession = () => { localStorage.removeItem(STORAGE_KEY); setState({}); };

  return <UserContext.Provider value={{ ...state, setSession, clearSession }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const value = useContext(UserContext);
  if (!value) throw new Error("useUser must be used inside UserProvider");
  return value;
}
