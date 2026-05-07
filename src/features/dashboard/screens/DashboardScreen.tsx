import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../../theme';
import { Card } from '../../../components/Card';
import { StatusBadge } from '../../../components/StatusBadge';
import { supabase } from '../../../app/supabase';

export function DashboardScreen() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [stats, setStats] = useState({ in: 0, break: 0, out: 0, absent: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    const { data: emps } = await supabase
      .from('employees')
      .select('*, attendance_sessions(status)')
      .eq('is_active', true);

    if (emps) {
      const formatted = emps.map(e => ({
        ...e,
        status: e.attendance_sessions?.[0]?.status || 'not_clocked_in'
      }));
      setEmployees(formatted);
      
      const s = { in: 0, break: 0, out: 0, absent: 0 };
      formatted.forEach(e => {
        if (e.status === 'clocked_in') s.in++;
        else if (e.status === 'on_break') s.break++;
        else if (e.status === 'clocked_out') s.out++;
        else s.absent++;
      });
      setStats(s);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
    // Subscribe to realtime updates
    const channel = supabase
      .channel('attendance_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_sessions' }, () => loadData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const renderStatCard = (label: string, value: number, color: string) => (
    <Card style={styles.statCard} variant="glass" padding="sm">
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statsGrid}>
        {renderStatCard('PRESENT', stats.in, colors.success.main)}
        {renderStatCard('BREAK', stats.break, colors.warning.main)}
        {renderStatCard('OUT', stats.out, colors.gray[400])}
        {renderStatCard('ABSENT', stats.absent, colors.danger.main)}
      </View>

      <Text style={styles.sectionTitle}>Employee Status</Text>
      <FlatList
        data={employees}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={colors.primary[500]} />}
        renderItem={({ item }) => (
          <Card style={styles.employeeCard} variant="outlined" padding="sm">
            <View style={styles.empRow}>
              <View>
                <Text style={styles.empName}>{item.name}</Text>
                <Text style={styles.empDept}>{item.department || 'Staff'}</Text>
              </View>
              <StatusBadge status={item.status} />
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark[900], paddingHorizontal: spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginVertical: spacing.lg, justifyContent: 'center' },
  statCard: { width: '45%', alignItems: 'center' },
  statValue: { ...typography.h2 },
  statLabel: { ...typography.caption, color: colors.gray[400] },
  sectionTitle: { ...typography.h4, color: colors.white, marginBottom: spacing.md, marginTop: spacing.sm },
  employeeCard: { marginBottom: spacing.sm },
  empRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  empName: { ...typography.label, color: colors.white },
  empDept: { ...typography.caption, color: colors.gray[500] },
});
