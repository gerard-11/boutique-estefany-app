import React, { useContext, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { TRANSACTION_TYPE_LABELS } from '../../../constants/transactionTypes';
import { theme } from '../../../theme';
import {
  CLIENT_TRANSACTION_STATUSES,
  useAcceptTransaction,
  useCompleteMyProfile,
  useMyProfile,
  useMyPaymentHistory,
} from '../hooks/useClientPortal';
import ClientHeader from '../components/ClientHeader';
import ClientMetricsGrid from '../components/ClientMetricsGrid';
import ClientLevelCard from '../components/ClientLevelCard';
import ClientPaymentStatusCard from '../components/ClientPaymentStatusCard';
import ClientTabs from '../components/ClientTabs';
import ClientTransactionsSection from '../components/ClientTransactionsSection';
import ProfileFormModal from '../components/ProfileFormModal';
import {
  CLIENT_HOME_TABS,
  getActiveTransactions,
  getProfileTransactionsByStatus,
  getClientDisplayName,
  getHistoryItems,
  getServerMessage,
  getTransactionId,
  getTransactionProductTitle,
  getTransactionType,
} from '../utils/clientPortalUtils';
import { getClientPaymentStatus, getLastPaymentSummary } from '../utils/paymentStatusUtils';
import { styles } from './ClientHomeScreen.styles';

const SUPPORT_WHATSAPP_NUMBER = process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP_NUMBER || '';

export default function ClientHomeScreen() {
  const { profile: authProfile, signOut } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [isProfileFormVisible, setProfileFormVisible] = useState(false);

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

  const completeProfile = useCompleteMyProfile();
  const acceptTransaction = useAcceptTransaction();

  const client = profile || authProfile || {};
  const financialSummary = client.financialSummary || {};
  const displayName = getClientDisplayName(client);

  const paymentStatus = getClientPaymentStatus(client);
  const lastPayment = useMemo(() => (
    getLastPaymentSummary(client, paymentHistory)
  ), [client, paymentHistory]);

  const profileInitialValues = useMemo(() => ({
    firstName: client.firstName || '',
    lastName: client.lastName || '',
    phoneNumber: client.phoneNumber || '',
  }), [client.firstName, client.lastName, client.phoneNumber]);

  const transactionsByTab = useMemo(() => ({
    ACTIVE: getActiveTransactions(client, paymentHistory),
    PENDING: getProfileTransactionsByStatus(client, CLIENT_TRANSACTION_STATUSES.PENDING_APPROVAL),
    HISTORY: getHistoryItems(paymentHistory),
  }), [client, paymentHistory]);

  const isTabLoading = activeTab === 'HISTORY'
    ? isHistoryLoading && !paymentHistory
    : activeTab === 'ACTIVE'
      ? (isProfileLoading && !profile) || (isHistoryLoading && !paymentHistory)
      : isProfileLoading && !profile;

  const isRefreshing = isProfileRefetching || isHistoryRefetching;

  const isActionLoading = acceptTransaction.isPending;

  const openProfileForm = () => {
    setProfileFormVisible(true);
  };

  const closeProfileForm = () => {
    if (completeProfile.isPending) return;
    setProfileFormVisible(false);
  };

  const handleRefresh = () => {
    refetchProfile();
    refetchHistory();
  };

  const handleSaveProfile = (formValues) => {
    completeProfile.mutate(
      {
        firstName: formValues.firstName.trim(),
        lastName: formValues.lastName.trim(),
        phoneNumber: formValues.phoneNumber.trim(),
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
    if (!transactionId) {
      Alert.alert('Error', 'No se pudo identificar la venta.');
      return;
    }

    acceptTransaction.mutate(transactionId, {
      onSuccess: () => Alert.alert('Venta aceptada', 'La venta a credito quedo activa.'),
      onError: (error) => Alert.alert('Error', getServerMessage(error, 'No se pudo aceptar la venta.')),
    });
  };

  const handleRequestClarification = (transaction) => {
    const supportNumber = SUPPORT_WHATSAPP_NUMBER.replace(/\D/g, '');

    if (!supportNumber) {
      Alert.alert('WhatsApp no configurado', 'Configura EXPO_PUBLIC_SUPPORT_WHATSAPP_NUMBER antes de compilar el APK.');
      return;
    }

    const transactionId = getTransactionId(transaction);
    const productTitle = getTransactionProductTitle(transaction);
    const type = getTransactionType(transaction);
    const typeLabel = TRANSACTION_TYPE_LABELS[type] || type;
    const message = [
      'Hola, necesito una aclaracion sobre esta venta pendiente:',
      'Producto: ' + productTitle,
      'Tipo: ' + typeLabel,
      transactionId ? 'Venta: ' + transactionId : null,
    ].filter(Boolean).join('\n');

    Alert.alert(
      'Solicitar aclaracion',
      '¿Quieres mandar un mensaje por WhatsApp para aclarar esta venta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Mandar mensaje',
          onPress: () => {
            Linking.openURL('https://wa.me/' + supportNumber + '?text=' + encodeURIComponent(message))
              .catch(() => {
                Alert.alert('No se pudo abrir WhatsApp', 'Verifica que WhatsApp este instalado o intenta mas tarde.');
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

        <ClientHeader
          client={client}
          displayName={displayName}
          email={client.email || authProfile?.email}
          onSignOut={signOut}
        />

        <ClientPaymentStatusCard paymentStatus={paymentStatus} lastPayment={lastPayment} />

        <ClientLevelCard client={client} onEditProfile={openProfileForm} />

        <ClientMetricsGrid
          financialSummary={financialSummary}
        />

        <ClientTabs
          tabs={CLIENT_HOME_TABS}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />

        <ClientTransactionsSection
          activeTab={activeTab}
          transactions={transactionsByTab[activeTab] || []}
          isLoading={isTabLoading}
          isActionLoading={isActionLoading}
          onAccept={handleAccept}
          onRequestClarification={handleRequestClarification}
        />
      </ScrollView>

      <ProfileFormModal
        visible={isProfileFormVisible}
        initialValues={profileInitialValues}
        isSaving={completeProfile.isPending}
        onClose={closeProfileForm}
        onSave={handleSaveProfile}
      />
    </View>
  );
}
