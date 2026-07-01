import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../screens/ClientHomeScreen.styles';

export default function ClientPaymentStatusCard({ paymentStatus, lastPayment }) {
  return (
    <View style={styles.statusCard}>
      <View style={styles.statusTop}>
        <View>
          <Text style={styles.statusLabel}>Estado de pago</Text>
          <Text style={styles.statusValue}>{paymentStatus.label}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: paymentStatus.color }]}>
          <Text style={styles.statusBadgeText}>{paymentStatus.key}</Text>
        </View>
      </View>

      <View style={styles.lastPaymentBox}>
        <Text style={styles.lastPaymentTitle}>Ultimo pago</Text>
        <View style={styles.lastPaymentRow}>
          <View>
            <Text style={styles.lastPaymentLabel}>Cantidad</Text>
            <Text style={styles.lastPaymentValue}>{lastPayment.amountLabel}</Text>
          </View>
          <View style={styles.lastPaymentDateBlock}>
            <Text style={styles.lastPaymentLabel}>Fecha</Text>
            <Text style={styles.lastPaymentValue}>{lastPayment.dateLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
