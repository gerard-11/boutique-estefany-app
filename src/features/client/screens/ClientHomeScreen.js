import React, { useContext, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { theme } from '../../../theme';
import {
  CLIENT_TRANSACTION_STATUSES,
  useAcceptTransaction,
  useCompleteMyProfile,
  useMyProfile,
  useMyPaymentHistory,
  useRejectTransaction,
  useRequestTransactionReturn,
} from '../hooks/useClientPortal';
import ClientHeader from '../components/ClientHeader';
import ClientMetricsGrid from '../components/ClientMetricsGrid';
import ClientTabs from '../components/ClientTabs';
import ClientTransactionsSection from '../components/ClientTransactionsSection';
import ProfileFormModal from '../components/ProfileFormModal';
import {
  CLIENT_HOME_TABS,
  getProfileTransactionsByStatus,
  getClientDisplayName,
  getHistoryItems,
  getPaymentStatus,
  getServerMessage,
} from '../utils/clientPortalUtils';
import { styles } from './ClientHomeScreen.styles';

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
  const rejectTransaction = useRejectTransaction();
  const requestReturn = useRequestTransactionReturn();

  const client = profile || authProfile || {};
  const financialSummary = client.financialSummary || {};
  const displayName = getClientDisplayName(client);

  const paymentStatus = getPaymentStatus(client);

  const profileInitialValues = useMemo(() => ({
    firstName: client.firstName || '',
    lastName: client.lastName || '',
    phoneNumber: client.phoneNumber || '',
  }), [client.firstName, client.lastName, client.phoneNumber]);

  const transactionsByTab = useMemo(() => ({
    ACTIVE: getProfileTransactionsByStatus(client, CLIENT_TRANSACTION_STATUSES.ACTIVE),
    PENDING: getProfileTransactionsByStatus(client, CLIENT_TRANSACTION_STATUSES.PENDING_APPROVAL),
    HISTORY: getHistoryItems(paymentHistory),
  }), [client, paymentHistory]);

  const isTabLoading = activeTab === 'HISTORY'
    ? isHistoryLoading && !paymentHistory
    : isProfileLoading && !profile;

  const isRefreshing = isProfileRefetching || isHistoryRefetching;

  const isActionLoading = (
    acceptTransaction.isPending ||
    rejectTransaction.isPending ||
    requestReturn.isPending
  );

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
          paymentStatus={paymentStatus}
          onSignOut={signOut}
        />

        <ClientMetricsGrid
          client={client}
          financialSummary={financialSummary}
          onEditProfile={openProfileForm}
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
          onReject={handleReject}
          onRequestReturn={handleRequestReturn}
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
