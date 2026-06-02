import { StyleSheet } from 'react-native';
import { theme } from '../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.secondary,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginTop: theme.spacing.lg,
  },
  tagline: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
  authContainer: {
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
  },
  googleButton: {
    backgroundColor: theme.colors.googleBlue,
    height: 55,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.light,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  footerText: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  }
});

