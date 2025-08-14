import React from "react";

type User = Record<string, any> | null;

interface AuthContextType {
  signIn: () => void;
  signOut: () => void;
  user: User;
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

  return (
    <AuthContext.Provider
      value={{
        signIn: () => setAuth({ name: "John Doe" }), // Mock user
        signOut: () => setAuth(null),
        user,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
