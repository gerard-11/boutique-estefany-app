import React from 'react';
import { ActivityIndicator, Modal, View, FlatList, TouchableOpacity, Text, TextInput } from 'react-native';
import { styles } from '../ScannerScreen.styles';
import { theme } from '../../../theme';

export const ClientPickerModal = ({
  visible,
  search,
  clients = [],
  isSelecting = false,
  onSearchChange,
  onSelectClient,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.clientPickerSheet}>
          <TextInput
            placeholder="Buscar cliente..."
            style={styles.input}
            value={search}
            onChangeText={onSearchChange}
          />
          <FlatList
            data={clients}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.clientItem}
                onPress={() => onSelectClient(item)}
                disabled={isSelecting}
              >
                <Text style={styles.clientName}>{item.firstName} {item.lastName}</Text>
                {isSelecting && <ActivityIndicator size="small" color={theme.colors.primary} />}
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id.toString()}
          />
          <TouchableOpacity onPress={onClose} disabled={isSelecting}>
            <Text style={styles.clientPickerCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
