import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../hooks/useAuth';
import type { AuthStackParamList } from '../../navigation/types';
import { theme } from '../../theme/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const { resendSignupConfirmation, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSignup = async () => {
    setFeedback(null);
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await signUp(email, password);

    if (result.error) {
      setErrorMessage(result.error);
      setIsSubmitting(false);
      return;
    }

    if (result.requiresEmailConfirmation) {
      setFeedback('Account created. Check your inbox to confirm your email before logging in.');
    } else {
      setFeedback('Account created. You can continue straight into the app.');
    }

    setIsSubmitting(false);
  };

  const handleResendConfirmation = async () => {
    setFeedback(null);
    setErrorMessage(null);
    setIsResending(true);

    const result = await resendSignupConfirmation(email);

    if (result.error) {
      setErrorMessage(result.error);
    } else {
      setFeedback('Confirmation email sent again. Check your inbox and spam folder.');
    }

    setIsResending(false);
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View style={styles.top}>
          <Header
            title="Create your account"
            subtitle="Set up email and password access so this app is ready for future Supabase data features."
          />
        </View>

        <View style={styles.form}>
          <Input
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="you@example.com"
            value={email}
          />
          <Input
            autoCapitalize="none"
            autoComplete="new-password"
            label="Password"
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry
            value={password}
          />
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          {feedback ? <Text style={styles.success}>{feedback}</Text> : null}
          <Button
            title={isSubmitting ? 'Creating account...' : 'Sign up'}
            onPress={() => void handleSignup()}
            isLoading={isSubmitting}
            disabled={!email || !password}
          />
          <Button
            title={isResending ? 'Sending...' : 'Resend confirmation email'}
            onPress={() => void handleResendConfirmation()}
            isLoading={isResending}
            disabled={!email}
            variant="secondary"
          />
          <Button title="Back to login" onPress={() => navigation.navigate('Login')} variant="ghost" />
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xxl,
  },
  top: {
    gap: theme.spacing.sm,
  },
  form: {
    gap: theme.spacing.md,
  },
  error: {
    color: theme.colors.error,
    fontSize: 14,
  },
  success: {
    color: theme.colors.success,
    fontSize: 14,
  },
});
