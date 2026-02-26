"use client";

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MOCK_APPS } from "@/lib/mock-data";

export default function AppDetailsPage() {
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
    <div className="space-y-8">
      {/* Identifiers (read-only) */}
      <section className="space-y-2">
        <h3 className="section-title">Identifiers</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <ReadOnlyField label="Bundle ID" value={app.bundleId} mono />
          <ReadOnlyField label="SKU" value={app.sku} mono />
        </div>
      </section>

      {/* Base language */}
      <section className="space-y-2">
        <h3 className="section-title">Base language</h3>
        <Select defaultValue={app.primaryLocale}>
          <SelectTrigger className="w-[200px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-US">English (US)</SelectItem>
            <SelectItem value="en-GB">English (UK)</SelectItem>
            <SelectItem value="de-DE">German</SelectItem>
            <SelectItem value="fr-FR">French</SelectItem>
            <SelectItem value="es-ES">Spanish</SelectItem>
            <SelectItem value="ja">Japanese</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* Categories */}
      <section className="space-y-2">
        <h3 className="section-title">Categories</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Primary category
            </label>
            <Select defaultValue="utilities">
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="photo-video">Photo & Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Secondary category
            </label>
            <Select defaultValue="none">
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Copyright */}
      <section className="space-y-2">
        <h3 className="section-title">Copyright</h3>
        <Input
          defaultValue="2026 Nick Ustinov"
          className="max-w-md text-sm"
        />
      </section>

      {/* Age rating */}
      <section className="space-y-2">
        <h3 className="section-title">Age rating</h3>
        <div className="flex gap-4">
          <Card className="w-32">
            <CardContent className="flex flex-col items-center justify-center py-4">
              <span className="text-2xl font-bold">4+</span>
              <span className="text-xs text-muted-foreground">
                173 territories
              </span>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* URLs */}
      <section className="space-y-2">
        <h3 className="section-title">URLs</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Support URL
            </label>
            <Input
              defaultValue="https://example.com/support"
              placeholder="https://..."
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Marketing URL
            </label>
            <Input
              defaultValue="https://example.com"
              placeholder="https://..."
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Privacy policy URL
            </label>
            <Input
              defaultValue="https://example.com/privacy"
              placeholder="https://..."
              className="font-mono text-sm"
            />
          </div>
        </div>
      </section>

      {/* App Store server notifications */}
      <section className="space-y-2">
        <h3 className="section-title">App Store server notifications</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Production URL
            </label>
            <Input
              placeholder="https://"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Sandbox URL
            </label>
            <Input
              placeholder="https://"
              className="font-mono text-sm"
            />
          </div>
        </div>
      </section>

      {/* Content rights */}
      <section className="space-y-2 pb-8">
        <h3 className="section-title">Content rights</h3>
        <RadioGroup defaultValue="none">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="none" id="cr-none" />
            <Label htmlFor="cr-none" className="text-sm font-normal">
              Does not use third-party content
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="has-rights" id="cr-has-rights" />
            <Label htmlFor="cr-has-rights" className="text-sm font-normal">
              Contains third-party content and I have the necessary rights
            </Label>
          </div>
        </RadioGroup>
      </section>
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}
