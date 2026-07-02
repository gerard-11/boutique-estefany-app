import React, { useCallback, useEffect, useRef } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { styles } from '../screens/ClientHomeScreen.styles';

const EMPTY_PROFILE_VALUES = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
};

export default function ProfileFormModal({
  visible,
  initialValues,
  isSaving,
  onClose,
  onSave,
}) {
  const keyboardVisibleRef = useRef(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: EMPTY_PROFILE_VALUES,
  });

  useEffect(() => {
    if (!visible) return;
    reset({
      ...EMPTY_PROFILE_VALUES,
      ...initialValues,
    });
  }, [initialValues, reset, visible]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      keyboardVisibleRef.current = true;
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      keyboardVisibleRef.current = false;
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleRequestClose = useCallback(() => {
    if (keyboardVisibleRef.current) {
      Keyboard.dismiss();
      return;
    }

    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleRequestClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Editar perfil</Text>

          <Text style={styles.inputLabel}>Nombre</Text>
          <Controller
            control={control}
            name="firstName"
            rules={{ required: 'Nombre obligatorio' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="Nombre"
              />
            )}
          />
          {errors.firstName && <Text style={styles.inputErrorText}>{errors.firstName.message}</Text>}

          <Text style={styles.inputLabel}>Apellido</Text>
          <Controller
            control={control}
            name="lastName"
            rules={{ required: 'Apellido obligatorio' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="Apellido"
              />
            )}
          />
          {errors.lastName && <Text style={styles.inputErrorText}>{errors.lastName.message}</Text>}

          <Text style={styles.inputLabel}>Telefono</Text>
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder="+525512345678"
                keyboardType="phone-pad"
              />
            )}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={styles.secondaryActionText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={handleSubmit(onSave)}
              disabled={isSaving}
            >
              <Text style={styles.primaryActionText}>
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
