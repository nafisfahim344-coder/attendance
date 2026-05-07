import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../../theme';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { useAuth } from '../../../hooks/useAuth';
import type { AuthStackParamList } from '../../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailLogin'>;

export function EmailLoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginWithEmail } = useAuth();

  const handleLogin = async () => {
    setLoading(true); setError('');
    try { await loginWithEmail(email, password); }
    catch (e: any) { setError(e.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Email Login</Text>
        <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={{ color: colors.danger.main, marginBottom: spacing.md }}>{error}</Text> : null}
        <Button title="Sign In" onPress={handleLogin} loading={loading} fullWidth size="lg" />
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark[900] },
  content: { flex: 1, paddingHorizontal: spacing.xxl, justifyContent: 'center' },
  title: { ...typography.h2, color: colors.white, textAlign: 'center', marginBottom: spacing.xxxl },
});
