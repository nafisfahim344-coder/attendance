import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../../theme';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { useAuth } from '../../../hooks/useAuth';
import type { AuthStackParamList } from '../../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginWithPhone } = useAuth();

  const handleSendOTP = async () => {
    if (!phone.trim()) { setError('Please enter your phone number'); return; }
    setLoading(true); setError('');
    try {
      await loginWithPhone(phone.trim());
      navigation.navigate('OTPVerify', { phone: phone.trim() });
    } catch (e: any) { setError(e.message || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.logoSection}>
          <Text style={styles.logoIcon}>⏱️</Text>
          <Text style={styles.title}>Attendance</Text>
        </View>
        <View style={styles.form}>
          <Input label="Phone Number" placeholder="+1 234 567 8900" value={phone} onChangeText={setPhone} keyboardType="phone-pad" error={error} />
          <Button title="Send OTP" onPress={handleSendOTP} loading={loading} fullWidth size="lg" />
        </View>
        <Button title="Sign in with Email" onPress={() => navigation.navigate('EmailLogin')} variant="secondary" fullWidth />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark[900] },
  content: { flex: 1, paddingHorizontal: spacing.xxl, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: spacing.xxxxl },
  logoIcon: { fontSize: 64, marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.white },
  form: { marginBottom: spacing.xxl },
});
