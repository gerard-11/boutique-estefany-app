import { StyleSheet } from 'react-native';
import { theme } from '../../../theme';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f5',
    borderRadius: theme.borderRadius.md,
    padding: 4,
    marginBottom: theme.spacing.xl,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
    gap: 8,
  },
  activeIn: {
    backgroundColor: theme.colors.success,
  },
  activeOut: {
    backgroundColor: theme.colors.error,
  },
  typeButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  activeTypeText: {
    color: theme.colors.white,
  },
  form: {
    gap: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  input: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 10,
    marginTop: 2,
    marginLeft: 4,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: theme.spacing.md,
  },
  advancedToggleText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  advancedContent: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  flex1: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
  }
});
