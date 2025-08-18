import React from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseUrl } from "../../constants/config";

type User = Record<string, any> | null;

// 1. Add signUp to the context type definition
interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>; // Added this line
  user: User;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a Provider");
  }
  return context;
}

export function Provider(props: { children: React.ReactNode }) {
  const [user, setAuth] = React.useState<User>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setAuth({ token });
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
      const response = await fetch(`${baseUrl}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to login");
      }
      await AsyncStorage.setItem('userToken', data.token);
      setAuth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Implement the signUp function
  const signUp = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        // Throw an error with the message from the backend
        throw new Error(responseText || 'Failed to sign up. Please try again.');
      }
      
      // On success, we don't log the user in. We just signal that it worked.
      // The user can now proceed to the login screen.
      // A promise that resolves indicates success.
      return; 

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      // Re-throw the error so the component calling signUp can catch it and display an alert.
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
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
        signUp, // 3. Add signUp to the provider's value
        user,
        isLoading,
        error,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}