import React from 'react';
import { 
  TouchableOpacity 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './ScannerFAB.styles';

export default function ScannerFAB({ onPress }) {
  return (
    <TouchableOpacity 
      style={styles.fab} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons name="barcode-scan" size={28} color="#fff" />
    </TouchableOpacity>
  );
}

