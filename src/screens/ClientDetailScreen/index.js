import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useClientEnrichedProfile } from '../../hooks/useClients';
import { useWishlist } from '../../hooks/useWishlist';
import { useCreatePayment } from '../../hooks/usePayments';
import { styles } from './ClientDetailScreen.styles';

// Subcomponentes
import ProfileHeader from './components/ProfileHeader';
import FinancialCards from './components/FinancialCards';
import TransactionItem from './components/TransactionItem';
import WishlistTab from './components/WishlistTab';

const formatCurrency = (value = 0) => String.fromCharCode(36) + Number(value || 0).toLocaleString();

const parsePaymentAmount = (value) => {
  const normalized = value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  return Number(normalized);
};

const TABS = [
  { id: "ACTIVE_DEBTS", label: "Deudas" },
  { id: "HISTORY", label: "Historial" },
  { id: "WISHLIST", label: "Intereses" },
];

export default function ClientDetailScreen({ route, navigation }) {
  const { clientId } = route.params || {};
  const [activeTab, setActiveTab] = useState('ACTIVE_DEBTS');
  const [isPaymentFormVisible, setPaymentFormVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');


  const { 
    data: profile, 
    isLoading: isProfileLoading, 
    refetch: refetchProfile, 
    isRefetching: isRefetchingProfile 
  } = useClientEnrichedProfile(clientId);

  const { 
    data: wishlist, 
    isLoading: isWishlistLoading 
  } = useWishlist(clientId);

  const { mutate: createPayment, isPending: isSavingPayment } = useCreatePayment();

  const paymentValue = useMemo(() => parsePaymentAmount(paymentAmount), [paymentAmount]);
  const currentDebt = profile?.financialSummary?.currentDebt || 0;
  const debtAfterPayment = Math.max(currentDebt - (Number.isFinite(paymentValue) ? paymentValue : 0), 0);

  const closePaymentForm = () => {
    if (isSavingPayment) return;
    setPaymentFormVisible(false);
    setPaymentAmount("");
  };

  const handleCreatePayment = () => {
    if (!Number.isFinite(paymentValue) || paymentValue <= 0) {
      Alert.alert("Monto inválido", "Ingresa un monto mayor a cero.");
      return;
    }

    createPayment(
      { userId: clientId, amount: paymentValue },
      {
        onSuccess: () => {
          Alert.alert("Pago registrado", "El pago se guardó correctamente.");
          setPaymentFormVisible(false);
          setPaymentAmount("");
          refetchProfile();
        },
        onError: (error) => {
          const serverError = error?.response?.data;
          const errorMessage = Array.isArray(serverError?.message)
            ? serverError.message.join("\n")
            : serverError?.message || error.message || "No se pudo registrar el pago";
          Alert.alert("Error", String(errorMessage));
        },
      }
    );
  };

  const allMovements = useMemo(() => {
    if (!profile) return [];
    const txs = profile.transactions || [];
    const pays = profile.payments || [];
    return [...txs, ...pays].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [profile]);

  const activeDebts = useMemo(() => {
    return allMovements.filter(item => {
      const isTx = item.totalAmount !== undefined && item.type !== 'PAYMENT';
      const isNotDone = item.status !== 'COMPLETED';
      return isTx && isNotDone;
    });
  }, [allMovements]);

  if (isProfileLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#d63384" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error al cargar el perfil</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        stickyHeaderIndices={[2]} // Mantener las Tabs fijas al hacer scroll
        refreshControl={
          <RefreshControl 
            refreshing={isRefetchingProfile} 
            onRefresh={refetchProfile} 
          />
        }
      >
        <ProfileHeader 
          user={profile} 
          onRegisterPayment={() => setPaymentFormVisible(true)} 
        />

        <FinancialCards 
          balance={profile.balance}
          debt={profile.financialSummary?.currentDebt}
          availableCredit={profile.financialSummary?.availableCredit}
          creditLimit={profile.creditLimit}
        />

        {/* Tab Bar Selector */}
        <View style={{ backgroundColor: '#f8f9fa' }}>
          <View style={styles.tabsContainer}>
            {TABS.map(tab => (
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
        </View>

        {/* Contenido Dinámico según Tab */}
        <View style={{ paddingBottom: 40 }}>
          {activeTab === 'ACTIVE_DEBTS' && (
            <>
              <Text style={styles.sectionTitle}>Deudas Pendientes</Text>
              {activeDebts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay deudas activas.</Text>
                </View>
              ) : (
                activeDebts.map((item, idx) => (
                  <TransactionItem key={item.id || idx} item={item} />
                ))
              )}
            </>
          )}

          {activeTab === 'HISTORY' && (
            <>
              <Text style={styles.sectionTitle}>Todos los movimientos</Text>
              {allMovements.map((item, idx) => (
                <TransactionItem key={item.id || idx} item={item} />
              ))}
            </>
          )}

          {activeTab === 'WISHLIST' && (
            <>
              <Text style={styles.sectionTitle}>Intereses del Cliente</Text>
              <WishlistTab items={wishlist} isLoading={isWishlistLoading} />
            </>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isPaymentFormVisible}
        transparent
        animationType="slide"
        onRequestClose={closePaymentForm}
      >
        <KeyboardAvoidingView
          style={styles.paymentModalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.paymentModalCard}>
            <Text style={styles.paymentModalTitle}>Registrar pago</Text>
            <Text style={styles.paymentModalSubtitle}>{profile.firstName} {profile.lastName}</Text>

            <View style={styles.paymentSummaryRow}>
              <Text style={styles.paymentSummaryLabel}>Deuda actual</Text>
              <Text style={styles.paymentSummaryValue}>{formatCurrency(currentDebt)}</Text>
            </View>

            <Text style={styles.paymentInputLabel}>Monto recibido</Text>
            <View style={styles.paymentInputWrapper}>
              <Text style={styles.paymentCurrencyPrefix}>{String.fromCharCode(36)}</Text>
              <TextInput
                style={styles.paymentInput}
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                returnKeyType="done"
                autoFocus
              />
            </View>

            <View style={styles.paymentSummaryRow}>
              <Text style={styles.paymentSummaryLabel}>Deuda después</Text>
              <Text style={styles.paymentSummaryValue}>{formatCurrency(debtAfterPayment)}</Text>
            </View>

            <View style={styles.paymentActions}>
              <TouchableOpacity
                style={styles.paymentCancelButton}
                onPress={closePaymentForm}
                disabled={isSavingPayment}
              >
                <Text style={styles.paymentCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentSubmitButton, isSavingPayment && styles.paymentSubmitButtonDisabled]}
                onPress={handleCreatePayment}
                disabled={isSavingPayment}
              >
                <Text style={styles.paymentSubmitText}>{isSavingPayment ? "Guardando..." : "Guardar pago"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
