import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ClientsScreen from '../screens/ClientsScreen';
import ClientDetailScreen from '../screens/ClientDetailScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import ScannerScreen from '../screens/ScannerScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';

const Drawer = createDrawerNavigator();
const ClientsStack = createNativeStackNavigator();

function ClientsNavigator({ navigation }) {
  return (
    <ClientsStack.Navigator
      screenOptions={{
        headerTintColor: '#d63384',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <ClientsStack.Screen
        name="ClientsList"
        component={ClientsScreen}
        options={{
          title: 'Clientes',
          headerLeft: () => (
            <MaterialCommunityIcons
              name="menu"
              size={28}
              color="#d63384"
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
          ),
        }}
      />
      <ClientsStack.Screen
        name="ClientDetail"
        component={ClientDetailScreen}
        options={{
          title: 'Perfil del Cliente',
        }}
      />
    </ClientsStack.Navigator>
  );
}


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
        component={ClientsNavigator} 
        options={{
          title: 'Clientes',
          headerShown: false,
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
        name="Payments"
        component={PaymentsScreen}
        options={{
          title: 'Pagos',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cash-check" color={color} size={size} />
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
