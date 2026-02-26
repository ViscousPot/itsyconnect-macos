"use client";

import { useParams, usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MOCK_APPS, getVersion } from "@/lib/mock-data";

const PLATFORM_LABELS: Record<string, string> = {
  IOS: "iOS",
  MAC_OS: "macOS",
  TV_OS: "tvOS",
  VISION_OS: "visionOS",
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const { appId, versionId } = useParams<{
    appId?: string;
    versionId?: string;
  }>();

  const app = appId ? MOCK_APPS.find((a) => a.id === appId) : undefined;
  const version = versionId ? getVersion(versionId) : undefined;

  const isSettings = pathname.startsWith("/dashboard/settings");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {isSettings ? (
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        ) : app ? (
          <>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={`/dashboard/apps/${app.id}`}>
                {app.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {version && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {version.versionString} on{" "}
                    {PLATFORM_LABELS[version.platform] ?? version.platform}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
