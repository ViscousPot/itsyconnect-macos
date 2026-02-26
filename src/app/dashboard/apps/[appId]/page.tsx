"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MOCK_APPS,
  getAppVersions,
  getVersionBuild,
} from "@/lib/mock-data";
import {
  AppWindow,
  Rocket,
  PaperPlaneTilt,
  ChatsCircle,
  ArrowRight,
} from "@phosphor-icons/react";

const STATE_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  READY_FOR_SALE: "default",
  READY_FOR_DISTRIBUTION: "default",
  PREPARE_FOR_SUBMISSION: "secondary",
  WAITING_FOR_REVIEW: "outline",
  IN_REVIEW: "outline",
  ACCEPTED: "default",
  REJECTED: "destructive",
  METADATA_REJECTED: "destructive",
  DEVELOPER_REJECTED: "destructive",
};

const STATE_DOT_COLORS: Record<string, string> = {
  READY_FOR_SALE: "bg-green-500",
  READY_FOR_DISTRIBUTION: "bg-green-500",
  ACCEPTED: "bg-green-500",
  IN_REVIEW: "bg-blue-500",
  WAITING_FOR_REVIEW: "bg-amber-500",
  PREPARE_FOR_SUBMISSION: "bg-yellow-500",
  REJECTED: "bg-red-500",
  METADATA_REJECTED: "bg-red-500",
  DEVELOPER_REJECTED: "bg-red-500",
};

const PLATFORM_LABELS: Record<string, string> = {
  IOS: "iOS",
  MAC_OS: "macOS",
  TV_OS: "tvOS",
  VISION_OS: "visionOS",
};

function stateLabel(state: string): string {
  return state
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AppOverviewPage() {
  const { appId } = useParams<{ appId: string }>();
  const app = MOCK_APPS.find((a) => a.id === appId);
  const versions = getAppVersions(appId);

  if (!app) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        App not found
      </div>
    );
  }

  const editableVersions = versions.filter(
    (v) =>
      v.appVersionState === "PREPARE_FOR_SUBMISSION" ||
      v.appVersionState === "WAITING_FOR_REVIEW" ||
      v.appVersionState === "IN_REVIEW" ||
      v.appVersionState === "REJECTED" ||
      v.appVersionState === "METADATA_REJECTED"
  );

  return (
    <div className="space-y-6">
      {/* App header */}
      <div className="flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-sm">
          <AppWindow size={28} weight="fill" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{app.name}</h1>
          <p className="text-sm text-muted-foreground">{app.bundleId}</p>
        </div>
      </div>

      {/* Version status cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {versions.map((version) => {
          const build = getVersionBuild(version.id);
          return (
            <Link
              key={version.id}
              href={`/dashboard/apps/${appId}/store-listing?version=${version.id}`}
              className="block"
            >
              <Card className="transition-colors hover:bg-accent/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {PLATFORM_LABELS[version.platform] ?? version.platform}
                  </CardTitle>
                  <Badge
                    variant={
                      STATE_VARIANTS[version.appVersionState] ?? "secondary"
                    }
                  >
                    {stateLabel(version.appVersionState)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono">
                      {version.versionString}
                    </span>
                    <span
                      className={`size-2 rounded-full ${STATE_DOT_COLORS[version.appVersionState] ?? "bg-muted-foreground"}`}
                    />
                  </div>
                  {build && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Build {build.buildNumber} &middot;{" "}
                      {new Date(build.uploadedDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {editableVersions.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Rocket size={16} className="text-muted-foreground" />
                Ready to ship
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {editableVersions.length} version{editableVersions.length !== 1 ? "s" : ""}{" "}
                in progress. Edit metadata and submit for review.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/apps/${appId}/store-listing`}>
                  Edit store listing
                  <ArrowRight size={14} className="ml-1.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <PaperPlaneTilt size={16} className="text-muted-foreground" />
              TestFlight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Manage beta builds, groups, and testers.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/apps/${appId}/testflight`}>
                Manage TestFlight
                <ArrowRight size={14} className="ml-1.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <ChatsCircle size={16} className="text-muted-foreground" />
              Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              3 new reviews to respond to.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/apps/${appId}/reviews`}>
                View reviews
                <ArrowRight size={14} className="ml-1.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
