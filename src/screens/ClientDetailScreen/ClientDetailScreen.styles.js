import { StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Profile Header
  profileHeader: {
    backgroundColor: theme.colors.white,
    padding: 20,
    paddingTop: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...theme.shadows.small,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f3f5',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  registerPaymentButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  registerPaymentText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  // Financial Cards
  financialSection: {
    padding: 20,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  fCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
  },
  fCardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  fCardLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  fCardLong: {
    padding: 16,
    borderRadius: 16,
  },
  fCardLongInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  fCardLongLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  fCardLongValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  creditProgressContainer: {
    width: '100%',
  },
  creditProgressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    marginBottom: 6,
  },
  creditProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  creditLimitText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    ...theme.shadows.small,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '800',
  },

  // Transaction Cards
  transactionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f3f5',
  },
  txHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  txIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txMainInfo: {
    flex: 1,
  },
  txTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  txLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  waitingBadge: {
    backgroundColor: '#fff9db',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  waitingBadgeText: {
    fontSize: 8,
    color: '#f59f00',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  txDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  expiresText: {
    fontSize: 10,
    color: '#fd7e14',
    fontWeight: '600',
  },
  txAmountContainer: {
    alignItems: 'flex-end',
  },
  pendingDebtText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  originalAmountText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
  },

  // Transaction Details (Expanded)
  txDetails: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#fafbfc',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f3f5',
    marginVertical: 12,
  },
  detailsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  productHistoryItem: {
    marginBottom: 8,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productName: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
  },
  productQty: {
    width: 40,
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  productPrice: {
    width: 80,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'right',
  },
  productSaleHistory: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  paymentAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#40c057',
  },

  // Wishlist Styles
  wishlistList: {
    paddingHorizontal: 20,
  },
  wishlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f3f5',
  },
  wishlistInfo: {
    flex: 1,
  },
  wishlistName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  wishlistPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  wishlistDate: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  offerButton: {
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  offerButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
  },

  // Payment Modal
  paymentModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  paymentModalCard: {
    backgroundColor: theme.colors.white,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  paymentModalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text,
  },
  paymentModalSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  paymentSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5",
  },
  paymentSummaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  paymentSummaryValue: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.text,
  },
  paymentInputLabel: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.text,
  },
  paymentInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: "#fafbfc",
    paddingHorizontal: 14,
  },
  paymentCurrencyPrefix: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  paymentInput: {
    flex: 1,
    minHeight: 54,
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.text,
  },
  paymentActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
  },
  paymentCancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f1f3f5",
  },
  paymentCancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.textSecondary,
  },
  paymentSubmitButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  paymentSubmitButtonDisabled: {
    opacity: 0.65,
  },
  paymentSubmitText: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.white,
  },

  // Common
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    color: theme.colors.textSecondary,
  }
});
