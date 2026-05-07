import { colors } from './colors';

export const typography = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.white,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.white,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.white,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.white,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.gray[200],
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.gray[300],
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.white,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.gray[400],
  },
  timer: {
    fontSize: 48,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    color: colors.white,
  },
  counter: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: colors.white,
  },
};
