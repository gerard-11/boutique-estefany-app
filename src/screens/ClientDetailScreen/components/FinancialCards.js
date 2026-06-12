import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../ClientDetailScreen.styles';
import { theme } from '../../../theme';

const FinancialCards = ({ balance, debt, availableCredit, creditLimit }) => {
  return (
    <View style={styles.financialSection}>
      <View style={styles.cardsRow}>
        <View style={[styles.fCard, { backgroundColor: '#e7f5ff' }]}>
          <MaterialCommunityIcons name="wallet-outline" size={24} color="#228be6" />
          <Text style={styles.fCardValue}>${balance?.toLocaleString() || '0'}</Text>
          <Text style={styles.fCardLabel}>Monedero</Text>
        </View>

        <View style={[styles.fCard, { backgroundColor: '#fff5f5' }]}>
          <MaterialCommunityIcons name="trending-down" size={24} color="#fa5252" />
          <Text style={[styles.fCardValue, { color: '#fa5252' }]}>${debt?.toLocaleString() || '0'}</Text>
          <Text style={styles.fCardLabel}>Deuda Total</Text>
        </View>
      </View>

      <View style={[styles.fCardLong, { backgroundColor: '#f8f9fa' }]}>
        <View style={styles.fCardLongInfo}>
          <Text style={styles.fCardLongLabel}>Crédito Disponible</Text>
          <Text style={styles.fCardLongValue}>${availableCredit?.toLocaleString() || '0'}</Text>
        </View>
        <View style={styles.creditProgressContainer}>
          <View style={styles.creditProgressBar}>
            <View 
              style={[
                styles.creditProgressFill, 
                { width: `${(availableCredit / creditLimit) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.creditLimitText}>de ${creditLimit?.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
};

export default FinancialCards;
