import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../../theme';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { exportToExcel } from '../../../utils/excelExport';
import { useAuthStore } from '../../../store/authStore';

export function ReportsScreen() {
  const { employee } = useAuthStore();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  
  // Mock data for preview
  const [data] = useState<any[]>([
    { date: '2026-05-01', day: 'Saturday', clockIn: '08:55 AM', clockOut: '06:05 PM', workedHours: '9.1h', flags: [], isFriday: false },
    { date: '2026-05-02', day: 'Sunday', clockIn: '09:12 AM', clockOut: '05:55 PM', workedHours: '8.7h', flags: ['Late'], isFriday: false },
    { date: '2026-05-03', day: 'Monday', clockIn: '09:00 AM', clockOut: '06:10 PM', workedHours: '9.2h', flags: [], isFriday: false },
  ]);

  const handleExport = async () => {
    if (!employee) return;
    await exportToExcel(data, employee.name, period);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterBtn, period === 'weekly' && styles.filterBtnActive]} onPress={() => setPeriod('weekly')}>
          <Text style={[styles.filterText, period === 'weekly' && styles.filterTextActive]}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, period === 'monthly' && styles.filterBtnActive]} onPress={() => setPeriod('monthly')}>
          <Text style={[styles.filterText, period === 'monthly' && styles.filterTextActive]}>Monthly</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.date}
        renderItem={({ item }) => (
          <Card style={styles.reportCard} variant="glass" padding="sm">
            <View style={styles.reportHeader}>
              <Text style={styles.reportDate}>{item.date} ({item.day})</Text>
              {item.flags.map((f: string) => <Text key={f} style={styles.flag}>• {f}</Text>)}
            </View>
            <View style={styles.reportDetails}>
              <View>
                <Text style={styles.detailLabel}>IN</Text>
                <Text style={styles.detailValue}>{item.clockIn}</Text>
              </View>
              <View>
                <Text style={styles.detailLabel}>OUT</Text>
                <Text style={styles.detailValue}>{item.clockOut}</Text>
              </View>
              <View>
                <Text style={styles.detailLabel}>TOTAL</Text>
                <Text style={styles.detailValue}>{item.workedHours}</Text>
              </View>
            </View>
          </Card>
        )}
      />

      <Button title="Export to Excel" onPress={handleExport} variant="primary" size="lg" style={styles.exportBtn} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark[900], paddingHorizontal: spacing.lg },
  filterRow: { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.lg },
  filterBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: colors.dark[700], alignItems: 'center' },
  filterBtnActive: { backgroundColor: colors.primary[600] },
  filterText: { ...typography.label, color: colors.gray[400] },
  filterTextActive: { color: colors.white },
  reportCard: { marginBottom: spacing.md },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  reportDate: { ...typography.label, color: colors.white },
  flag: { color: colors.warning.main, fontSize: 12 },
  reportDetails: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.dark[600], paddingTop: spacing.sm },
  detailLabel: { ...typography.caption, color: colors.gray[500] },
  detailValue: { ...typography.bodySmall, color: colors.white, fontWeight: '600' },
  exportBtn: { marginVertical: spacing.lg },
});
