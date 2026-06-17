import React from 'react';
import { Modal, View, FlatList, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../ScannerScreen.styles';
import { theme } from '../../../theme';

export const CategoryPickerModal = ({
  picker,
  selectedId,
  departmentsData = [],
  availableCategories = [],
  onClose,
  onSelectItem,
}) => {
  const data = [
    { id: 'NEW', name: '+ Crear Nuevo' },
    ...(picker.type === 'department' ? departmentsData : availableCategories),
  ];

  return (
    <Modal visible={picker.visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.categoryPickerSheet}>
          <Text style={styles.pickerTitle}>
            Seleccionar {picker.type === 'department' ? 'Departamento' : 'Categoría'}
          </Text>
          <FlatList
            data={data}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedId;

              return (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    isSelected && styles.pickerItemSelected,
                  ]}
                  onPress={() => onSelectItem(item)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      isSelected && styles.pickerItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {isSelected && (
                    <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
            keyExtractor={item => item.id.toString()}
          />
          <TouchableOpacity onPress={onClose} style={styles.pickerCloseButton}>
            <Text style={styles.pickerCloseText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
