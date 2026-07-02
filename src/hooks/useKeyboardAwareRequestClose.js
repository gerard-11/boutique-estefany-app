import { useCallback, useEffect, useRef } from 'react';
import { Keyboard } from 'react-native';

export const useKeyboardAwareRequestClose = (onClose) => {
  const keyboardVisibleRef = useRef(false);

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

  return useCallback(() => {
    if (keyboardVisibleRef.current) {
      Keyboard.dismiss();
      return;
    }

    onClose?.();
  }, [onClose]);
};
