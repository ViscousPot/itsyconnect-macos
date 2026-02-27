import { ascFetch } from "./client";
import { cacheInvalidate } from "@/lib/cache";

// --- Version localizations ---

export async function updateVersionLocalization(
  localizationId: string,
  attributes: Record<string, unknown>,
): Promise<void> {
  await ascFetch(`/v1/appStoreVersionLocalizations/${localizationId}`, {
    method: "PATCH",
    body: JSON.stringify({
      data: {
        type: "appStoreVersionLocalizations",
        id: localizationId,
        attributes,
      },
    }),
  });
}

export async function createVersionLocalization(
  versionId: string,
  locale: string,
  attributes: Record<string, unknown>,
): Promise<void> {
  await ascFetch("/v1/appStoreVersionLocalizations", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "appStoreVersionLocalizations",
        attributes: { locale, ...attributes },
        relationships: {
          appStoreVersion: {
            data: { type: "appStoreVersions", id: versionId },
          },
        },
      },
    }),
  });
}

export async function deleteVersionLocalization(
  localizationId: string,
): Promise<void> {
  await ascFetch(`/v1/appStoreVersionLocalizations/${localizationId}`, {
    method: "DELETE",
  });
}

export function invalidateLocalizationsCache(versionId: string): void {
  cacheInvalidate(`localizations:${versionId}`);
}

// --- App info localizations ---

export async function updateAppInfoLocalization(
  localizationId: string,
  attributes: Record<string, unknown>,
): Promise<void> {
  await ascFetch(`/v1/appInfoLocalizations/${localizationId}`, {
    method: "PATCH",
    body: JSON.stringify({
      data: {
        type: "appInfoLocalizations",
        id: localizationId,
        attributes,
      },
    }),
  });
}

export async function createAppInfoLocalization(
  appInfoId: string,
  locale: string,
  attributes: Record<string, unknown>,
): Promise<void> {
  await ascFetch("/v1/appInfoLocalizations", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "appInfoLocalizations",
        attributes: { locale, ...attributes },
        relationships: {
          appInfo: {
            data: { type: "appInfos", id: appInfoId },
          },
        },
      },
    }),
  });
}

export async function deleteAppInfoLocalization(
  localizationId: string,
): Promise<void> {
  await ascFetch(`/v1/appInfoLocalizations/${localizationId}`, {
    method: "DELETE",
  });
}

export function invalidateAppInfoLocalizationsCache(appInfoId: string): void {
  cacheInvalidate(`appInfoLocalizations:${appInfoId}`);
}
