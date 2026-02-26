"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Camera, WarningCircle } from "@phosphor-icons/react";
import { MOCK_APPS } from "@/lib/mock-data";
import { getAppFeedback, type MockFeedbackItem } from "@/lib/mock-testflight";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isWithinDays(iso: string, days: number): boolean {
  const now = new Date("2026-02-26T12:00:00Z");
  const date = new Date(iso);
  return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) <= days;
}

export default function FeedbackPage() {
  const { appId } = useParams<{ appId: string }>();
  const router = useRouter();
  const app = MOCK_APPS.find((a) => a.id === appId);
  const allFeedback = useMemo(() => getAppFeedback(appId), [appId]);

  const versions = useMemo(
    () => [...new Set(allFeedback.map((f) => `${f.versionString} (${f.buildNumber})`))],
    [allFeedback],
  );

  const platforms = useMemo(
    () => [...new Set(allFeedback.map((f) => f.platform))],
    [allFeedback],
  );

  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [versionFilter, setVersionFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [hideCompleted, setHideCompleted] = useState(false);

  const filtered = useMemo(() => {
    let items = allFeedback;

    if (typeFilter !== "all") {
      items = items.filter((f) => f.type === typeFilter);
    }

    if (dateFilter !== "all") {
      const days = parseInt(dateFilter);
      items = items.filter((f) => isWithinDays(f.date, days));
    }

    if (versionFilter !== "all") {
      items = items.filter(
        (f) => `${f.versionString} (${f.buildNumber})` === versionFilter,
      );
    }

    if (platformFilter !== "all") {
      items = items.filter((f) => f.platform === platformFilter);
    }

    return items;
  }, [allFeedback, typeFilter, dateFilter, versionFilter, platformFilter]);

  // Stats
  const stats = useMemo(() => {
    const screenshots = allFeedback.filter((f) => f.type === "screenshot").length;
    const crashes = allFeedback.filter((f) => f.type === "crash").length;
    return { total: allFeedback.length, screenshots, crashes };
  }, [allFeedback]);

  if (!app) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        App not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardContent className="flex items-center gap-8 py-0">
          <div>
            <div className="text-4xl font-bold tabular-nums">{stats.total}</div>
            <p className="text-xs text-muted-foreground">total feedback</p>
          </div>
          <div className="h-10 border-l" />
          <div className="flex items-center gap-2">
            <Camera size={16} className="text-muted-foreground" />
            <div>
              <div className="text-lg font-semibold tabular-nums">{stats.screenshots}</div>
              <p className="text-xs text-muted-foreground">screenshots</p>
            </div>
          </div>
          <div className="h-10 border-l" />
          <div className="flex items-center gap-2">
            <WarningCircle size={16} className="text-destructive" />
            <div>
              <div className="text-lg font-semibold tabular-nums">{stats.crashes}</div>
              <p className="text-xs text-muted-foreground">crashes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="screenshot">Screenshots</SelectItem>
            <SelectItem value="crash">Crashes</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[140px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={versionFilter} onValueChange={setVersionFilter}>
          <SelectTrigger className="w-[160px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All versions</SelectItem>
            {versions.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[150px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {platforms.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Switch
            id="hide-completed"
            checked={hideCompleted}
            onCheckedChange={setHideCompleted}
          />
          <Label htmlFor="hide-completed" className="text-sm">
            Hide completed
          </Label>
        </div>
      </div>

      {/* Feedback list */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No feedback matches the current filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer transition-colors hover:bg-muted/30"
              onClick={() =>
                router.push(
                  `/dashboard/apps/${appId}/testflight/feedback/${item.id}`,
                )
              }
            >
              <CardContent className="space-y-3 py-0">
                {/* Header: type badge + date */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant={item.type === "crash" ? "destructive" : "secondary"}
                    className="gap-1.5 text-xs font-normal"
                  >
                    {item.type === "screenshot" ? (
                      <Camera size={12} />
                    ) : (
                      <WarningCircle size={12} />
                    )}
                    {item.type === "screenshot" ? "Screenshot" : "Crash"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.date)}
                  </span>
                </div>

                {/* Message */}
                <p className="text-sm line-clamp-2">{item.message}</p>

                {/* Footer: metadata */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {item.email
                      ? `${item.email} · ${item.device}`
                      : item.device}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.versionString} ({item.buildNumber})
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
