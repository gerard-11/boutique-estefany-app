import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useProducts } from '../hooks/useProducts';
import { styles } from './CatalogScreen.styles';

export default function CatalogScreen() {
  // Consumo desde la capa de Hooks (Arquitectura Empresarial)
  const { 
    data: products, 
    isLoading, 
    isError, 
    refetch,
    isRefetching 
  } = useProducts();

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      {/* Usamos un fallback si el producto no tiene imagen o falla el servidor de imágenes */}
      <Image 
        source={{ uri: item.imageUrl || 'https://picsum.photos/id/21/400/600' }} 
        style={styles.image} 
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.price}>${item.price}</Text>
        {/* Aquí la lógica de Admin para ver el costo podría ir condicionada */}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d63384" />
        <Text style={styles.loadingText}>Cargando catálogo real...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Oops! Error del servidor, estamos trabajando en ello.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Reintentar conexión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Boutique Estefany</Text>
        <Text style={styles.subtitle}>Nueva Colección</Text>
      </View>
      
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch} 
            colors={['#d63384']} 
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No hay productos disponibles por ahora.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

