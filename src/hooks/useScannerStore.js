import { create } from 'zustand';

const initialState = {
  step: 'SCANNING', // SCANNING, VERIFYING, FOUND, NEW_FORM
  barcode: null,
  scanned: false,
  showClientPicker: false,
  transactionType: null, // 'SALE', 'PRESTAMO', 'APARTADO', 'CREDITO_SEMANAL'
  userSearch: '',
  picker: {
    visible: false,
    type: null, // 'department', 'category'
  }
};

export const useScannerStore = create((set) => ({
  ...initialState,

  // Acciones de UI
  setStep: (step) => set({ step }),
  
  handleBarcodeScanned: (barcode) => set({ 
    barcode, 
    scanned: true, 
    step: 'VERIFYING' 
  }),


  setTransaction: (type) => set({ 
    transactionType: type,
    userSearch: '',
    showClientPicker: true 
  }),

  closeClientPicker: () => set({ 
    showClientPicker: false, 
    transactionType: null 
  }),

  updateUserSearch: (val) => set({ userSearch: val }),

  openPicker: (type) => set({ 
    picker: { visible: true, type } 
  }),

  closePicker: () => set({ 
    picker: { visible: false, type: null } 
  }),

  reset: () => set(initialState),
}));
