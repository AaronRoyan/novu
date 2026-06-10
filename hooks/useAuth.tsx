import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Linking } from 'react-native';

import { isSupabaseConfigured, supabase, supabaseConfigError } from '../lib/supabase';
import { authRedirectUrl, getAuthRedirectParams, isAuthRedirectUrl } from '../utils/authRedirect';

type AuthResult = {
  error?: string;
  requiresEmailConfirmation?: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isBootstrapping: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  resendSignupConfirmation: (email: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  retryBootstrap: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong while talking to Supabase.';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const bootstrapSession = useCallback(async () => {
    setIsBootstrapping(true);
    setAuthError(null);

    try {
      if (!isSupabaseConfigured) {
        setSession(null);
        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      setSession(data.session ?? null);
    } catch (error) {
      setAuthError(normalizeError(error));
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  const handleAuthRedirectUrl = useCallback(async (url: string) => {
    if (!isSupabaseConfigured || !isAuthRedirectUrl(url)) {
      return;
    }

    try {
      const params = getAuthRedirectParams(url);
      const errorDescription = params.get('error_description') ?? params.get('error');

      if (errorDescription) {
        throw new Error(errorDescription);
      }

      const code = params.get('code');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          throw error;
        }

        setSession(data.session ?? null);
        return;
      }

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          throw error;
        }

        setSession(data.session ?? null);
      }
    } catch (error) {
      setAuthError(normalizeError(error));
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    void bootstrapSession();

    if (!isSupabaseConfigured) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthError(null);
      setIsBootstrapping(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [bootstrapSession]);

  useEffect(() => {
    void Linking.getInitialURL().then((url) => {
      if (url) {
        void handleAuthRedirectUrl(url);
      }
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleAuthRedirectUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, [handleAuthRedirectUrl]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { error: supabaseConfigError };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    return error ? { error: error.message } : {};
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { error: supabaseConfigError };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: authRedirectUrl,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return {
      requiresEmailConfirmation: !data.session,
    };
  }, []);

  const resendSignupConfirmation = useCallback(async (email: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { error: supabaseConfigError };
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: authRedirectUrl,
      },
    });

    return error ? { error: error.message } : {};
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setSession(null);
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isBootstrapping,
      authError,
      signIn,
      signUp,
      resendSignupConfirmation,
      signOut,
      retryBootstrap: bootstrapSession,
    }),
    [
      authError,
      bootstrapSession,
      isBootstrapping,
      resendSignupConfirmation,
      session,
      signIn,
      signOut,
      signUp,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
