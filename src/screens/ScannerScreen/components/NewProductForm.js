import React from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { styles } from '../ScannerScreen.styles';
import { theme } from '../../../theme';

export const NewProductForm = ({ barcode, isSaving, onSave, onCancel, onOpenPicker, watchDeptId, watchCatId, watchDeptName, watchCatName }) => {
  const { control, handleSubmit, formState: { errors } } = useFormContext();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.resultsContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.resultTitle}>Nuevo Producto</Text>
        <View style={styles.form}>
          <TextInput
            style={[styles.input, styles.readOnlyInput]}
            value={barcode || 'Código automático'}
            editable={false}
          />
          
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput 
                  style={[styles.input, errors.name && { borderColor: '#ff4444' }]} 
                  placeholder="Nombre *" 
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
              </View>
            )}
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="cost"
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                    style={[styles.input, errors.cost && { borderColor: '#ff4444' }]} 
                    placeholder="Costo *" 
                    keyboardType="decimal-pad"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="price"
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                    style={[styles.input, errors.price && { borderColor: '#ff4444' }]} 
                    placeholder="Precio *" 
                    keyboardType="decimal-pad"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Controller
              control={control}
              name="size"
              render={({ field: { onChange, value } }) => (
                <TextInput style={[styles.input, { flex: 1.5 }]} placeholder="Talla" onChangeText={onChange} value={value} />
              )}
            />
            <Controller
              control={control}
              name="sizeUnit"
              render={({ field: { onChange, value } }) => (
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Unidad" onChangeText={onChange} value={value} />
              )}
            />
            <Controller
              control={control}
              name="color"
              render={({ field: { onChange, value } }) => (
                <TextInput style={[styles.input, { flex: 1.5 }]} placeholder="Color" onChangeText={onChange} value={value} />
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Departamento</Text>
            <TouchableOpacity 
              style={[styles.selectButton, watchDeptId === 'NEW' && { borderColor: theme.colors.primary, borderWidth: 1 }]} 
              onPress={() => onOpenPicker('department')}
            >
              <Text style={{ color: watchDeptId ? '#000' : '#999' }}>
                {watchDeptId === 'NEW' ? '+ Nuevo Departamento' : (watchDeptName || 'Seleccionar departamento...')}
              </Text>
            </TouchableOpacity>
            
            {watchDeptId === 'NEW' && (
              <Controller
                control={control}
                name="departmentName"
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                    style={[styles.input, { marginTop: 5, borderColor: theme.colors.primary }]} 
                    placeholder="Escribe el nombre del departamento *" 
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoría</Text>
            <TouchableOpacity 
              style={[styles.selectButton, watchCatId === 'NEW' && { borderColor: theme.colors.primary, borderWidth: 1 }]} 
              onPress={() => onOpenPicker('category')}
              disabled={!watchDeptId}
            >
              <Text style={{ color: watchCatId ? '#000' : (watchDeptId ? '#999' : '#ccc') }}>
                {watchCatId === 'NEW' ? '+ Nueva Categoría' : (watchCatName || 'Seleccionar categoría...')}
              </Text>
            </TouchableOpacity>

            {watchCatId === 'NEW' && (
              <Controller
                control={control}
                name="categoryName"
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                    style={[styles.input, { marginTop: 5, borderColor: theme.colors.primary }]} 
                    placeholder="Escribe el nombre de la categoría *" 
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            )}
            {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId.message}</Text>}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit(onSave)}>
            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Guardar Producto</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resetButton} onPress={onCancel}>
            <Text style={styles.resetButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};
