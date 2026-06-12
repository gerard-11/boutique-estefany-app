import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../ClientDetailScreen.styles';
import { theme } from '../../../theme';

const STATUS_CONFIG = {
  NORMAL: { color: '#40c057', label: 'Al día' },
  RETRASADO: { color: '#fab005', label: 'Pago Pendiente' },
  ATRASADO: { color: '#fa5252', label: 'Atrasado' },
};

const LEVEL_COLORS = {
  ORO: '#fcc419',
  PLATA: '#adb5bd',
  BRONCE: '#d9480f',
};

const ProfileHeader = ({ user, onRegisterPayment }) => {
  const status = STATUS_CONFIG[user.paymentStatus] || STATUS_CONFIG.NORMAL;
  const levelColor = LEVEL_COLORS[user.level] || theme.colors.textSecondary;

  return (
    <View style={styles.profileHeader}>
      <View style={styles.headerTopRow}>
        <View style={styles.avatarContainer}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <MaterialCommunityIcons name="account" size={50} color={theme.colors.textSecondary} />
          )}
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
              <Text style={styles.levelText}>{user.level}</Text>
            </View>
            <View style={[styles.statusBadge, { borderColor: status.color }]}>
              <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.registerPaymentButton}
        onPress={onRegisterPayment}
      >
        <MaterialCommunityIcons name="cash-register" size={20} color="#fff" />
        <Text style={styles.registerPaymentText}>Registrar Pago</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileHeader;
