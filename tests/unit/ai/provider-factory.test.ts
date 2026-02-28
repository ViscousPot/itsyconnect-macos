import { describe, it, expect, vi } from "vitest";
import { createLanguageModel, validateApiKey } from "@/lib/ai/provider-factory";

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

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

describe("validateApiKey", () => {
  it("returns null when API call succeeds", async () => {
    const { generateText } = await import("ai");
    vi.mocked(generateText).mockResolvedValueOnce({ text: "hi" } as never);

    const result = await validateApiKey("anthropic", "claude-sonnet-4-6", "sk-valid");
    expect(result).toBeNull();
  });

  it("returns 'Invalid API key' for 401 errors", async () => {
    const { generateText } = await import("ai");
    vi.mocked(generateText).mockRejectedValueOnce(new Error("401 Unauthorized"));

    const result = await validateApiKey("anthropic", "claude-sonnet-4-6", "sk-bad");
    expect(result).toBe("Invalid API key");
  });

  it("returns 'Invalid API key' for invalid key message", async () => {
    const { generateText } = await import("ai");
    vi.mocked(generateText).mockRejectedValueOnce(new Error("invalid api key"));

    const result = await validateApiKey("openai", "gpt-5.2", "sk-bad");
    expect(result).toBe("Invalid API key");
  });

  it("returns null for rate limit errors (key is valid)", async () => {
    const { generateText } = await import("ai");
    vi.mocked(generateText).mockRejectedValueOnce(new Error("429 rate limit exceeded"));

    const result = await validateApiKey("anthropic", "claude-sonnet-4-6", "sk-valid");
    expect(result).toBeNull();
  });

  it("returns permission error for 403", async () => {
    const { generateText } = await import("ai");
    vi.mocked(generateText).mockRejectedValueOnce(new Error("403 Forbidden"));

    const result = await validateApiKey("anthropic", "claude-sonnet-4-6", "sk-noperms");
    expect(result).toBe("API key lacks required permissions");
  });

  it("returns model not found for 404", async () => {
    const { generateText } = await import("ai");
    vi.mocked(generateText).mockRejectedValueOnce(new Error("404 model not found"));

    const result = await validateApiKey("anthropic", "bad-model", "sk-valid");
    expect(result).toBe("Model not found – check your provider and model selection");
  });

  it("returns generic error for unknown failures", async () => {
    const { generateText } = await import("ai");
    vi.mocked(generateText).mockRejectedValueOnce(new Error("connection timeout"));

    const result = await validateApiKey("anthropic", "claude-sonnet-4-6", "sk-valid");
    expect(result).toBe("API key validation failed: connection timeout");
  });
});
