import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Router from "next/router";
import { destroyCookie, setCookie, parseCookies } from "nookies";
import { api } from "../services/apiClient";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextProps = {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user: User | null;
};

type AuthProviderProps = {
  children: ReactNode;
};

export function signOut() {
  destroyCookie(undefined, "@NextAuthTest:token");
  destroyCookie(undefined, "@NextAuthTest:refreshToken");
  Router.push("/");
}

export const AuthContext = createContext({} as AuthContextProps);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUserData() {
      try {
        const { "@NextAuthTest:token": token } = parseCookies();

        if (token) {
          const response = await api.get<User>("/me");
          setUser(response.data);
        }
      } catch (err) {
        signOut();
      }
    }
    loadUserData();
  }, []);

  async function signIn({ email, password }: SignInCredentials): Promise<void> {
    try {
      const response = await api.post("sessions", {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(undefined, "@NextAuthTest:token", token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
      setCookie(undefined, "@NextAuthTest:refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      setUser({
        email,
        permissions,
        roles,
      });

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      Router.push("/dashboard");
    } catch (err) {
      console.error(err);
    }
  }

  const value = {
    isAuthenticated: !!user,
    signIn,
    user,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);
  return auth;
}
