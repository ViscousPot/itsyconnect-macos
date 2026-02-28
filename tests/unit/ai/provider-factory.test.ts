import { describe, it, expect } from "vitest";
import { createLanguageModel } from "@/lib/ai/provider-factory";

// The LanguageModel type is a union; runtime objects have modelId/provider
// but TS can't see them on every union member. Cast to Record for assertions.

describe("createLanguageModel", () => {
  it("creates an Anthropic model", () => {
    const model = createLanguageModel("anthropic", "claude-sonnet-4-6", "sk-test") as Record<string, unknown>;
    expect(model.modelId).toBe("claude-sonnet-4-6");
    expect(model.provider).toBe("anthropic.messages");
  });

  it("creates an OpenAI model", () => {
    const model = createLanguageModel("openai", "gpt-5.2", "sk-test") as Record<string, unknown>;
    expect(model.modelId).toBe("gpt-5.2");
    expect(model.provider).toContain("openai");
  });

  it("creates a Google model", () => {
    const model = createLanguageModel("google", "gemini-3-pro-preview", "test-key") as Record<string, unknown>;
    expect(model.modelId).toBe("gemini-3-pro-preview");
    expect(model.provider).toContain("google");
  });

  it("creates an xAI model", () => {
    const model = createLanguageModel("xai", "grok-4-1", "xai-test") as Record<string, unknown>;
    expect(model.modelId).toBe("grok-4-1");
    expect(model.provider).toContain("xai");
  });

  it("creates a Mistral model", () => {
    const model = createLanguageModel("mistral", "mistral-large-latest", "test-key") as Record<string, unknown>;
    expect(model.modelId).toBe("mistral-large-latest");
    expect(model.provider).toContain("mistral");
  });

  it("creates a DeepSeek model via OpenAI-compatible adapter", () => {
    const model = createLanguageModel("deepseek", "deepseek-chat", "ds-test") as Record<string, unknown>;
    expect(model.modelId).toBe("deepseek-chat");
    expect(model.provider).toContain("openai");
  });

  it("throws for unknown provider", () => {
    expect(() => createLanguageModel("unknown", "model", "key")).toThrow(
      "Unknown AI provider: unknown",
    );
  });
});
