"use client";

import { useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { LocalePicker } from "@/components/locale-picker";
import { useHeaderLocale } from "@/lib/header-locale-context";

export function HeaderLocalePicker() {
  const configRef = useHeaderLocale();
  const config = configRef.current;

  // Stable wrappers that always read from the ref at call time
  const onLocaleChange = useCallback(
    (code: string) => configRef.current?.onLocaleChange(code),
    [configRef],
  );
  const onLocaleAdd = useCallback(
    (code: string) => configRef.current?.onLocaleAdd(code),
    [configRef],
  );
  const onLocalesAdd = useCallback(
    (codes: string[]) => configRef.current?.onLocalesAdd?.(codes),
    [configRef],
  );
  const onLocaleDelete = useCallback(
    (code: string) => configRef.current?.onLocaleDelete?.(code),
    [configRef],
  );

  if (!config || config.locales.length === 0) return null;

  return (
    <>
      <Separator orientation="vertical" className="mx-2 !h-4" />
      <LocalePicker
        locales={config.locales}
        selectedLocale={config.selectedLocale}
        primaryLocale={config.primaryLocale}
        onLocaleChange={onLocaleChange}
        onLocaleAdd={onLocaleAdd}
        onLocalesAdd={config.onLocalesAdd ? onLocalesAdd : undefined}
        onLocaleDelete={config.onLocaleDelete ? onLocaleDelete : undefined}
        section={config.section}
        otherSectionLocales={config.otherSectionLocales}
        availableLocales={config.availableLocales}
        readOnly={config.readOnly}
      />
    </>
  );
}
