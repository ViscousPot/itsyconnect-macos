"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeSlash, SpinnerGap } from "@phosphor-icons/react";
import { toast } from "sonner";
import { AI_PROVIDERS } from "@/lib/ai-providers";

export default function AISettingsPage() {
  const [providerId, setProviderId] = useState("anthropic");
  const [modelId, setModelId] = useState("claude-sonnet-4-20250514");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const provider = useMemo(
    () => AI_PROVIDERS.find((p) => p.id === providerId)!,
    [providerId],
  );

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/settings/ai");
    if (res.ok) {
      const data = await res.json();
      if (data.settings) {
        setProviderId(data.settings.provider);
        setModelId(data.settings.modelId);
        setHasExistingKey(data.settings.hasApiKey);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  function handleProviderChange(id: string) {
    setProviderId(id);
    const newProvider = AI_PROVIDERS.find((p) => p.id === id)!;
    setModelId(newProvider.models[0].id);
    setApiKey("");
    setShowKey(false);
  }

  async function handleSave() {
    setSaving(true);

    try {
      const body: Record<string, string> = { provider: providerId, modelId };
      if (apiKey.trim()) body.apiKey = apiKey.trim();

      const res = await fetch("/api/settings/ai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("AI settings saved");
        setHasExistingKey(!!apiKey.trim());
        setApiKey("");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to save");
      }
    } catch {
      toast.error("Network error");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <SpinnerGap size={16} className="animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h3 className="section-title">Provider</h3>
        <p className="text-sm text-muted-foreground">
          Select the AI provider for translations, copywriting, and other AI
          operations.
        </p>
        <Select value={providerId} onValueChange={handleProviderChange}>
          <SelectTrigger className="w-[200px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AI_PROVIDERS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="space-y-2">
        <h3 className="section-title">Model</h3>
        <Select value={modelId} onValueChange={setModelId}>
          <SelectTrigger className="w-[260px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {provider.models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
                <span className="ml-2 text-muted-foreground font-mono text-xs">
                  {m.id}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="space-y-2">
        <h3 className="section-title">API key</h3>
        {hasExistingKey && (
          <p className="text-sm text-muted-foreground">
            An API key is stored. Enter a new key to replace it.
          </p>
        )}
        <div className="flex items-center gap-2 max-w-md">
          <Input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={hasExistingKey ? "Enter new key to replace" : "Paste your API key"}
            className="font-mono text-sm"
          />
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <EyeSlash size={16} /> : <Eye size={16} />}
          </Button>
        </div>
      </section>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? (
          <>
            <SpinnerGap size={16} className="animate-spin" />
            Saving...
          </>
        ) : (
          "Save"
        )}
      </Button>
    </div>
  );
}
