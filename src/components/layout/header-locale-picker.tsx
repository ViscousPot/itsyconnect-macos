"use client";

import { useCallback, useState } from "react";
import { MagicWand } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { LocalePicker } from "@/components/locale-picker";
import { useHeaderLocale } from "@/lib/header-locale-context";
import { useFormDirty } from "@/lib/form-dirty-context";
import { useAIStatus } from "@/lib/hooks/use-ai-status";
import { localeName } from "@/lib/asc/locale-names";
import { AIRequiredDialog } from "@/components/ai-required-dialog";

export function HeaderLocalePicker() {
  const configRef = useHeaderLocale();
  const config = configRef.current;
  const { guardNavigation } = useFormDirty();
  const { configured } = useAIStatus();
  const [showRequired, setShowRequired] = useState(false);

  // Stable wrappers that always read from the ref at call time
  const onLocaleChange = useCallback(
    (code: string) => guardNavigation(() => configRef.current?.onLocaleChange(code)),
    [configRef, guardNavigation],
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

  const hasBulkActions = !!(config.onBulkTranslate || config.onBulkCopy);
  const isNonBaseLocale = config.selectedLocale !== config.primaryLocale;
  const showWand = hasBulkActions && isNonBaseLocale;
  const baseLabel = localeName(config.primaryLocale);

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
      {showWand && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground"
              >
                <MagicWand size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {config.onBulkTranslate && (
                <DropdownMenuItem
                  onSelect={() => {
                    if (!configured) {
                      setShowRequired(true);
                      return;
                    }
                    configRef.current?.onBulkTranslate?.();
                  }}
                >
                  Translate all fields from {baseLabel}
                </DropdownMenuItem>
              )}
              {config.onBulkCopy && (
                <DropdownMenuItem
                  onSelect={() => configRef.current?.onBulkCopy?.()}
                >
                  Copy all fields from {baseLabel}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <AIRequiredDialog open={showRequired} onOpenChange={setShowRequired} />
        </>
      )}
    </>
  );
}
