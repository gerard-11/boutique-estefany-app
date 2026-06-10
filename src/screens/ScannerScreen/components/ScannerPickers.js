import React from 'react';
import { Modal, View, FlatList, TouchableOpacity, Text, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../ScannerScreen.styles';
import { theme } from '../../../theme';

export const ScannerPickers = ({ 
  picker, 
  selectedId,
  departmentsData, 
  availableCategories, 
  showClientPicker, 
  userSearch, 
  clients, 
  onClosePicker, 
  onSelectItem, 
  onUpdateUserSearch, 
  onSelectClient, 
  onCloseClientPicker 
}) => {
  return (
    <>
      {/* Picker Modal (Deptos/Categorías) */}
      <Modal visible={picker.visible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: theme.colors.text }}>
              Seleccionar {picker.type === 'department' ? 'Departamento' : 'Categoría'}
            </Text>
            <FlatList
              data={[{ id: 'NEW', name: '+ Crear Nuevo' }, ...(picker.type === 'department' ? departmentsData : availableCategories)]}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedId;
                return (
                  <TouchableOpacity 
                    style={{ 
                      padding: 15, 
                      borderBottomWidth: 1, 
                      borderColor: '#eee',
                      backgroundColor: isSelected ? theme.colors.primary + '15' : 'transparent',
                      borderRadius: 8,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onPress={() => onSelectItem(item)}
                  >
                    <Text style={{ 
                      color: isSelected ? theme.colors.primary : theme.colors.text,
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }}>
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
            <TouchableOpacity onPress={onClosePicker} style={{ paddingVertical: 15 }}>
              <Text style={{ textAlign: 'center', fontWeight: 'bold', color: theme.colors.primary }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Client Picker Modal */}
      <Modal visible={showClientPicker} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
           <View style={{ backgroundColor: '#fff', padding: 20, height: '70%', borderTopLeftRadius: 25, borderTopRightRadius: 25 }}>
              <TextInput 
                placeholder="Buscar cliente..." 
                style={styles.input} 
                value={userSearch}
                onChangeText={onUpdateUserSearch}
              />
              <FlatList
                data={clients}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.clientItem} onPress={() => onSelectClient(item)}>
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.id.toString()}
              />
              <TouchableOpacity onPress={onCloseClientPicker}>
                 <Text style={{ textAlign: 'center', color: 'red', marginTop: 10 }}>Cancelar</Text>
              </TouchableOpacity>
           </View>
        </View>
      </Modal>
    </>
  );
};
