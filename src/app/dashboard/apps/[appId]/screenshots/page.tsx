"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Images, CloudArrowUp } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { VersionBar } from "@/components/layout/version-bar";
import {
  MOCK_APPS,
  getDefaultVersion,
  type MockVersion,
} from "@/lib/mock-data";

export default function ScreenshotsPage() {
  const { appId } = useParams<{ appId: string }>();
  const app = MOCK_APPS.find((a) => a.id === appId);
  const defaultVersion = getDefaultVersion(appId);
  const [selectedVersion, setSelectedVersion] = useState<
    MockVersion | undefined
  >(defaultVersion);

  if (!app) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        App not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <VersionBar
        appId={appId}
        selectedVersion={selectedVersion}
        onVersionChange={setSelectedVersion}
      />

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
        <Images size={48} className="text-muted-foreground/50" />
        <h2 className="mt-4 text-lg font-medium">Screenshots</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Upload screenshots for each device type and locale. Drag to reorder.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() =>
            toast.info("Screenshot upload not available in prototype")
          }
        >
          <CloudArrowUp size={16} className="mr-2" />
          Upload screenshots
        </Button>
      </div>
    </div>
  );
}
