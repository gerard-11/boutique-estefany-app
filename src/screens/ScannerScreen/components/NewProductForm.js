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

const FormField = ({ label, error, children, style }) => (
  <View style={[styles.inputGroup, style]}>
    <Text style={styles.label}>{label}</Text>
    {children}
    {error && <Text style={styles.errorText}>{error.message}</Text>}
  </View>
);

export const NewProductForm = ({ barcode, isSaving, onSave, onCancel, onOpenPicker, watchDeptId, watchCatId, watchDeptName, watchCatName }) => {
  const { control, handleSubmit, formState: { errors } } = useFormContext();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.resultsContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.resultTitle}>Nuevo Producto</Text>
        <View style={styles.form}>
          <FormField label="Código">
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={barcode || 'Código automático'}
              editable={false}
            />
          </FormField>
          
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField label="Nombre *" error={errors.name}>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Ej. Blusa floral"
                  placeholderTextColor={theme.colors.textMuted}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              </FormField>
            )}
          />

          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <Controller
                control={control}
                name="cost"
                render={({ field: { onChange, value } }) => (
                  <FormField label="Costo *" error={errors.cost}>
                    <TextInput
                      style={[styles.input, errors.cost && styles.inputError]}
                      placeholder="0.00"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="decimal-pad"
                      onChangeText={onChange}
                      value={value}
                    />
                  </FormField>
                )}
              />
            </View>
            <View style={styles.formColumn}>
              <Controller
                control={control}
                name="price"
                render={({ field: { onChange, value } }) => (
                  <FormField label="Precio *" error={errors.price}>
                    <TextInput
                      style={[styles.input, errors.price && styles.inputError]}
                      placeholder="0.00"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="decimal-pad"
                      onChangeText={onChange}
                      value={value}
                    />
                  </FormField>
                )}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <Controller
              control={control}
              name="size"
              render={({ field: { onChange, value } }) => (
                <FormField label="Talla" style={styles.formColumn}>
                  <TextInput style={styles.input} placeholder="Ej. M" placeholderTextColor={theme.colors.textMuted} onChangeText={onChange} value={value} />
                </FormField>
              )}
            />
            <Controller
              control={control}
              name="sizeUnit"
              render={({ field: { onChange, value } }) => (
                <FormField label="Unidad" style={styles.formColumn}>
                  <TextInput style={styles.input} placeholder="MX/US" placeholderTextColor={theme.colors.textMuted} onChangeText={onChange} value={value} />
                </FormField>
              )}
            />
            <Controller
              control={control}
              name="color"
              render={({ field: { onChange, value } }) => (
                <FormField label="Color" style={styles.formColumn}>
                  <TextInput style={styles.input} placeholder="Ej. Rosa" placeholderTextColor={theme.colors.textMuted} onChangeText={onChange} value={value} />
                </FormField>
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Departamento</Text>
            <TouchableOpacity 
              style={[styles.selectButton, watchDeptId === 'NEW' && { borderColor: theme.colors.primary, borderWidth: 1 }]} 
              onPress={() => onOpenPicker('department')}
            >
              <Text style={[styles.selectButtonText, !watchDeptId && styles.selectButtonPlaceholder]}>
                {watchDeptId === 'NEW' ? '+ Nuevo Departamento' : (watchDeptName || 'Seleccionar departamento...')}
              </Text>
            </TouchableOpacity>
            
            {watchDeptId === 'NEW' && (
              <Controller
                control={control}
                name="departmentName"
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                    style={[styles.input, styles.newEntityInput]} 
                    placeholder="Nombre del departamento *" placeholderTextColor={theme.colors.textMuted} 
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
              <Text style={[styles.selectButtonText, !watchCatId && styles.selectButtonPlaceholder, !watchDeptId && styles.selectButtonDisabledText]}>
                {watchCatId === 'NEW' ? '+ Nueva Categoría' : (watchCatName || 'Seleccionar categoría...')}
              </Text>
            </TouchableOpacity>

            {watchCatId === 'NEW' && (
              <Controller
                control={control}
                name="categoryName"
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                    style={[styles.input, styles.newEntityInput]} 
                    placeholder="Nombre de la categoría *" placeholderTextColor={theme.colors.textMuted} 
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
