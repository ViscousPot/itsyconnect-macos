"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Images,
  CloudArrowUp,
  Plus,
  SpinnerGap,
  X,
  DotsSixVertical,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useApps } from "@/lib/apps-context";
import { useVersions } from "@/lib/versions-context";
import { resolveVersion, EDITABLE_STATES } from "@/lib/asc/version-types";
import { useLocalizations } from "@/lib/hooks/use-localizations";
import { useScreenshotSets } from "@/lib/hooks/use-screenshot-sets";
import { localeName, sortLocales } from "@/lib/asc/locale-names";
import {
  screenshotImageUrl,
  displayTypeLabel,
  sortDisplayTypes,
  type AscScreenshot,
} from "@/lib/asc/display-types";
import { useSectionLocales } from "@/lib/section-locales-context";
import { useRegisterHeaderLocale } from "@/lib/header-locale-context";

// ---------------------------------------------------------------------------
// Sortable screenshot thumbnail
// ---------------------------------------------------------------------------

function SortableScreenshot({
  screenshot,
  readOnly,
  onDelete,
}: {
  screenshot: AscScreenshot;
  readOnly: boolean;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: screenshot.id, disabled: readOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isComplete =
    screenshot.attributes.assetDeliveryState?.state === "COMPLETE";
  const hasToken = !!screenshot.attributes.assetToken;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative shrink-0"
    >
      {/* Drag handle + thumbnail */}
      <div
        className="flex flex-col items-center gap-1.5 rounded-lg border bg-muted/30 p-2"
        {...attributes}
        {...listeners}
      >
        {!readOnly && (
          <DotsSixVertical
            size={14}
            className="cursor-grab text-muted-foreground/40 group-hover:text-muted-foreground"
          />
        )}
        {isComplete && hasToken ? (
          <img
            src={screenshotImageUrl(screenshot.attributes.assetToken!, 300)}
            alt={screenshot.attributes.fileName}
            className="h-[200px] w-auto rounded object-contain"
            loading="lazy"
          />
        ) : (
          <div className="flex h-[200px] w-[112px] items-center justify-center rounded bg-muted">
            <SpinnerGap
              size={24}
              className="animate-spin text-muted-foreground/40"
            />
          </div>
        )}
        <p className="max-w-[120px] truncate text-xs text-muted-foreground">
          {screenshot.attributes.fileName}
        </p>
      </div>

      {/* Delete button */}
      {!readOnly && (
        <button
          type="button"
          onClick={() => onDelete(screenshot.id)}
          className="absolute -top-2 -right-2 hidden rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90 group-hover:block"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload placeholder shown during upload
// ---------------------------------------------------------------------------

function UploadingPlaceholder() {
  return (
    <div className="flex h-[232px] w-[120px] shrink-0 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/20">
      <SpinnerGap size={20} className="animate-spin text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Uploading…</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ScreenshotsPage() {
  const { appId } = useParams<{ appId: string }>();
  const searchParams = useSearchParams();
  const { apps } = useApps();
  const app = apps.find((a) => a.id === appId);
  const { versions, loading: versionsLoading } = useVersions();

  const selectedVersion = useMemo(
    () => resolveVersion(versions, searchParams.get("version")),
    [versions, searchParams],
  );
  const versionId = selectedVersion?.id ?? "";

  const readOnly = selectedVersion
    ? !EDITABLE_STATES.has(selectedVersion.attributes.appVersionState)
    : false;

  const { localizations, loading: locLoading } = useLocalizations(
    appId,
    versionId,
  );
  const primaryLocale = app?.primaryLocale ?? "";

  const [locales, setLocales] = useState<string[]>([]);
  const [selectedLocale, setSelectedLocale] = useState("");

  const { reportLocales, otherSectionLocales } = useSectionLocales("screenshots");

  // Only offer locales that have a version localization
  const versionLocales = useMemo(
    () => localizations.map((l) => l.attributes.locale),
    [localizations],
  );

  // Start with only the primary locale
  useEffect(() => {
    if (!primaryLocale) return;
    setLocales((prev) => (prev.length > 0 ? prev : [primaryLocale]));
    setSelectedLocale((prev) => prev || primaryLocale);
  }, [primaryLocale]);

  // Report locales to cross-section context
  useEffect(() => {
    reportLocales(locales);
  }, [locales, reportLocales]);

  const selectedLocalization = localizations.find(
    (l) => l.attributes.locale === selectedLocale,
  );
  const localizationId = selectedLocalization?.id ?? "";

  const {
    screenshotSets: rawSets,
    loading: ssLoading,
    refresh,
  } = useScreenshotSets(appId, versionId, localizationId);

  // Sort sets by display type
  const screenshotSets = useMemo(() => {
    const sorted = sortDisplayTypes(
      rawSets.map((s) => s.attributes.screenshotDisplayType),
    );
    return sorted.map(
      (dt) => rawSets.find((s) => s.attributes.screenshotDisplayType === dt)!,
    );
  }, [rawSets]);

  // ---- Upload state ----
  const [uploadingSetIds, setUploadingSetIds] = useState<Set<string>>(
    new Set(),
  );
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // ---- Drag sensors ----
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  // Build the API base path
  const apiBase = `/api/apps/${appId}/versions/${versionId}/localizations/${localizationId}/screenshots`;

  // ---- Handlers ----

  const handleUpload = useCallback(
    async (setId: string, file: File) => {
      setUploadingSetIds((prev) => new Set(prev).add(setId));
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("setId", setId);

        const res = await fetch(apiBase, { method: "POST", body: formData });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Upload failed");
        }
        toast.success("Screenshot uploaded");
        await refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to upload screenshot",
        );
      } finally {
        setUploadingSetIds((prev) => {
          const next = new Set(prev);
          next.delete(setId);
          return next;
        });
      }
    },
    [apiBase, refresh],
  );

  const handleDeleteScreenshot = useCallback(
    async (screenshotId: string) => {
      try {
        const res = await fetch(`${apiBase}/${screenshotId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Delete failed");
        }
        toast.success("Screenshot deleted");
        await refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete screenshot",
        );
      }
    },
    [apiBase, refresh],
  );

  const handleDragEnd = useCallback(
    async (setId: string, event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const set = screenshotSets.find((s) => s.id === setId);
      if (!set) return;

      const ids = set.screenshots.map((s) => s.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      const newOrder = arrayMove(ids, oldIndex, newIndex);

      try {
        const res = await fetch(`${apiBase}/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setId, screenshotIds: newOrder }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Reorder failed");
        }
        await refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to reorder screenshots",
        );
      }
    },
    [apiBase, refresh, screenshotSets],
  );

  function handleAddLocale(locale: string) {
    setLocales((prev) => sortLocales([...prev, locale], primaryLocale));
    setSelectedLocale(locale);
    toast.success(`Added ${localeName(locale)}`);
  }

  function handleBulkAddLocales(codes: string[]) {
    setLocales((prev) => {
      const combined = new Set([...prev, ...codes]);
      return sortLocales([...combined], primaryLocale);
    });
    toast.success(`Added ${codes.length} locales`);
  }

  function handleDeleteLocale(code: string) {
    setLocales((prev) => {
      const next = prev.filter((l) => l !== code);
      if (selectedLocale === code) {
        setSelectedLocale(next[0] ?? "");
      }
      return next;
    });
    toast(`Removed ${localeName(code)}`, {
      action: {
        label: "Undo",
        onClick: () => {
          setLocales((prev) => sortLocales([...prev, code], primaryLocale));
        },
      },
    });
  }

  // Register locale picker in the header bar
  useRegisterHeaderLocale({
    locales,
    selectedLocale,
    primaryLocale,
    onLocaleChange: setSelectedLocale,
    onLocaleAdd: handleAddLocale,
    onLocalesAdd: handleBulkAddLocales,
    onLocaleDelete: handleDeleteLocale,
    section: "screenshots",
    otherSectionLocales,
    readOnly,
  });

  if (!app) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        App not found
      </div>
    );
  }

  if (versionsLoading || locLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <SpinnerGap size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {locales.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No localizations for this version.
        </div>
      ) : ssLoading ? (
        <div className="flex items-center justify-center py-20">
          <SpinnerGap
            size={24}
            className="animate-spin text-muted-foreground"
          />
        </div>
      ) : screenshotSets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
          <Images size={48} className="text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-medium">No screenshots</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            No screenshot sets have been created for this locale yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {screenshotSets.map((set) => (
            <Card key={set.id}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {displayTypeLabel(set.attributes.screenshotDisplayType)}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {set.screenshots.length} screenshot
                    {set.screenshots.length !== 1 ? "s" : ""}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {set.screenshots.length === 0 && !uploadingSetIds.has(set.id) ? (
                  /* Empty set – upload drop zone */
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <CloudArrowUp
                      size={32}
                      className="text-muted-foreground/40"
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No screenshots uploaded
                    </p>
                    {!readOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() =>
                          fileInputRefs.current.get(set.id)?.click()
                        }
                      >
                        <Plus size={14} className="mr-1.5" />
                        Add screenshot
                      </Button>
                    )}
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(set.id, event)}
                  >
                    <SortableContext
                      items={set.screenshots.map((s) => s.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {set.screenshots.map((ss) => (
                          <SortableScreenshot
                            key={ss.id}
                            screenshot={ss}
                            readOnly={readOnly}
                            onDelete={handleDeleteScreenshot}
                          />
                        ))}

                        {uploadingSetIds.has(set.id) && (
                          <UploadingPlaceholder />
                        )}

                        {/* Add button as last slot */}
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() =>
                              fileInputRefs.current.get(set.id)?.click()
                            }
                            className="flex h-[232px] w-[80px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed text-muted-foreground hover:border-foreground/30 hover:text-foreground/70"
                          >
                            <Plus size={20} />
                            <span className="text-xs">Add</span>
                          </button>
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}

                {/* Hidden file input for this set */}
                {!readOnly && (
                  <input
                    ref={(el) => {
                      if (el) fileInputRefs.current.set(set.id, el);
                    }}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUpload(set.id, file);
                        e.target.value = "";
                      }
                    }}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
