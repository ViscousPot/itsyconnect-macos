"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AppWindow,
  Users,
  PaperPlaneTilt,
  Plus,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { MOCK_APPS, MOCK_BUILDS, getAppVersions } from "@/lib/mock-data";

const PLATFORM_LABELS: Record<string, string> = {
  IOS: "iOS",
  MAC_OS: "macOS",
  TV_OS: "tvOS",
  VISION_OS: "visionOS",
};

export default function TestFlightPage() {
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

  const builds = MOCK_BUILDS.filter((b) =>
    versions.some((v) => v.id === b.versionId)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">TestFlight</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info("Not available in prototype")}
        >
          <Plus size={14} className="mr-1.5" />
          New group
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Builds</CardTitle>
            <AppWindow size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{builds.length}</div>
            <p className="text-xs text-muted-foreground">Available for testing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groups</CardTitle>
            <Users size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Internal, External</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testers</CardTitle>
            <PaperPlaneTilt size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Active testers</p>
          </CardContent>
        </Card>
      </div>

      {/* Builds list */}
      <section className="space-y-3">
        <h2 className="section-title">Recent builds</h2>
        <div className="rounded-lg border">
          {builds.map((build, i) => {
            const version = versions.find((v) => v.id === build.versionId);
            return (
              <div
                key={build.id}
                className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 text-white">
                    <AppWindow size={14} weight="fill" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Build {build.buildNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {version
                        ? `${PLATFORM_LABELS[version.platform] ?? version.platform} ${version.versionString}`
                        : build.versionString}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    IN, EX
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(build.uploadedDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
