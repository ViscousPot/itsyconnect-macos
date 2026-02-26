"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Eye, MapPin, UserCircle } from "@phosphor-icons/react";
import { MOCK_APPS } from "@/lib/mock-data";

export default function PrivacyPage() {
  const { appId } = useParams<{ appId: string }>();
  const app = MOCK_APPS.find((a) => a.id === appId);

  if (!app) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        App not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">App privacy</h1>

      <p className="text-sm text-muted-foreground">
        Declare the data your app collects to display privacy nutrition labels
        on the App Store.
      </p>

      {/* Privacy summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Data not collected
            </CardTitle>
            <ShieldCheck size={16} className="text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This app does not collect any user data.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data types */}
      <section className="space-y-4">
        <h3 className="section-title">Data categories</h3>
        <div className="space-y-2">
          <DataCategory
            icon={UserCircle}
            title="Contact info"
            description="Not collected"
          />
          <DataCategory
            icon={MapPin}
            title="Location"
            description="Not collected"
          />
          <DataCategory
            icon={Eye}
            title="Usage data"
            description="Not collected"
          />
        </div>
      </section>

      <section className="space-y-4 pb-8">
        <h3 className="section-title">Tracking</h3>
        <p className="text-sm text-muted-foreground">
          This app does not track users across apps and websites.
        </p>
      </section>
    </div>
  );
}

function DataCategory({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ size: number; className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
      <Icon size={16} className="text-muted-foreground" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
