import React from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../ClientDetailScreen.styles';
import { theme } from '../../../theme';

const WishlistTab = ({ items, isLoading }) => {
  if (isLoading) {
    return <Text style={styles.loadingText}>Cargando intereses...</Text>;
  }

  if (!items || items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="heart-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>El cliente no tiene productos en su lista de deseos.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.wishlistItem}>
      <View style={styles.wishlistInfo}>
        <Text style={styles.wishlistName}>{item.name}</Text>
        <Text style={styles.wishlistPrice}>${item.price?.toLocaleString()}</Text>
        <Text style={styles.wishlistDate}>Agregado el {new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity style={styles.offerButton}>
        <Text style={styles.offerButtonText}>Ofertar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.wishlistList}
      scrollEnabled={false} // Se maneja por el ScrollView padre
    />
  );
};

// Necesitamos importar TouchableOpacity para el botón de ofertar
import { TouchableOpacity } from 'react-native';

export default WishlistTab;
