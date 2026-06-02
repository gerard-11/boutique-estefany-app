import { StyleSheet } from 'react-native';
import { theme } from '../theme';

export const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.xxl,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
});

