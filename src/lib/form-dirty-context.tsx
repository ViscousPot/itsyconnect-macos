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
  isSaving: boolean;
  setDirty: (dirty: boolean) => void;
  /** Pages register a save handler; the header button calls it. */
  onSave: () => void;
  registerSave: (handler: () => void | Promise<void>) => void;
}

const FormDirtyContext = createContext<FormDirtyContextValue>({
  isDirty: false,
  isSaving: false,
  setDirty: () => {},
  onSave: () => {},
  registerSave: () => {},
});

export function FormDirtyProvider({ children }: { children: React.ReactNode }) {
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveRef = useRef<(() => void | Promise<void>) | null>(null);

  const setDirty = useCallback((dirty: boolean) => {
    setIsDirty(dirty);
  }, []);

  const registerSave = useCallback((handler: () => void | Promise<void>) => {
    saveRef.current = handler;
  }, []);

  const onSave = useCallback(async () => {
    if (!saveRef.current) return;
    setIsSaving(true);
    try {
      await saveRef.current();
    } finally {
      setIsSaving(false);
    }
  }, []);

  return (
    <FormDirtyContext.Provider value={{ isDirty, isSaving, setDirty, onSave, registerSave }}>
      {children}
    </FormDirtyContext.Provider>
  );
}

export function useFormDirty() {
  return useContext(FormDirtyContext);
}
