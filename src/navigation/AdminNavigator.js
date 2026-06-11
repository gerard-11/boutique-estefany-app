import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ClientsScreen from '../screens/ClientsScreen';
import ScannerScreen from '../screens/ScannerScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';

const Drawer = createDrawerNavigator();

export default function AdminNavigator() {
  return (
    <Drawer.Navigator 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerTintColor: '#d63384',
        headerTitleStyle: { fontWeight: 'bold' },
        drawerActiveBackgroundColor: 'rgba(214, 51, 132, 0.1)',
        drawerActiveTintColor: '#d63384',
        drawerInactiveTintColor: '#666',
        drawerLabelStyle: { marginLeft: -10, fontWeight: '600' }
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={AdminDashboardScreen} 
        options={{
          title: 'Resumen',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} />
          )
        }}
      />
      <Drawer.Screen 
        name="Clients" 
        component={ClientsScreen} 
        options={{
          title: 'Clientes',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group-outline" color={color} size={size} />
          )
        }}
      />
      <Drawer.Screen 
        name="Inventory" 
        component={InventoryScreen} 
        options={{
          title: 'Inventario',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="package-variant-closed" color={color} size={size} />
          )
        }}
      />
      <Drawer.Screen 
        name="Scanner" 
        component={ScannerScreen} 
        options={{
          title: 'Escáner',
          headerShown: false,
          drawerItemStyle: { display: 'none' }
        }}
      />
    </Drawer.Navigator>
  );
}
