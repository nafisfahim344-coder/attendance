import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../../theme';
import { Card } from '../../../components/Card';
import { StatusBadge } from '../../../components/StatusBadge';
import { Button } from '../../../components/Button';
import { useAuthStore } from '../../../store/authStore';
import { useAttendanceStore } from '../../../store/attendanceStore';
import { useUIStore } from '../../../store/uiStore';
import { useLocation } from '../../../hooks/useLocation';
import { useMockDetection } from '../../../hooks/useMockDetection';
import { performClockIn, performClockOut, startBreak, endBreak, getTodaySession, startOvertime } from '../services/clockService';
import { formatDuration, formatTime, isFriday } from '../../../utils/dateUtils';
import { APP_CONFIG } from '../../../app/config';
import DeviceInfo from 'react-native-device-info';

export function ClockScreen() {
  const { employee } = useAuthStore();
  const { currentSession, currentBreak, status, workElapsedSeconds, breakElapsedSeconds, overtimeElapsedSeconds, isOvertimeActive, setCurrentSession, setCurrentBreak, setStatus, setWorkElapsed, setBreakElapsed, setOvertimeElapsed, setOvertimeActive, resetSession } = useAttendanceStore();
  const { isClockingIn, isClockingOut, isStartingBreak, isEndingBreak, setClockingIn, setClockingOut, setStartingBreak, setEndingBreak } = useUIStore();
  const { getCurrentPosition } = useLocation();
  const { checkMockLocation } = useMockDetection();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (employee) loadTodaySession();
  }, [employee]);

  useEffect(() => {
    if (status !== 'clocked_in' && status !== 'on_break') return;
    const interval = setInterval(() => {
      if (currentSession?.clock_in) {
        const elapsed = Math.floor((Date.now() - new Date(currentSession.clock_in).getTime()) / 1000);
        setWorkElapsed(elapsed);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [status, currentSession]);

  useEffect(() => {
    if (status !== 'on_break' || !currentBreak) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(currentBreak.start_time).getTime()) / 1000);
      setBreakElapsed(elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [status, currentBreak]);

  const loadTodaySession = async () => {
    if (!employee) return;
    const session = await getTodaySession(employee.id);
    if (session) {
      setCurrentSession(session);
      setStatus(session.status);
      const activeBreak = (session as any).breaks?.find((b: any) => !b.end_time);
      if (activeBreak) setCurrentBreak(activeBreak);
    }
  };

  const handleClockIn = async () => {
    if (!employee) return;
    setClockingIn(true);
    try {
      const isMocked = await checkMockLocation();
      const location = await getCurrentPosition();
      const deviceId = await DeviceInfo.getUniqueId();
      const result = await performClockIn(employee.id, location, deviceId, isMocked);
      if (result.success && result.session) {
        setCurrentSession(result.session);
        setStatus('clocked_in');
      } else {
        Alert.alert('Clock-In Failed', result.error || 'Unknown error');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally { setClockingIn(false); }
  };

  const handleClockOut = async () => {
    if (!employee || !currentSession) return;
    Alert.alert('Clock Out', 'Are you sure you want to clock out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clock Out', style: 'destructive', onPress: async () => {
        setClockingOut(true);
        try {
          const location = await getCurrentPosition();
          const result = await performClockOut(currentSession.id, employee.id, location);
          if (result.success) { resetSession(); }
          else Alert.alert('Error', result.error || 'Clock-out failed');
        } catch (e: any) { Alert.alert('Error', e.message); }
        finally { setClockingOut(false); }
      }},
    ]);
  };

  const handleStartBreak = async () => {
    if (!employee || !currentSession) return;
    setStartingBreak(true);
    try {
      const result = await startBreak(currentSession.id, employee.id);
      if (result.success && result.breakRecord) {
        setCurrentBreak(result.breakRecord);
        setStatus('on_break');
      } else Alert.alert('Error', result.error || 'Failed to start break');
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setStartingBreak(false); }
  };

  const handleEndBreak = async () => {
    if (!currentBreak || !currentSession) return;
    setEndingBreak(true);
    try {
      const result = await endBreak(currentBreak.id, currentSession.id);
      if (result.success) {
        setCurrentBreak(null);
        setStatus('clocked_in');
        setBreakElapsed(0);
      } else Alert.alert('Error', result.error || 'Failed to end break');
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setEndingBreak(false); }
  };

  const isClockedIn = status === 'clocked_in' || status === 'on_break';
  const isOnBreak = status === 'on_break';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {employee?.name?.split(' ')[0] || 'User'}</Text>
        <Text style={styles.dateText}>{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      </View>
      <Text style={styles.liveTime}>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Text>
      <View style={styles.statusRow}>
        <StatusBadge status={status} size="md" />
      </View>
      <View style={styles.clockButtonContainer}>
        <TouchableOpacity
          style={[styles.clockButton, isClockedIn ? styles.clockOutButton : styles.clockInButton]}
          onPress={isClockedIn ? handleClockOut : handleClockIn}
          disabled={isClockingIn || isClockingOut}
          activeOpacity={0.8}
        >
          <Text style={styles.clockButtonText}>{isClockedIn ? 'CLOCK OUT' : 'CLOCK IN'}</Text>
        </TouchableOpacity>
      </View>
      {isClockedIn && (
        <View style={styles.timersRow}>
          <Card style={styles.timerCard} variant="glass" padding="sm">
            <Text style={styles.timerLabel}>WORKED</Text>
            <Text style={styles.timerValue}>{formatDuration(workElapsedSeconds)}</Text>
          </Card>
          {isOnBreak && (
            <Card style={styles.timerCard} variant="glass" padding="sm">
              <Text style={styles.timerLabel}>BREAK</Text>
              <Text style={styles.timerValue}>{formatDuration(breakElapsedSeconds)}</Text>
            </Card>
          )}
        </View>
      )}
      {isClockedIn && (
        <View style={styles.breakButtons}>
          {!isOnBreak ? (
            <Button title="Start Break" onPress={handleStartBreak} variant="secondary" size="lg" fullWidth loading={isStartingBreak} />
          ) : (
            <Button title="End Break" onPress={handleEndBreak} variant="success" size="lg" fullWidth loading={isEndingBreak} />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark[900], paddingHorizontal: spacing.xl },
  header: { marginTop: spacing.lg, marginBottom: spacing.md },
  greeting: { ...typography.h2, color: colors.white },
  dateText: { ...typography.body, color: colors.gray[400], marginTop: spacing.xs },
  liveTime: { ...typography.timer, color: colors.white, textAlign: 'center', marginVertical: spacing.md },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  clockButtonContainer: { alignItems: 'center', marginVertical: spacing.xxl },
  clockButton: { width: 180, height: 180, borderRadius: 90, justifyContent: 'center', alignItems: 'center' },
  clockInButton: { backgroundColor: colors.success.main },
  clockOutButton: { backgroundColor: colors.danger.main },
  clockButtonText: { ...typography.label, color: colors.white, fontSize: 20 },
  timersRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.lg },
  timerCard: { alignItems: 'center', minWidth: 100 },
  timerLabel: { ...typography.caption, color: colors.gray[400], marginBottom: spacing.xs },
  timerValue: { ...typography.h3, color: colors.white },
  breakButtons: { marginBottom: spacing.lg },
});
