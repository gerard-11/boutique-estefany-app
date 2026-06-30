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
import { useClientEnrichedProfile, useClientPaymentHistory, useUpdateFinancial } from '../../hooks/useClients';
import { useCreatePayment } from '../../hooks/usePayments';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { styles } from './ClientDetailScreen.styles';
import { theme } from '../../theme';

// Subcomponentes
import ProfileHeader from './components/ProfileHeader';
import FinancialCards from './components/FinancialCards';
import TransactionItem from './components/TransactionItem';

const formatCurrency = (value = 0) => String.fromCharCode(36) + Number(value || 0).toLocaleString();

const parsePaymentAmount = (value) => {
  const normalized = value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  return Number(normalized);
};

const formatNumberInput = (value = 0) => String(Number(value || 0));

const TABS = [
  { id: "ACTIVE_DEBTS", label: "Deudas" },
  { id: "HISTORY", label: "Historial" },
];

const LEVEL_OPTIONS = ['BRONCE', 'PLATA', 'ORO'];

const getMovementDate = (item) => item?.paymentDate || item?.createdAt || item?.transaction?.createdAt;

const getMovementKey = (item, index) => (
  item?.id || item?.paymentId || item?.transactionId || item?.transaction?.id || `movement-${index}`
);

const mergeMovementsById = (...groups) => {
  const merged = new Map();

  groups.flat().filter(Boolean).forEach((item, index) => {
    const key = getMovementKey(item, index);
    merged.set(String(key), item);
  });

  return Array.from(merged.values()).sort((a, b) => {
    const dateA = getMovementDate(a);
    const dateB = getMovementDate(b);
    return new Date(dateB) - new Date(dateA);
  });
};

export default function ClientDetailScreen({ route, navigation }) {
  const { clientId } = route.params || {};
  const [activeTab, setActiveTab] = useState('ACTIVE_DEBTS');
  const [isPaymentFormVisible, setPaymentFormVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isFinancialFormVisible, setFinancialFormVisible] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('BRONCE');
  const [creditLimitInput, setCreditLimitInput] = useState('0');
  const [financialReason, setFinancialReason] = useState('');


  const { 
    data: profile, 
    isLoading: isProfileLoading, 
    refetch: refetchProfile, 
    isRefetching: isRefetchingProfile 
  } = useClientEnrichedProfile(clientId);

  const {
    data: paymentHistory,
    isLoading: isPaymentHistoryLoading,
    refetch: refetchPaymentHistory,
    isRefetching: isRefetchingPaymentHistory,
  } = useClientPaymentHistory(clientId);

  const { mutate: createPayment, isPending: isSavingPayment } = useCreatePayment();
  const { mutate: updateFinancial, isPending: isSavingFinancial } = useUpdateFinancial();

  const paymentValue = useMemo(() => parsePaymentAmount(paymentAmount), [paymentAmount]);
  const currentDebt = profile?.financialSummary?.currentDebt || 0;
  const debtAfterPayment = Math.max(currentDebt - (Number.isFinite(paymentValue) ? paymentValue : 0), 0);

  const closePaymentForm = () => {
    if (isSavingPayment) return;
    setPaymentFormVisible(false);
    setPaymentAmount("");
  };

  const openFinancialForm = () => {
    setSelectedLevel(profile?.level || "BRONCE");
    setCreditLimitInput(formatNumberInput(profile?.creditLimit));
    setFinancialReason("");
    setFinancialFormVisible(true);
  };

  const closeFinancialForm = () => {
    if (isSavingFinancial) return;
    setFinancialFormVisible(false);
    setFinancialReason("");
  };

  const handleUpdateFinancial = () => {
    const creditLimit = parsePaymentAmount(creditLimitInput);
    const reason = financialReason.trim();

    if (!LEVEL_OPTIONS.includes(selectedLevel)) {
      Alert.alert("Nivel inválido", "Selecciona BRONCE, PLATA u ORO.");
      return;
    }

    if (!Number.isFinite(creditLimit) || creditLimit < 0) {
      Alert.alert("Límite inválido", "El límite de crédito debe ser un número mayor o igual a cero.");
      return;
    }

    if (!reason) {
      Alert.alert("Razón requerida", "Escribe la razón del cambio para dejar registro administrativo.");
      return;
    }

    updateFinancial(
      {
        userId: clientId,
        data: {
          level: selectedLevel,
          creditLimit,
          reason,
        },
      },
      {
        onSuccess: () => {
          Alert.alert("Cliente actualizado", "Los datos financieros se guardaron correctamente.");
          setFinancialFormVisible(false);
          setFinancialReason("");
          refetchProfile();
        },
        onError: (error) => {
          const serverError = error?.response?.data;
          const errorMessage = Array.isArray(serverError?.message)
            ? serverError.message.join("\n")
            : serverError?.message || error.message || "No se pudo actualizar el cliente";
          Alert.alert("Error", String(errorMessage));
        },
      }
    );
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
          refetchPaymentHistory();
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
    const historyPayments = Array.isArray(paymentHistory?.payments) ? paymentHistory.payments : [];
    const profilePayments = profile?.payments || [];
    const profileTransactions = paymentHistory ? [] : profile?.transactions || [];

    return mergeMovementsById(historyPayments, profilePayments, profileTransactions);
  }, [paymentHistory, profile]);

  const activeDebts = useMemo(() => {
    const activeAccounts = paymentHistory?.activeAccounts;
    if (Array.isArray(activeAccounts)) return activeAccounts;

    return allMovements.filter(item => {
      const isTx = item.totalAmount !== undefined && item.type !== 'PAYMENT';
      const isNotDone = item.status !== 'COMPLETED';
      return isTx && isNotDone;
    });
  }, [allMovements, paymentHistory]);

  const shouldShowPaymentHistoryLoader = isPaymentHistoryLoading && !paymentHistory;

  const handleRefresh = () => {
    refetchProfile();
    refetchPaymentHistory();
  };

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
            refreshing={isRefetchingProfile || isRefetchingPaymentHistory} 
            onRefresh={handleRefresh} 
          />
        }
      >
        <ProfileHeader
          user={profile}
          onRegisterPayment={() => setPaymentFormVisible(true)}
          onEditFinancial={openFinancialForm}
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
              {shouldShowPaymentHistoryLoader ? (
                <View style={styles.emptyContainer}>
                  <ActivityIndicator size="small" color="#d63384" />
                </View>
              ) : activeDebts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay deudas activas.</Text>
                </View>
              ) : (
                activeDebts.map((item, idx) => (
                  <TransactionItem key={item.id || idx} item={item} clientId={clientId} />
                ))
              )}
            </>
          )}

          {activeTab === 'HISTORY' && (
            <>
              <Text style={styles.sectionTitle}>Todos los movimientos</Text>
              {shouldShowPaymentHistoryLoader ? (
                <View style={styles.emptyContainer}>
                  <ActivityIndicator size="small" color="#d63384" />
                </View>
              ) : allMovements.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay pagos registrados.</Text>
                </View>
              ) : (
                allMovements.map((item, idx) => (
                  <TransactionItem key={getMovementKey(item, idx)} item={item} clientId={clientId} />
                ))
              )}
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

      <Modal
        visible={isFinancialFormVisible}
        transparent
        animationType="slide"
        onRequestClose={closeFinancialForm}
      >
        <KeyboardAvoidingView
          style={styles.paymentModalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.paymentModalCard}>
            <Text style={styles.paymentModalTitle}>Editar datos financieros</Text>
            <Text style={styles.paymentModalSubtitle}>{profile.firstName} {profile.lastName}</Text>

            <Text style={styles.paymentInputLabel}>Nivel del cliente</Text>
            <View style={styles.levelSelector}>
              {LEVEL_OPTIONS.map((level) => {
                const isSelected = selectedLevel === level;
                return (
                  <TouchableOpacity
                    key={level}
                    style={[styles.levelOption, isSelected && styles.levelOptionActive]}
                    onPress={() => setSelectedLevel(level)}
                    disabled={isSavingFinancial}
                  >
                    <Text style={[styles.levelOptionText, isSelected && styles.levelOptionTextActive]}>
                      {level}
                    </Text>
                    {isSelected && (
                      <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.paymentInputLabel}>Límite de crédito</Text>
            <View style={styles.paymentInputWrapper}>
              <Text style={styles.paymentCurrencyPrefix}>{String.fromCharCode(36)}</Text>
              <TextInput
                style={styles.paymentInput}
                value={creditLimitInput}
                onChangeText={setCreditLimitInput}
                placeholder="0.00"
                keyboardType="decimal-pad"
                returnKeyType="next"
              />
            </View>

            <Text style={styles.paymentInputLabel}>Razón del cambio</Text>
            <TextInput
              style={styles.financialReasonInput}
              value={financialReason}
              onChangeText={setFinancialReason}
              placeholder="Ej. Buen historial de pagos"
              multiline
              textAlignVertical="top"
              editable={!isSavingFinancial}
            />

            <View style={styles.paymentActions}>
              <TouchableOpacity
                style={styles.paymentCancelButton}
                onPress={closeFinancialForm}
                disabled={isSavingFinancial}
              >
                <Text style={styles.paymentCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentSubmitButton, isSavingFinancial && styles.paymentSubmitButtonDisabled]}
                onPress={handleUpdateFinancial}
                disabled={isSavingFinancial}
              >
                <Text style={styles.paymentSubmitText}>{isSavingFinancial ? "Guardando..." : "Guardar cambios"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
