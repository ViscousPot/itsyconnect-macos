"use client";

import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  getAppVersions,
  getAppPlatforms,
  getVersionsByPlatform,
  type MockVersion,
} from "@/lib/mock-data";

const PLATFORM_LABELS: Record<string, string> = {
  IOS: "iOS",
  MAC_OS: "macOS",
  TV_OS: "tvOS",
  VISION_OS: "visionOS",
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

function stateLabel(state: string): string {
  return state
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface VersionBarProps {
  appId: string;
  selectedVersion: MockVersion | undefined;
  onVersionChange: (version: MockVersion) => void;
}

export function VersionBar({
  appId,
  selectedVersion,
  onVersionChange,
}: VersionBarProps) {
  const platforms = getAppPlatforms(appId);
  const currentPlatform = selectedVersion?.platform ?? platforms[0] ?? "IOS";
  const platformVersions = getVersionsByPlatform(appId, currentPlatform);
  const allVersions = getAppVersions(appId);

  function handlePlatformChange(platform: string) {
    const versions = getVersionsByPlatform(appId, platform);
    if (versions.length > 0) {
      onVersionChange(versions[0]);
    }
  }

  function handleVersionChange(versionId: string) {
    const version = allVersions.find((v) => v.id === versionId);
    if (version) {
      onVersionChange(version);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-2.5">
      <Select value={currentPlatform} onValueChange={handlePlatformChange}>
        <SelectTrigger className="h-8 w-28 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {platforms.map((p) => (
            <SelectItem key={p} value={p}>
              {PLATFORM_LABELS[p] ?? p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedVersion?.id ?? ""}
        onValueChange={handleVersionChange}
      >
        <SelectTrigger className="h-8 w-28 text-sm font-mono">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {platformVersions.map((v) => (
            <SelectItem key={v.id} value={v.id} className="font-mono">
              {v.versionString}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedVersion && (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span
            className={`size-2 shrink-0 rounded-full ${STATE_DOT_COLORS[selectedVersion.appVersionState] ?? "bg-muted-foreground"}`}
          />
          {stateLabel(selectedVersion.appVersionState)}
        </span>
      )}

      <Button
        variant="outline"
        size="sm"
        className="ml-auto h-8"
        onClick={() =>
          toast.info("New version creation not available in prototype")
        }
      >
        <Plus size={14} className="mr-1.5" />
        New version
      </Button>
    </div>
  );
}
