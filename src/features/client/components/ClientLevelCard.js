import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../screens/ClientHomeScreen.styles';
import { getClientLevel, getClientLevelColor } from '../utils/clientLevelUtils';

export default function ClientLevelCard({ client, onEditProfile }) {
  const level = getClientLevel(client);
  const levelColor = getClientLevelColor(level);

  return (
    <TouchableOpacity
      style={[styles.levelCard, { borderColor: levelColor, backgroundColor: levelColor + '14' }]}
      onPress={onEditProfile}
      activeOpacity={0.78}
    >
      <View style={[styles.levelCardIcon, { backgroundColor: levelColor + '24' }]}>
        <MaterialCommunityIcons name="star-four-points" size={22} color={levelColor} />
      </View>

      <View style={styles.levelCardTextBlock}>
        <Text style={styles.levelCardLabel}>Tipo de cliente</Text>
        <Text style={[styles.levelCardValue, { color: levelColor }]}>Cliente {level}</Text>
      </View>

      <MaterialCommunityIcons name="account-edit-outline" size={20} color={levelColor} />
    </TouchableOpacity>
  );
}
