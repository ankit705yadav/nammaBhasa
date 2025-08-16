import React from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = Record<string, any> | null;

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  user: User;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// This hook can be used to access the user info.
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a Provider");
  }
  return context;
}

export function Provider(props: { children: React.ReactNode }) {
  const [user, setAuth] = React.useState<User>(null);
  const [isLoading, setIsLoading] = React.useState(true); // Start with loading true
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  // Check for existing token on mount
  React.useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setAuth({ token }); // Set minimal user data with token
        }
      } catch (err) {
        console.error('Error loading auth token:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://10.11.57.27:8080/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();

      console.log("login-token:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to login");
      }

      // Store the token in AsyncStorage
      await AsyncStorage.setItem('userToken', data.token);

      // Set the user data. The navigation is handled in the root layout.
      setAuth(data);  // Set the entire response data as the user object
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      // Remove token from storage
      await AsyncStorage.removeItem('userToken');
      setAuth(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to logout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        user,
        isLoading,
        error,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
