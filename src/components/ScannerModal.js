import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { styles } from './ScannerModal.styles';

export default function ScannerModal({ visible, onClose, onScan }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  const checkPermission = async () => {
    try {
      const { status: existingStatus } = await Camera.getCameraPermissionsAsync();
      if (existingStatus === 'granted') {
        setHasPermission(true);
      } else {
        const { status: newStatus } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(newStatus === 'granted');
      }
    } catch (e) {
      console.warn("Error con permisos de cámara:", e);
      setHasPermission(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setScanned(false);
      checkPermission();
    }
  }, [visible]);

  const handleBarCodeScanned = (result) => {
    if (scanned) return;
    setScanned(true);
    // En v17 result contiene data y type
    onScan({ type: result.type, data: result.data });
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {hasPermission === false ? (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
              No tenemos acceso a la cámara. Por favor, actívala en configuración para escanear productos.
            </Text>
            <TouchableOpacity 
              style={styles.permissionButton} 
              onPress={checkPermission}
            >
              <Text style={styles.permissionButtonText}>Intentar de nuevo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.closeButton, { marginTop: 20 }]} 
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Regresar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={styles.camera}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "ean13", "ean8", "code128", "upc_a"],
            }}
          >
            <View style={styles.overlay}>
              <View style={styles.unfocusedContainer} />
              <View style={{ flexDirection: 'row' }}>
                <View style={styles.unfocusedContainer} />
                <View style={styles.focusedContainer} />
                <View style={styles.unfocusedContainer} />
              </View>
              <View style={styles.unfocusedContainer}>
                <View style={styles.bottomContainer}>
                  <Text style={styles.instructionText}>
                    Enfoca el código de barras
                  </Text>
                  <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </CameraView>
        )}
      </SafeAreaView>
    </Modal>
  );
}





