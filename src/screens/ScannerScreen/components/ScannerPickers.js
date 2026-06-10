import React from 'react';
import { Modal, View, FlatList, TouchableOpacity, Text, TextInput } from 'react-native';
import { styles } from '../ScannerScreen.styles';
import { theme } from '../../../theme';

export const ScannerPickers = ({ 
  picker, 
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
          <View style={{ backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <FlatList
              data={[{ id: 'NEW', name: '+ Crear Nuevo' }, ...(picker.type === 'department' ? departmentsData : availableCategories)]}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={{ padding: 15, borderBottomWidth: 1, borderColor: '#eee' }}
                  onPress={() => onSelectItem(item)}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id.toString()}
            />
            <TouchableOpacity onPress={onClosePicker}>
              <Text style={{ textAlign: 'center', marginTop: 10, color: theme.colors.primary }}>Cerrar</Text>
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
