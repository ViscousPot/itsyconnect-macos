import type { LanguageModel } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";
import { createMistral } from "@ai-sdk/mistral";
import { getAISettings } from "./settings";

/** Create a Vercel AI SDK LanguageModel from stored AI settings. */
export async function getLanguageModel(): Promise<LanguageModel> {
  const settings = await getAISettings();
  if (!settings) {
    throw new Error("AI not configured");
  }

  return createLanguageModel(settings.provider, settings.modelId, settings.apiKey);
}

export function createLanguageModel(
  provider: string,
  modelId: string,
  apiKey: string,
): LanguageModel {
  switch (provider) {
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey });
      return anthropic(modelId);
    }
    case "openai": {
      const openai = createOpenAI({ apiKey });
      return openai(modelId);
    }
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(modelId);
    }
    case "xai": {
      const xai = createXai({ apiKey });
      return xai(modelId);
    }
    case "mistral": {
      const mistral = createMistral({ apiKey });
      return mistral(modelId);
    }
    case "deepseek": {
      const deepseek = createOpenAI({
        apiKey,
        baseURL: "https://api.deepseek.com/v1",
      });
      return deepseek(modelId);
    }
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}
