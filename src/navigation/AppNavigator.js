import React, { useContext } from 'react';
import { View, ActivityIndicator, Text, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import CatalogScreen from '../screens/CatalogScreen';
import LoginScreen from "../screens/LoginScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoading, userToken } = useContext(AuthContext);

  console.log('AppNavigator: Estado -> isLoading:', isLoading, 'userToken:', !!userToken);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#d63384" />
        <Text style={{ marginTop: 10, color: '#666' }}>Iniciando Boutique...</Text>
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
          <Stack.Screen 
            name="Catalog" 
            component={CatalogScreen} 
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
