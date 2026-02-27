"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

interface FormDirtyContextValue {
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  /** Pages register a save handler; the header button calls it. */
  onSave: () => void;
  registerSave: (handler: () => void | Promise<void>) => void;
}

const FormDirtyContext = createContext<FormDirtyContextValue>({
  isDirty: false,
  setDirty: () => {},
  onSave: () => {},
  registerSave: () => {},
});

export function FormDirtyProvider({ children }: { children: React.ReactNode }) {
  const [isDirty, setIsDirty] = useState(false);
  const saveRef = useRef<(() => void | Promise<void>) | null>(null);

  const setDirty = useCallback((dirty: boolean) => {
    setIsDirty(dirty);
  }, []);

  const registerSave = useCallback((handler: () => void | Promise<void>) => {
    saveRef.current = handler;
  }, []);

  const onSave = useCallback(() => {
    saveRef.current?.();
  }, []);

  return (
    <FormDirtyContext.Provider value={{ isDirty, setDirty, onSave, registerSave }}>
      {children}
    </FormDirtyContext.Provider>
  );
}

export function useFormDirty() {
  return useContext(FormDirtyContext);
}
