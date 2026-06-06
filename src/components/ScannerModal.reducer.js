
export const initialState = {
  step: 'SCANNING', // SCANNING, VERIFYING, FOUND, NEW_FORM
  barcode: null,
  scanned: false,
  showClientPicker: false,
  transactionType: null, // 'SALE', 'PRESTAMO', 'APARTADO'
  userSearch: '',
  picker: {
    visible: false,
    type: null, // 'department', 'category'
  }
};

export function scannerReducer(state, action) {
  switch (action.type) {
    case 'START_SCAN':
      return { ...initialState };

    case 'BARCODE_SCANNED':
      return { 
        ...state, 
        barcode: action.payload, 
        scanned: true, 
        step: 'VERIFYING' 
      };

    case 'SET_STEP':
      return { ...state, step: action.payload };

    case 'OPEN_PICKER':
      return { ...state, picker: { visible: true, type: action.payload } };

    case 'CLOSE_PICKER':
      return { ...state, picker: { ...state.picker, visible: false } };

    case 'SET_TRANSACTION':
      return { 
        ...state, 
        transactionType: action.payload, 
        showClientPicker: true 
      };
    case 'CLOSE_CLIENT_PICKER':
      return { ...state, showClientPicker: false, transactionType: null };

    case 'UPDATE_USER_SEARCH':
      return { ...state, userSearch: action.payload };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}
