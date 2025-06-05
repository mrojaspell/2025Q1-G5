import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signIn,
  signUp,
  signOut,
  fetchAuthSession,
  confirmSignUp,
  AuthTokens,
} from "aws-amplify/auth";

interface AuthContextProps {
  session: AuthTokens | null;
  logIn: (
    email: string,
    password: string,
    onSuccess: () => void,
    onFailure: (error: any) => void,
  ) => void;
  isLoggedIn: boolean;
  signUp: (
    email: string,
    password: string,
    name: string,
    surname: string,
    birthdate: string,
    onSuccess: () => void,
    onFailure: (error: any) => void,
  ) => void;
  accountCreated: boolean;
  accountConfirmed: boolean;
  confirm: (
    email: string,
    code: string,
    onSuccess: () => void,
    onFailure: (error: any) => void,
  ) => void;
  logOut: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<AuthTokens | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [accountConfirmed, setAccountConfirmed] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentSession = await fetchAuthSession();

        if (currentSession && currentSession.tokens) {
          setSession(currentSession.tokens);
          setIsLoggedIn(true);
        }
      } catch {
        setSession(null);
        setIsLoggedIn(false);
      }
    };
    checkSession();
  }, []);

  const logIn = async (
    email: string,
    password: string,
    onSuccess: () => void,
    onFailure: (error: any) => void,
  ) => {
    try {
      await signIn({ username: email, password });
      const currentSession = await fetchAuthSession();

      if (currentSession.tokens) {
        setSession(currentSession.tokens);
        setIsLoggedIn(true);
        onSuccess();
      } else {
        throw new Error("No tokens found in session");
      }
    } catch (error) {
      setSession(null);
      setIsLoggedIn(false);
      onFailure(error);
    }
  };

  const signUpUser = async (
    email: string,
    password: string,
    name: string,
    surname: string,
    birthdate: string,
    onSuccess: () => void,
    onFailure: (error: any) => void,
  ) => {
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
            family_name: surname,
            birthdate,
          },
        },
      });
      setAccountCreated(true);
      onSuccess();
    } catch (error) {
      setAccountCreated(false);
      onFailure(error);
    }
  };

  const confirm = async (
    email: string,
    code: string,
    onSuccess: () => void,
    onFailure: (error: any) => void,
  ) => {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      setAccountConfirmed(true);
      onSuccess();
    } catch (error) {
      setAccountConfirmed(false);
      onFailure(error);
    }
  };

  const logOut = async () => {
    try {
      await signOut();
      setSession(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        logIn,
        isLoggedIn,
        signUp: signUpUser,
        accountCreated,
        accountConfirmed,
        confirm,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
