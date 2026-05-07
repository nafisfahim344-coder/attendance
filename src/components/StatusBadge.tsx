import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../theme';
import type { AttendanceStatus } from '../types';

interface StatusBadgeProps {
  status: AttendanceStatus | 'not_clocked_in' | 'absent' | 'overtime' | 'late' | 'early_departure' | 'day_off_visit' | 'missed_punch' | 'break_exceeded' | 'pending' | 'approved' | 'rejected';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  clocked_in: {
    label: 'Working',
    color: colors.success.main,
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
  on_break: {
    label: 'On Break',
    color: colors.warning.main,
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  clocked_out: {
    label: 'Clocked Out',
    color: colors.gray[400],
    bgColor: 'rgba(156, 163, 175, 0.15)',
  },
  not_clocked_in: {
    label: 'Not Clocked In',
    color: colors.gray[500],
    bgColor: 'rgba(107, 114, 128, 0.15)',
  },
  absent: {
    label: 'Absent',
    color: colors.danger.main,
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
  overtime: {
    label: 'Overtime',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
  },
  late: {
    label: 'Late',
    color: colors.warning.main,
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  early_departure: {
    label: 'Early',
    color: colors.warning.dark,
    bgColor: 'rgba(217, 119, 6, 0.15)',
  },
  day_off_visit: {
    label: '🏷️ Day Off Visit',
    color: '#06B6D4',
    bgColor: 'rgba(6, 182, 212, 0.15)',
  },
  missed_punch: {
    label: 'Missed Punch',
    color: colors.danger.main,
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
  break_exceeded: {
    label: 'Break Exceeded',
    color: colors.danger.main,
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
  pending: {
    label: 'Pending',
    color: colors.warning.main,
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  approved: {
    label: 'Approved',
    color: colors.success.main,
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
  rejected: {
    label: 'Rejected',
    color: colors.danger.main,
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
};

export function StatusBadge({ status, size = 'sm', style }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.not_clocked_in;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bgColor },
        size === 'md' && styles.badgeMd,
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text
        style={[
          styles.label,
          { color: config.color },
          size === 'md' && styles.labelMd,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
  },
  badgeMd: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
  },
  labelMd: {
    fontSize: 13,
  },
});
