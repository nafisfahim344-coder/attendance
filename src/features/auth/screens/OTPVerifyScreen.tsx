import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../../theme';
import { Button } from '../../../components/Button';
import { useAuth } from '../../../hooks/useAuth';
import type { AuthStackParamList } from '../../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerify'>;

export function OTPVerifyScreen({ route }: Props) {
  const { phone } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { verifyOTP } = useAuth();

  const handleVerify = async () => {
    if (code.length !== 6) { setError('Enter 6-digit code'); return; }
    setLoading(true); setError('');
    try { await verifyOTP(phone, code); }
    catch (e: any) { setError(e.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Sent to {phone}</Text>
        <TextInput style={styles.otpInput} value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} placeholder="000000" placeholderTextColor={colors.gray[500]} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Verify" onPress={handleVerify} loading={loading} fullWidth size="lg" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark[900] },
  content: { flex: 1, paddingHorizontal: spacing.xxl, justifyContent: 'center' },
  title: { ...typography.h2, color: colors.white, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.gray[400], textAlign: 'center', marginBottom: spacing.xxxl },
  otpInput: { backgroundColor: colors.dark[700], color: colors.white, fontSize: 32, textAlign: 'center', padding: spacing.lg, borderRadius: borderRadius.lg, marginBottom: spacing.xl },
  error: { color: colors.danger.main, textAlign: 'center', marginBottom: spacing.lg },
});
