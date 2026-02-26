import { listApps } from "@/lib/asc/apps";
import { hasCredentials } from "@/lib/asc/client";

export async function syncApps(): Promise<void> {
  if (!hasCredentials()) return;
  await listApps(true);
}

// Future sync jobs will be added here as we implement
// more ASC API wrappers (versions, builds, reviews, etc.)
