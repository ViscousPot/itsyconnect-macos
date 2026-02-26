import { ascFetch } from "./client";
import { cacheGet, cacheSet } from "@/lib/cache";

const APPS_TTL = 60 * 60 * 1000; // 1 hour

export interface AscApp {
  id: string;
  attributes: {
    name: string;
    bundleId: string;
    sku: string;
    primaryLocale: string;
  };
}

interface AppsResponse {
  data: AscApp[];
}

export async function listApps(forceRefresh = false): Promise<AscApp[]> {
  if (!forceRefresh) {
    const cached = cacheGet<AscApp[]>("apps");
    if (cached) return cached;
  }

  const response = await ascFetch<AppsResponse>(
    "/v1/apps?fields[apps]=name,bundleId,sku,primaryLocale&limit=200",
  );

  const apps = response.data;
  cacheSet("apps", apps, APPS_TTL);
  return apps;
}
