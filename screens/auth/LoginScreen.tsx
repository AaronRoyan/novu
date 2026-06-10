import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../hooks/useAuth';
import type { AuthStackParamList } from '../../navigation/types';
import { theme } from '../../theme/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    const { error } = await signIn(email, password);

    if (error) {
      setErrorMessage(error);
    }

    setIsSubmitting(false);
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View style={styles.logoBlock}>
          <Image source={require('../../assets/images/novu-logo.png')} style={styles.logo} />
          <Header
            align="center"
            title="Welcome back"
            subtitle="Sign in with your email and password to enter the Novu app."
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
            autoComplete="password"
            label="Password"
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            value={password}
          />
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          <Button
            title={isSubmitting ? 'Signing in...' : 'Login'}
            onPress={() => void handleLogin()}
            isLoading={isSubmitting}
            disabled={!email || !password}
          />
          <Button
            title="Create an account"
            onPress={() => navigation.navigate('Signup')}
            variant="ghost"
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.lg,
  },
  logoBlock: {
    alignItems: 'center',
    gap: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  form: {
    gap: theme.spacing.md,
  },
  error: {
    color: theme.colors.error,
    fontSize: 14,
  },
});
