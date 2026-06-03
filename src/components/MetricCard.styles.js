import { StyleSheet } from 'react-native';
import { theme } from '../theme';

export const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: 15,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.light,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardContent: {},
  cardTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  cardValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    marginVertical: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
});
