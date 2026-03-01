"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApps } from "@/lib/apps-context";
import { getLastUrl } from "@/lib/nav-state";
import { AppWindow } from "@phosphor-icons/react";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/empty-state";

export default function DashboardPage() {
  const router = useRouter();
  const { apps, loading } = useApps();

  useEffect(() => {
    if (!loading && apps.length > 0) {
      const saved = getLastUrl();
      const appIds = new Set(apps.map((a) => a.id));
      // Validate saved URL references an app that still exists
      const savedAppId = saved
        ?.match(/^\/dashboard\/apps\/([^/?]+)/)?.[1];
      const target =
        saved && savedAppId && appIds.has(savedAppId)
          ? saved
          : `/dashboard/apps/${apps[0].id}`;
      router.replace(target);
    }
  }, [apps, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <EmptyState
        icon={AppWindow}
        title="No apps yet"
        description={
          <>
            Create your apps in{" "}
            <a
              href="https://appstoreconnect.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              App Store Connect
            </a>{" "}
            first, then they&apos;ll appear here automatically.
          </>
        }
      />
    );
  }

  return null;
}
