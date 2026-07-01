import React, { useContext, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../../context/AuthContext';
import {
  CLIENT_TRANSACTION_STATUSES,
  useAcceptTransaction,
  useCompleteMyProfile,
  useMyPaymentHistory,
  useMyProfile,
  useMyTransactions,
  useRejectTransaction,
  useRequestTransactionReturn,
} from '../hooks/useClientPortal';
import { TRANSACTION_TYPE_LABELS } from '../../../constants/transactionTypes';
import { theme } from '../../../theme';
import { styles } from './ClientHomeScreen.styles';

const TABS = [
  { id: 'ACTIVE', label: 'Activas' },
  { id: 'PENDING', label: 'Pendientes' },
  { id: 'HISTORY', label: 'Historial' },
];

const STATUS_CONFIG = {
  VERDE: { label: 'Al dia', color: theme.colors.success },
  AMARILLO: { label: 'Pago pendiente', color: theme.colors.warning },
  ROJO: { label: 'Atrasado', color: theme.colors.danger },
  NORMAL: { label: 'Al dia', color: theme.colors.success },
  RETRASADO: { label: 'Pago pendiente', color: theme.colors.warning },
  ATRASADO: { label: 'Atrasado', color: theme.colors.danger },
};

const TRANSACTION_ICON = {
  CASH: { name: 'cart-outline', color: theme.colors.info },
  WEEKLY_CREDIT: { name: 'calendar-clock', color: theme.colors.danger },
  LAYAWAY: { name: 'tag-outline', color: '#fd7e14' },
  LOAN: { name: 'hand-heart-outline', color: theme.colors.info },
  PAYMENT: { name: 'cash-check', color: theme.colors.success },
};

const formatCurrency = (value = 0) => '$' + Number(value || 0).toLocaleString('es-MX');

const formatDate = (value) => {
  if (!value) return 'Sin fecha';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';

  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.transactions)) return payload.transactions;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getHistoryItems = (paymentHistory) => {
  if (Array.isArray(paymentHistory)) return paymentHistory;

  const groups = [
    paymentHistory?.payments,
    paymentHistory?.transactions,
    paymentHistory?.activeAccounts,
    paymentHistory?.completedTransactions,
    paymentHistory?.purchases,
    paymentHistory?.layaways,
    paymentHistory?.credits,
  ];

  return groups
    .flatMap((group) => (Array.isArray(group) ? group : []))
    .sort((a, b) => new Date(b.paymentDate || b.createdAt || 0) - new Date(a.paymentDate || a.createdAt || 0));
};

const getProducts = (transaction) => {
  if (Array.isArray(transaction?.items)) {
    return transaction.items.map((item) => ({
      id: item.product?.id || item.id,
      name: item.product?.name || item.name || 'Producto',
      quantity: item.quantity || 1,
      price: item.priceAtTime ?? item.price ?? item.product?.price,
    }));
  }

  return (transaction?.products || []).map((product) => ({
    id: product.id,
    name: product.name || 'Producto',
    quantity: product.quantity || 1,
    price: product.priceAtTime ?? product.price,
  }));
};

const getTransactionAmount = (transaction) => {
  if (transaction?.amount !== undefined && transaction?.totalAmount === undefined) {
    return Number(transaction.amountProcessed ?? transaction.amount ?? 0);
  }

  const totalPaid = Number(
    transaction?.totalPaid ?? (transaction?.payments || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  );

  return Number(transaction?.remainingBalance ?? (Number(transaction?.totalAmount || 0) - totalPaid));
};

const getServerMessage = (error, fallback) => {
  const serverError = error?.response?.data;
  if (Array.isArray(serverError?.message)) return serverError.message.join('\n');
  return serverError?.message || error?.message || fallback;
};

function MetricCard({ icon, color, value, label }) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: color + '18' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function TransactionCard({
  transaction,
  mode,
  onAccept,
  onReject,
  onRequestReturn,
  isActionLoading,
}) {
  const type = transaction?.type || (transaction?.amount !== undefined ? 'PAYMENT' : 'CASH');
  const icon = TRANSACTION_ICON[type] || TRANSACTION_ICON.CASH;
  const products = getProducts(transaction);
  const amount = getTransactionAmount(transaction);
  const canRequestReturn = mode === 'ACTIVE' && transaction?.status === CLIENT_TRANSACTION_STATUSES.ACTIVE;

  return (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={[styles.transactionIcon, { backgroundColor: icon.color + '18' }]}>
          <MaterialCommunityIcons name={icon.name} size={22} color={icon.color} />
        </View>

        <View style={styles.transactionMain}>
          <Text style={styles.transactionTitle}>{TRANSACTION_TYPE_LABELS[type] || type}</Text>
          <Text style={styles.transactionDate}>{formatDate(transaction?.createdAt)}</Text>
        </View>

        <Text style={styles.transactionAmount}>{formatCurrency(amount)}</Text>
      </View>

      {products.length > 0 && (
        <View style={styles.transactionMeta}>
          {products.slice(0, 3).map((product, index) => (
            <Text key={product.id || index} style={styles.productText}>
              {product.name} x{product.quantity} - {formatCurrency(product.price)}
            </Text>
          ))}
          {products.length > 3 && (
            <Text style={styles.productText}>+{products.length - 3} producto(s) mas</Text>
          )}
        </View>
      )}

      {mode === 'PENDING' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => onAccept(transaction.id)}
            disabled={isActionLoading}
          >
            <Text style={styles.primaryActionText}>Aceptar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryAction, styles.dangerAction]}
            onPress={() => onReject(transaction.id)}
            disabled={isActionLoading}
          >
            <Text style={[styles.secondaryActionText, styles.dangerActionText]}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      )}

      {canRequestReturn && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => onRequestReturn(transaction.id)}
            disabled={isActionLoading}
          >
            <Text style={styles.secondaryActionText}>Solicitar devolucion</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function EmptyState({ text }) {
  return (
    <View style={styles.emptyBox}>
      <MaterialCommunityIcons name="playlist-check" size={28} color={theme.colors.textMuted} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export default function ClientHomeScreen() {
  const { profile: authProfile, signOut } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [isProfileFormVisible, setProfileFormVisible] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    avatarUrl: '',
  });

  const {
    data: profile,
    isLoading: isProfileLoading,
    isRefetching: isProfileRefetching,
    refetch: refetchProfile,
  } = useMyProfile();
  const {
    data: paymentHistory,
    isLoading: isHistoryLoading,
    isRefetching: isHistoryRefetching,
    refetch: refetchHistory,
  } = useMyPaymentHistory();
  const {
    data: activeTransactions,
    isLoading: isActiveLoading,
    isRefetching: isActiveRefetching,
    refetch: refetchActive,
  } = useMyTransactions(CLIENT_TRANSACTION_STATUSES.ACTIVE);
  const {
    data: pendingTransactions,
    isLoading: isPendingLoading,
    isRefetching: isPendingRefetching,
    refetch: refetchPending,
  } = useMyTransactions(CLIENT_TRANSACTION_STATUSES.PENDING_APPROVAL);

  const completeProfile = useCompleteMyProfile();
  const acceptTransaction = useAcceptTransaction();
  const rejectTransaction = useRejectTransaction();
  const requestReturn = useRequestTransactionReturn();

  const client = profile || authProfile || {};
  const financialSummary = client.financialSummary || {};
  const statusKey = client.trafficLight || client.paymentTrafficLight || client.paymentStatus || 'VERDE';
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.VERDE;
  const displayName = [client.firstName, client.lastName].filter(Boolean).join(' ') || client.name || 'Cliente';

  const transactionsByTab = useMemo(() => {
    const historyPayments = getHistoryItems(paymentHistory);
    return {
      ACTIVE: getArrayPayload(activeTransactions),
      PENDING: getArrayPayload(pendingTransactions),
      HISTORY: historyPayments,
    };
  }, [activeTransactions, paymentHistory, pendingTransactions]);

  const isTabLoading = (
    (activeTab === 'ACTIVE' && isActiveLoading) ||
    (activeTab === 'PENDING' && isPendingLoading) ||
    (activeTab === 'HISTORY' && isHistoryLoading)
  );

  const isRefreshing = (
    isProfileRefetching ||
    isHistoryRefetching ||
    isActiveRefetching ||
    isPendingRefetching
  );

  const isActionLoading = (
    acceptTransaction.isPending ||
    rejectTransaction.isPending ||
    requestReturn.isPending
  );

  const openProfileForm = () => {
    setProfileForm({
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      phoneNumber: client.phoneNumber || '',
      avatarUrl: client.avatarUrl || '',
    });
    setProfileFormVisible(true);
  };

  const updateProfileField = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const handleRefresh = () => {
    refetchProfile();
    refetchHistory();
    refetchActive();
    refetchPending();
  };

  const handleSaveProfile = () => {
    const firstName = profileForm.firstName.trim();
    const lastName = profileForm.lastName.trim();

    if (!firstName || !lastName) {
      Alert.alert('Perfil incompleto', 'Nombre y apellido son obligatorios.');
      return;
    }

    completeProfile.mutate(
      {
        firstName,
        lastName,
        phoneNumber: profileForm.phoneNumber.trim(),
        avatarUrl: profileForm.avatarUrl.trim(),
      },
      {
        onSuccess: () => {
          setProfileFormVisible(false);
          Alert.alert('Perfil actualizado', 'Tus datos se guardaron correctamente.');
        },
        onError: (error) => {
          Alert.alert('Error', getServerMessage(error, 'No se pudo guardar el perfil.'));
        },
      }
    );
  };

  const handleAccept = (transactionId) => {
    acceptTransaction.mutate(transactionId, {
      onSuccess: () => Alert.alert('Venta aceptada', 'La venta a credito quedo activa.'),
      onError: (error) => Alert.alert('Error', getServerMessage(error, 'No se pudo aceptar la venta.')),
    });
  };

  const handleReject = (transactionId) => {
    Alert.alert(
      'Rechazar venta',
      'La venta pendiente se cancelara.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: () => {
            rejectTransaction.mutate(transactionId, {
              onSuccess: () => Alert.alert('Venta rechazada', 'La venta fue cancelada.'),
              onError: (error) => Alert.alert('Error', getServerMessage(error, 'No se pudo rechazar la venta.')),
            });
          },
        },
      ]
    );
  };

  const handleRequestReturn = (transactionId) => {
    Alert.alert(
      'Solicitar devolucion',
      'Se enviara una solicitud para que administracion la revise.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Solicitar',
          onPress: () => {
            requestReturn.mutate(transactionId, {
              onSuccess: () => Alert.alert('Solicitud enviada', 'Administracion revisara la devolucion.'),
              onError: (error) => Alert.alert('Error', getServerMessage(error, 'No se pudo solicitar la devolucion.')),
            });
          },
        },
      ]
    );
  };

  if (isProfileLoading && !profile) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const currentTransactions = transactionsByTab[activeTab] || [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                {client.avatarUrl ? (
                  <Image source={{ uri: client.avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <MaterialCommunityIcons name="account" size={30} color={theme.colors.primary} />
                )}
              </View>
              <View style={styles.headerText}>
                <Text style={styles.greeting}>Mi cuenta</Text>
                <Text style={styles.name}>{displayName}</Text>
                <Text style={styles.meta}>{client.email || authProfile?.email}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={signOut} activeOpacity={0.75}>
              <MaterialCommunityIcons name="logout" size={18} color={theme.colors.primary} />
              <Text style={styles.logoutText}>Salir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusTop}>
              <View>
                <Text style={styles.statusLabel}>Estado de pago</Text>
                <Text style={styles.statusValue}>{status.label}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                <Text style={styles.statusBadgeText}>{statusKey}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.cardsGrid}>
            <MetricCard
              icon="trending-down"
              color={theme.colors.danger}
              value={formatCurrency(financialSummary.currentDebt)}
              label="Deuda"
            />
            <MetricCard
              icon="credit-card-check-outline"
              color={theme.colors.success}
              value={formatCurrency(financialSummary.availableCredit)}
              label="Disponible"
            />
            <MetricCard
              icon="wallet-outline"
              color={theme.colors.info}
              value={formatCurrency(client.balance)}
              label="Monedero"
            />
            <TouchableOpacity style={styles.metricCard} onPress={openProfileForm}>
              <View style={[styles.metricIcon, { backgroundColor: theme.colors.primary + '18' }]}>
                <MaterialCommunityIcons name="account-edit-outline" size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.metricValue}>{client.level || 'BRONCE'}</Text>
              <Text style={styles.metricLabel}>Editar perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabs}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'ACTIVE' ? 'Transacciones activas' : activeTab === 'PENDING' ? 'Por aprobar' : 'Historial'}
          </Text>

          {isTabLoading ? (
            <View style={styles.emptyBox}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : currentTransactions.length === 0 ? (
            <EmptyState
              text={
                activeTab === 'PENDING'
                  ? 'No tienes ventas pendientes por aceptar.'
                  : 'No hay movimientos para mostrar.'
              }
            />
          ) : (
            currentTransactions.map((transaction, index) => (
              <TransactionCard
                key={transaction.id || transaction.paymentId || index}
                transaction={transaction}
                mode={activeTab}
                onAccept={handleAccept}
                onReject={handleReject}
                onRequestReturn={handleRequestReturn}
                isActionLoading={isActionLoading}
              />
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isProfileFormVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileFormVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar perfil</Text>

            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={profileForm.firstName}
              onChangeText={(value) => updateProfileField('firstName', value)}
              placeholder="Nombre"
            />

            <Text style={styles.inputLabel}>Apellido</Text>
            <TextInput
              style={styles.input}
              value={profileForm.lastName}
              onChangeText={(value) => updateProfileField('lastName', value)}
              placeholder="Apellido"
            />

            <Text style={styles.inputLabel}>Telefono</Text>
            <TextInput
              style={styles.input}
              value={profileForm.phoneNumber}
              onChangeText={(value) => updateProfileField('phoneNumber', value)}
              placeholder="+525512345678"
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Avatar URL</Text>
            <TextInput
              style={styles.input}
              value={profileForm.avatarUrl}
              onChangeText={(value) => updateProfileField('avatarUrl', value)}
              placeholder="https://..."
              autoCapitalize="none"
              keyboardType="url"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.secondaryAction}
                onPress={() => setProfileFormVisible(false)}
                disabled={completeProfile.isPending}
              >
                <Text style={styles.secondaryActionText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryAction}
                onPress={handleSaveProfile}
                disabled={completeProfile.isPending}
              >
                <Text style={styles.primaryActionText}>
                  {completeProfile.isPending ? 'Guardando...' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
