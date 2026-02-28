import { describe, it, expect } from "vitest";
import {
  buildTranslatePrompt,
  buildImprovePrompt,
  buildGenerateKeywordsPrompt,
  buildOptimizeKeywordsPrompt,
  buildFillKeywordGapsPrompt,
} from "@/lib/ai/prompts";

describe("buildTranslatePrompt", () => {
  it("includes source text, locale names, and field context", () => {
    const prompt = buildTranslatePrompt(
      "Download now and enjoy!",
      "en-US",
      "de-DE",
      { field: "description", appName: "Weatherly", charLimit: 4000 },
    );

    expect(prompt).toContain("Download now and enjoy!");
    expect(prompt).toContain("English (US)");
    expect(prompt).toContain("German");
    expect(prompt).toContain("app description");
    expect(prompt).toContain("Weatherly");
    expect(prompt).toContain("4000");
  });

  it("works without optional context fields", () => {
    const prompt = buildTranslatePrompt(
      "Hello world",
      "en-US",
      "ja",
      { field: "whatsNew" },
    );

    expect(prompt).toContain("Hello world");
    expect(prompt).toContain("Japanese");
    expect(prompt).toContain("release notes");
    expect(prompt).not.toContain("app is called");
    expect(prompt).not.toContain("must not exceed");
  });

  it("includes keyword-specific guidance for keywords field", () => {
    const prompt = buildTranslatePrompt(
      "weather,forecast,rain",
      "en-US",
      "fr-FR",
      { field: "keywords" },
    );

    expect(prompt).toContain("keywords");
    expect(prompt).toContain("comma-separated");
  });

  it("handles empty text", () => {
    const prompt = buildTranslatePrompt(
      "",
      "en-US",
      "es-ES",
      { field: "description" },
    );

    expect(prompt).toContain("app description");
    expect(prompt).toContain("Spanish (Spain)");
  });
});

describe("buildImprovePrompt", () => {
  it("includes text, locale, ASO guidance, and char limit", () => {
    const prompt = buildImprovePrompt(
      "A simple weather app.",
      "en-US",
      { field: "description", appName: "Weatherly", charLimit: 4000 },
    );

    expect(prompt).toContain("A simple weather app.");
    expect(prompt).toContain("English (US)");
    expect(prompt).toContain("App Store search discoverability");
    expect(prompt).toContain("Weatherly");
    expect(prompt).toContain("4000");
  });

  it("works without optional context fields", () => {
    const prompt = buildImprovePrompt(
      "Bug fixes.",
      "ja",
      { field: "whatsNew" },
    );

    expect(prompt).toContain("Bug fixes.");
    expect(prompt).toContain("Japanese");
    expect(prompt).not.toContain("app is called");
    expect(prompt).not.toContain("must not exceed");
  });

  it("handles empty text", () => {
    const prompt = buildImprovePrompt(
      "",
      "en-US",
      { field: "promotionalText" },
    );

    expect(prompt).toContain("promotional text");
  });
});

describe("buildGenerateKeywordsPrompt", () => {
  it("includes locale and app context", () => {
    const prompt = buildGenerateKeywordsPrompt("de-DE", {
      field: "keywords",
      appName: "Weatherly",
      description: "Check the weather forecast anytime.",
    });

    expect(prompt).toContain("German");
    expect(prompt).toContain("de-DE");
    expect(prompt).toContain("Weatherly");
    expect(prompt).toContain("Check the weather forecast");
    expect(prompt).toContain("100 characters");
    expect(prompt).toContain("comma-separated");
  });

  it("works without description", () => {
    const prompt = buildGenerateKeywordsPrompt("ja", {
      field: "keywords",
      appName: "Photon",
    });

    expect(prompt).toContain("Japanese");
    expect(prompt).toContain("Photon");
    expect(prompt).not.toContain("App description for context");
  });

  it("instructs not to duplicate app name words", () => {
    const prompt = buildGenerateKeywordsPrompt("en-US", {
      field: "keywords",
    });

    expect(prompt).toContain("app name");
    expect(prompt).toContain("auto-indexes");
  });
});

describe("buildOptimizeKeywordsPrompt", () => {
  it("includes current keywords and optimization rules", () => {
    const prompt = buildOptimizeKeywordsPrompt(
      "weather, forecast, the best app, rain",
      "en-US",
      { field: "keywords", appName: "Weatherly" },
    );

    expect(prompt).toContain("weather, forecast, the best app, rain");
    expect(prompt).toContain("English (US)");
    expect(prompt).toContain("stop words");
    expect(prompt).toContain("Remove spaces after commas");
    expect(prompt).toContain("100 characters");
  });

  it("includes description context when provided", () => {
    const prompt = buildOptimizeKeywordsPrompt(
      "weather,rain",
      "en-US",
      { field: "keywords", description: "A weather app for daily forecasts." },
    );

    expect(prompt).toContain("A weather app for daily forecasts.");
  });
});

describe("buildFillKeywordGapsPrompt", () => {
  it("includes current keywords and other locales' keywords", () => {
    const prompt = buildFillKeywordGapsPrompt(
      "weather,forecast",
      "de-DE",
      {
        "en-US": "weather,forecast,rain,humidity,uv",
        "fr-FR": "météo,prévision,pluie,humidité",
      },
      { field: "keywords", appName: "Weatherly" },
    );

    expect(prompt).toContain("German");
    expect(prompt).toContain("weather,forecast");
    expect(prompt).toContain("English (US)");
    expect(prompt).toContain("rain,humidity,uv");
    expect(prompt).toContain("French (France)");
    expect(prompt).toContain("missing");
  });

  it("shows (empty) when current keywords are empty", () => {
    const prompt = buildFillKeywordGapsPrompt(
      "",
      "ja",
      { "en-US": "weather,rain" },
      { field: "keywords" },
    );

    expect(prompt).toContain("(empty)");
    expect(prompt).toContain("Japanese");
  });
});
