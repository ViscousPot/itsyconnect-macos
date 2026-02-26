"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VersionBar } from "@/components/layout/version-bar";
import {
  MOCK_APPS,
  getDefaultVersion,
  type MockVersion,
} from "@/lib/mock-data";

export default function AppReviewPage() {
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

      {/* Review notes */}
      <section className="space-y-2">
        <h3 className="section-title">Notes for App Review</h3>
        <Card className="gap-0 py-0">
          <CardContent className="px-5 py-4">
            <Textarea
              placeholder="Provide any additional information the App Review team might need..."
              className="border-0 p-0 shadow-none focus-visible:ring-0 resize-none font-mono text-sm min-h-0"
              defaultValue=""
            />
          </CardContent>
          <div className="flex items-center justify-end border-t px-3 py-1.5">
            <span className="text-xs tabular-nums text-muted-foreground">
              0/4000
            </span>
          </div>
        </Card>
      </section>

      {/* Demo account */}
      <section className="space-y-4">
        <h3 className="section-title">Demo account</h3>
        <p className="text-sm text-muted-foreground">
          If your app requires sign-in, provide credentials for the review team.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Username</label>
            <Input placeholder="demo@example.com" className="font-mono text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Password</label>
            <Input
              type="password"
              placeholder="Password"
              className="font-mono text-sm"
            />
          </div>
        </div>
      </section>

      {/* Contact information */}
      <section className="space-y-4">
        <h3 className="section-title">Contact details</h3>
        <p className="text-sm text-muted-foreground">
          How the App Review team can reach you if they have questions.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">First name</label>
            <Input className="text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Last name</label>
            <Input className="text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Phone</label>
            <Input className="font-mono text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Email</label>
            <Input type="email" className="font-mono text-sm" />
          </div>
        </div>
      </section>

      {/* Submission history */}
      <section className="space-y-4 pb-8">
        <h3 className="section-title">Submission history</h3>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              <SubmissionRow
                date="25 Feb 2026, 17:57"
                version="2.1.0"
                platform="macOS"
                status="Waiting for review"
                statusColor="text-amber-600"
              />
              <SubmissionRow
                date="17 Feb 2026, 12:33"
                version="2.0.0"
                platform="macOS"
                status="Review completed"
                statusColor="text-green-600"
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function SubmissionRow({
  date,
  version,
  platform,
  status,
  statusColor,
}: {
  date: string;
  version: string;
  platform: string;
  status: string;
  statusColor: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{date}</span>
        <span className="font-mono text-sm">
          {platform} {version}
        </span>
      </div>
      <span className={`text-sm font-medium ${statusColor}`}>{status}</span>
    </div>
  );
}
