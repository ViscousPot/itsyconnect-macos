"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { toast } from "sonner";

const PROVIDERS = [
  {
    id: "anthropic",
    name: "Anthropic",
    envVar: "ANTHROPIC_API_KEY",
    package: "@ai-sdk/anthropic",
    models: [
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
      { id: "claude-haiku-4-5", name: "Claude Haiku 4.5" },
      { id: "claude-opus-4-5", name: "Claude Opus 4.5" },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    envVar: "OPENAI_API_KEY",
    package: "@ai-sdk/openai",
    models: [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
      { id: "gpt-4.1", name: "GPT-4.1" },
      { id: "gpt-4.1-mini", name: "GPT-4.1 Mini" },
    ],
  },
  {
    id: "google",
    name: "Google",
    envVar: "GOOGLE_GENERATIVE_AI_API_KEY",
    package: "@ai-sdk/google",
    models: [
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
    ],
  },
  {
    id: "xai",
    name: "xAI",
    envVar: "XAI_API_KEY",
    package: "@ai-sdk/xai",
    models: [
      { id: "grok-3", name: "Grok 3" },
      { id: "grok-3-fast", name: "Grok 3 Fast" },
      { id: "grok-3-mini", name: "Grok 3 Mini" },
    ],
  },
  {
    id: "mistral",
    name: "Mistral",
    envVar: "MISTRAL_API_KEY",
    package: "@ai-sdk/mistral",
    models: [
      { id: "mistral-large-latest", name: "Mistral Large" },
      { id: "mistral-small-latest", name: "Mistral Small" },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    envVar: "DEEPSEEK_API_KEY",
    package: "@ai-sdk/deepseek",
    models: [
      { id: "deepseek-chat", name: "DeepSeek Chat" },
      { id: "deepseek-reasoner", name: "DeepSeek Reasoner" },
    ],
  },
];

export default function AISettingsPage() {
  const [providerId, setProviderId] = useState("anthropic");
  const [modelId, setModelId] = useState("claude-sonnet-4-20250514");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const provider = useMemo(
    () => PROVIDERS.find((p) => p.id === providerId)!,
    [providerId],
  );

  function handleProviderChange(id: string) {
    setProviderId(id);
    const newProvider = PROVIDERS.find((p) => p.id === id)!;
    setModelId(newProvider.models[0].id);
    setApiKey("");
    setShowKey(false);
  }

  function handleSave() {
    toast.success("AI settings saved (prototype)");
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
            {PROVIDERS.map((p) => (
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
        <p className="text-sm text-muted-foreground">
          Stored encrypted on the server. Reads from{" "}
          <span className="font-mono text-xs">{provider.envVar}</span> if not
          set here.
        </p>
        <div className="flex items-center gap-2 max-w-md">
          <Input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
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

      <Button onClick={handleSave}>Save</Button>
    </div>
  );
}
