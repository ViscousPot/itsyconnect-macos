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
import { MOCK_APPS } from "@/lib/mock-data";

const PAGE_TITLES: Record<string, string> = {
  "store-listing": "Store listing",
  screenshots: "Screenshots",
  review: "App review",
  testflight: "TestFlight",
  reviews: "Reviews",
  analytics: "Analytics",
  details: "App details",
  pricing: "Pricing",
  iap: "In-app purchases",
  privacy: "Privacy",
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const { appId } = useParams<{ appId?: string }>();

  const app = appId ? MOCK_APPS.find((a) => a.id === appId) : undefined;
  const isSettings = pathname.startsWith("/dashboard/settings");

  // Extract the page segment after /dashboard/apps/[appId]/
  const pageSegment = appId
    ? pathname.replace(`/dashboard/apps/${appId}`, "").replace(/^\//, "").split("/")[0]
    : "";
  const pageTitle = PAGE_TITLES[pageSegment] ?? "";

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
            {pageTitle && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
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
