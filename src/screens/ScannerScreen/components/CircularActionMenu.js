import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
  interpolate
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './CircularActionMenu.styles';
import { theme } from '../../../theme';

const RADIUS = 110;

const AnimatedButton = ({ index, total, expansion, action, onPress }) => {
  const angle = total === 1 
    ? 270 
    : 180 + (index * (180 / (total - 1)));
  
  const rad = (angle * Math.PI) / 180;

  const animatedStyle = useAnimatedStyle(() => {
    const x = Math.cos(rad) * RADIUS * expansion.value;
    const y = Math.sin(rad) * RADIUS * expansion.value;
    const scale = expansion.value;
    const opacity = expansion.value;

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale }
      ],
      opacity
    };
  });

  return (
    <Animated.View style={[styles.actionButton, animatedStyle]}>
      <TouchableOpacity 
        onPress={onPress}
        style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
      >
        <MaterialCommunityIcons name={action.icon} color={action.color} size={28} />
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>{action.label}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const CircularActionMenu = ({ product, onTransaction, onStockAdjustment, onReturn }) => {
  const expansion = useSharedValue(0);
  
  const status = product?.inventoryStatus?.status || 'AVAILABLE';
  const isAvailable = status === 'AVAILABLE';
  const isApartado = status === 'APARTADO';
  const isPrestamo = status === 'PRESTAMO';

  useEffect(() => {
    expansion.value = withSpring(1, { damping: 12, stiffness: 90 });
  }, []);

  const actions = [];

  if (isAvailable) {
    actions.push(
      { type: 'SALE', icon: 'cart-arrow-down', label: 'Venta', color: theme.colors.primary },
      { type: 'PRESTAMO', icon: 'hand-heart', label: 'Prestado', color: '#339af0' },
      { type: 'APARTADO', icon: 'bookmark-check', label: 'Apartar', color: '#fcc419' },
      { type: 'STOCK', icon: 'plus-box-multiple', label: 'Stock', color: '#51cf66' }
    );
  } else if (isApartado) {
    actions.push(
      { type: 'SALE', icon: 'cash-check', label: 'Vender', color: theme.colors.primary },
      { type: 'RETURN', icon: 'lock-open-variant', label: 'Liberar', color: '#fa5252' }
    );
  } else if (isPrestamo) {
    actions.push(
      { type: 'RETURN', icon: 'keyboard-return', label: 'Devolver', color: '#fa5252' }
    );
  }

  const handleAction = (action) => {
    if (action.type === 'STOCK') onStockAdjustment();
    else if (action.type === 'RETURN') onReturn();
    else onTransaction(action.type);
  };

  const centerIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(expansion.value, [0, 1], [0.8, 1]) }]
  }));

  return (
    <View style={styles.container}>
      {/* Banner de Status si no está disponible */}
      {(isApartado || isPrestamo) && (
        <View style={styles.statusBanner}>
          <MaterialCommunityIcons name="alert-circle" color="#fd7e14" size={20} />
          <Text style={styles.statusText}>
            {isApartado ? 'Apartado por: ' : 'Prestado a: '}
            {product?.inventoryStatus?.assignedTo?.name || 'Cliente'}
          </Text>
        </View>
      )}

      {/* Botón Central (Logo o Icono del Producto) */}
      <Animated.View style={[styles.centerPoint, centerIconStyle]}>
        <MaterialCommunityIcons name="tag-heart" color="#fff" size={40} />
      </Animated.View>

      {/* Botones de Acción Distribuidos */}
      {actions.map((action, index) => (
        <AnimatedButton 
          key={action.type + index}
          index={index}
          total={actions.length}
          expansion={expansion}
          action={action}
          onPress={() => handleAction(action)}
        />
      ))}
    </View>
  );
};
