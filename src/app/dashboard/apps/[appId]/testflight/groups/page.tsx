"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LinkSimple } from "@phosphor-icons/react";
import { MOCK_APPS } from "@/lib/mock-data";
import { getAppGroups } from "@/lib/mock-testflight";

export default function GroupsPage() {
  const { appId } = useParams<{ appId: string }>();
  const app = MOCK_APPS.find((a) => a.id === appId);
  const groups = useMemo(() => getAppGroups(appId), [appId]);

  if (!app) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        App not found
      </div>
    );
  }

  const internalGroups = groups.filter((g) => g.type === "Internal");
  const externalGroups = groups.filter((g) => g.type === "External");

  return (
    <div className="space-y-6">
      {internalGroups.length > 0 && (
        <section className="space-y-3">
          <h3 className="section-title">Internal groups</h3>
          <div className="rounded-lg border">
            {internalGroups.map((group, i) => (
              <Link
                key={group.id}
                href={`/dashboard/apps/${appId}/testflight/groups/${group.id}`}
                className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/50 ${i > 0 ? "border-t" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-4 items-center justify-center rounded text-[10px] font-medium bg-muted text-muted-foreground">
                    I
                  </span>
                  <span className="text-sm font-medium">{group.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{group.testerCount} testers</span>
                  <span>{group.buildCount} builds</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {externalGroups.length > 0 && (
        <section className="space-y-3">
          <h3 className="section-title">External groups</h3>
          <div className="rounded-lg border">
            {externalGroups.map((group, i) => (
              <Link
                key={group.id}
                href={`/dashboard/apps/${appId}/testflight/groups/${group.id}`}
                className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/50 ${i > 0 ? "border-t" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-4 items-center justify-center rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                    E
                  </span>
                  <span className="text-sm font-medium">{group.name}</span>
                  {group.publicLinkEnabled && (
                    <LinkSimple size={14} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{group.testerCount} testers</span>
                  <span>{group.buildCount} builds</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
