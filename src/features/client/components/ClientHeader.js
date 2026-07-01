import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../theme';
import { styles } from '../screens/ClientHomeScreen.styles';

export default function ClientHeader({ client, displayName, email, onSignOut }) {
  return (
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
            <Text style={styles.meta}>{email}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={onSignOut} activeOpacity={0.75}>
          <MaterialCommunityIcons name="logout" size={18} color={theme.colors.primary} />
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
