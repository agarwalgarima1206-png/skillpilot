import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { getMe, setAuthToken } from "../services/api";

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

  // Do not treat a token merely stored in localStorage as a valid session.
  // This is important when the backend AUTH_SECRET changes, the DB is reset,
  // or a token expires/gets invalidated. The app verifies the token once on
  // startup before allowing protected routes to render.
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;

    const validateStoredSession = async () => {
      const storedToken = state?.token;

      if (!storedToken) {
        setAuthToken(null);
        if (active) setAuthReady(true);
        return;
      }

      setAuthToken(storedToken);

      try {
        const user = await getMe();

        if (!active) return;

        setState((prev) => ({
          ...prev,
          ...user,
          token: storedToken,
        }));
      } catch {
        // Stale/invalid sessions must never silently enter the app.
        setAuthToken(null);
        if (active) {
          localStorage.removeItem(STORAGE_KEY);
          setState({});
        }
      } finally {
        if (active) setAuthReady(true);
      }
    };

    validateStoredSession();

    return () => {
      active = false;
    };
    // Only validate when the stored token changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.token]);

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
    setAuthToken(token);
    setState({
      token,
      ...(user || {}),
    });
    setAuthReady(true);
  }, []);

  const updateUser = useCallback((patch) => {
    setState((prev) => ({
      ...prev,
      ...patch,
    }));
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
    setState({});
    setAuthReady(true);
  }, []);

  const value = {
    ...state,
    isLoggedIn: !!state.token,
    authReady,
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
