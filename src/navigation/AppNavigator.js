import React, { useContext } from 'react';
import { View, ActivityIndicator, Text, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { AuthContext } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import InventoryScreen from '../screens/InventoryScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Componente personalizado para el contenido del Drawer (opcional para logout etc)
function CustomDrawerContent(props) {
  const { logout } = useContext(AuthContext);
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#f4f4f4', marginBottom: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#d63384' }}>Boutique Estefany</Text>
        <Text style={{ fontSize: 12, color: '#666' }}>Panel de Administración</Text>
      </View>
      <DrawerItemList {...props} />
      <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 20 }}>
        <DrawerItem
          label="Cerrar Sesión"
          icon={({ color, size }) => <MaterialCommunityIcons name="logout" color={color} size={size} />}
          onPress={logout}
          inactiveTintColor="#e74c3c"
          labelStyle={{ fontWeight: 'bold' }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

function AdminDrawer() {
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
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} />
        }}
      />
      <Drawer.Screen 
        name="Inventory" 
        component={InventoryScreen} 
        options={{
          title: 'Inventario',
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="package-variant-closed" color={color} size={size} />
        }}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoading, userToken, profile } = useContext(AuthContext);

  console.log('AppNavigator: Estado -> isLoading:', isLoading, 'userToken:', !!userToken, 'Role:', profile?.role);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#d63384" />
        <Text style={{ marginTop: 10, color: '#666' }}>Sincronizando Boutique...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
          />
        ) : (
          <>
            {/* Si es ADMIN, su "Home" es el Drawer */}
            {profile?.role === 'ADMIN' ? (
              <Stack.Screen 
                name="AdminHome" 
                component={AdminDrawer} 
              />
            ) : (
              /* Si es CLIENT y ya no hay catálogo, podemos mostrar una pantalla de bienvenida o el mismo login */
              <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
