import { useState, useCallback } from 'react';

interface UseDialogStateProps<T> {
  initialValue: T;
  onReset?: () => void;
  customResetLogic?: () => T;
}

interface UseDialogStateReturn<T> {
  isOpen: boolean;
  value: T;
  setValue: (value: T) => void;
  handleOpenChange: (open: boolean) => void;
  setIsOpen: (open: boolean) => void;
  open: () => void;
  close: () => void;
  reset: () => void;
}

/**
 * Generic dialog state management hook that provides consistent dialog behavior
 * Eliminates duplication across dialog components
 */
export function useDialogState<T>({
  initialValue,
  onReset,
  customResetLogic
}: UseDialogStateProps<T>): UseDialogStateReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(initialValue);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      // Reset to initial value when closing dialog
      const resetValue = customResetLogic ? customResetLogic() : initialValue;
      setValue(resetValue);
      onReset?.();
    }
    setIsOpen(open);
  }, [initialValue, onReset, customResetLogic]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const reset = useCallback(() => {
    const resetValue = customResetLogic ? customResetLogic() : initialValue;
    setValue(resetValue);
    onReset?.();
  }, [initialValue, onReset, customResetLogic]);

  return {
    isOpen,
    value,
    setValue,
    handleOpenChange,
    setIsOpen,
    open,
    close,
    reset,
  };
}