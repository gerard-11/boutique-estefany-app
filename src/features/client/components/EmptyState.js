import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../theme';
import { styles } from '../screens/ClientHomeScreen.styles';

export default function EmptyState({ text }) {
  return (
    <View style={styles.emptyBox}>
      <MaterialCommunityIcons name="playlist-check" size={28} color={theme.colors.textMuted} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}
