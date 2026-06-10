import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  BackHandler
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './StockAdjustmentModal.styles';
import { theme } from '../../../theme';

const adjustmentSchema = z.object({
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a 0"),
  reason: z.string().min(5, "El motivo debe tener al menos 5 caracteres"),
  newPrice: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.number().positive().optional()),
  newCost: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.number().positive().optional()),
});

export const StockAdjustmentModal = ({ visible, onClose, onConfirm, product }) => {
  const [type, setType] = useState('IN'); // 'IN' (Entrada) o 'OUT' (Salida)
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { control, handleSubmit, formState: { errors, isValid, isDirty }, reset } = useForm({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      quantity: '',
      reason: '',
      newPrice: product?.price?.toString() || '',
      newCost: product?.cost?.toString() || '',
    },
    mode: 'onChange'
  });

  const handleClose = () => {
    reset();
    setType('IN');
    setShowAdvanced(false);
    onClose();
  };

  // Protección contra cierre accidental (Botón Atrás de Android)
  useEffect(() => {
    if (visible) {
      const backAction = () => {
        if (isDirty) {
          Alert.alert("Cambios sin guardar", "¿Deseas cerrar el ajuste? Se perderán los datos ingresados.", [
            { text: "No", style: "cancel" },
            { text: "Sí", onPress: handleClose }
          ]);
          return true;
        }
        handleClose();
        return true;
      };

      const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
      return () => backHandler.remove();
    }
  }, [visible, isDirty, handleClose]);

  // Efecto para sincronizar el formulario cuando el producto cambia (Evita estado atrasado)
  useEffect(() => {
    if (product) {
      reset({
        quantity: '',
        reason: '',
        newPrice: product.price?.toString() || '',
        newCost: product.cost?.toString() || '',
      });
    }
  }, [product, reset]);

  const onSubmit = (data) => {
    const finalQuantity = type === 'OUT' ? -Math.abs(data.quantity) : Math.abs(data.quantity);
    
    const payload = {
      quantity: finalQuantity,
      reason: data.reason.trim(),
      type: type === 'IN' ? 'AJUSTE_MANUAL' : 'MERMA',
    };

    if (data.newPrice && parseFloat(data.newPrice) !== product?.price) {
      payload.newPrice = parseFloat(data.newPrice);
    }
    if (data.newCost && parseFloat(data.newCost) !== product?.cost) {
      payload.newCost = parseFloat(data.newCost);
    }

    onConfirm(payload);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (isDirty) {
          Alert.alert("Cambios sin guardar", "¿Deseas cerrar?", [
            { text: "No", style: "cancel" },
            { text: "Sí", onPress: handleClose }
          ]);
        } else {
          handleClose();
        }
      }}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <Pressable 
          style={StyleSheet.absoluteFill} 
          onPress={() => {
            if (isDirty) {
              Alert.alert("Cambios sin guardar", "¿Deseas cerrar?", [
                { text: "No", style: "cancel" },
                { text: "Sí", onPress: handleClose }
              ]);
            } else {
              handleClose();
            }
          }} 
        />
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Ajuste de Stock</Text>
            <TouchableOpacity onPress={() => {
              if (isDirty) {
                Alert.alert("Cambios sin guardar", "¿Deseas cerrar?", [
                  { text: "No", style: "cancel" },
                  { text: "Sí", onPress: handleClose }
                ]);
              } else {
                handleClose();
              }
            }}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.typeSelector}>
              <TouchableOpacity 
                style={[styles.typeButton, type === 'IN' && styles.activeIn]} 
                onPress={() => setType('IN')}
              >
                <MaterialCommunityIcons 
                  name="plus-circle" 
                  size={20} 
                  color={type === 'IN' ? '#fff' : theme.colors.textSecondary} 
                />
                <Text style={[styles.typeButtonText, type === 'IN' && styles.activeTypeText]}>ENTRADA</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeButton, type === 'OUT' && styles.activeOut]} 
                onPress={() => setType('OUT')}
              >
                <MaterialCommunityIcons 
                  name="minus-circle" 
                  size={20} 
                  color={type === 'OUT' ? '#fff' : theme.colors.textSecondary} 
                />
                <Text style={[styles.typeButtonText, type === 'OUT' && styles.activeTypeText]}>SALIDA</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cantidad a ajustar</Text>
                <Controller
                  control={control}
                  name="quantity"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, errors.quantity && styles.inputError]}
                      placeholder="Ej: 5"
                      keyboardType="number-pad"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.quantity?.message && (
                  <Text style={styles.errorText}>{`${errors.quantity.message}`}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Motivo del ajuste (Kardex)</Text>
                <Controller
                  control={control}
                  name="reason"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, { height: 80, textAlignVertical: 'top' }, errors.reason && styles.inputError]}
                      placeholder={type === 'IN' ? "Ej: Reabastecimiento temporada" : "Ej: Prenda con defecto de fábrica"}
                      multiline
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.reason?.message && (
                  <Text style={styles.errorText}>{`${errors.reason.message}`}</Text>
                )}
              </View>

              <TouchableOpacity 
                style={styles.advancedToggle} 
                onPress={() => setShowAdvanced(!showAdvanced)}
              >
                <Text style={styles.advancedToggleText}>Ajustes de precio/costo (Opcional)</Text>
                <MaterialCommunityIcons 
                  name={showAdvanced ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={theme.colors.primary} 
                />
              </TouchableOpacity>

              {showAdvanced && (
                <View style={styles.advancedContent}>
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, styles.flex1]}>
                      <Text style={styles.label}>Nuevo Costo</Text>
                      <Controller
                        control={control}
                        name="newCost"
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            style={styles.input}
                            placeholder="Costo"
                            keyboardType="decimal-pad"
                            value={value}
                            onChangeText={onChange}
                          />
                        )}
                      />
                    </View>
                    <View style={[styles.inputGroup, styles.flex1]}>
                      <Text style={styles.label}>Nuevo Precio</Text>
                      <Controller
                        control={control}
                        name="newPrice"
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            style={styles.input}
                            placeholder="Precio"
                            keyboardType="decimal-pad"
                            value={value}
                            onChangeText={onChange}
                          />
                        )}
                      />
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity 
                style={[styles.submitButton, !isValid && styles.submitButtonDisabled]} 
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid}
              >
                <Text style={styles.submitButtonText}>Confirmar Ajuste Maestro</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
