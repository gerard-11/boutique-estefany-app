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
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border || '#ddd',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 50,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
  },
  emailAuthTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  emailAuthButton: {
    backgroundColor: theme.colors.primary,
    height: 55,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.light,
  },
  emailAuthButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  emailAuthToggleText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: theme.colors.error || '#fa5252',
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  }
});

