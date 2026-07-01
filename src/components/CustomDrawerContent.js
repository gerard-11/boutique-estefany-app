import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { styles } from './CustomDrawerContent.styles';

export default function CustomDrawerContent(props) {
  const { signOut } = useContext(AuthContext);
  
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      <View style={styles.header}>
        <Text style={styles.brandName}>Boutique Estefany</Text>
        <Text style={styles.brandSubtitle}>Panel de Administración</Text>
      </View>
      
      <DrawerItemList {...props} />
      
      <View style={styles.footer}>
        <DrawerItem
          label="Cerrar Sesión"
          icon={({ color, size }) => (
            <MaterialCommunityIcons name="logout" color={color} size={size} />
          )}
          onPress={signOut}
          inactiveTintColor="#e74c3c"
          labelStyle={styles.logoutLabel}
        />
      </View>
    </DrawerContentScrollView>
  );
}
