/**
 * Server-Side AI Service Layer
 *
 * Supports Google Gemini API (gemini-1.5-flash / gemini-2.5-flash) and standard OpenAI-compatible endpoints.
 * Operates strictly server-side — API keys are NEVER sent to the client.
 * Fails gracefully if no key is configured or if the provider is unavailable.
 */

export interface AiServiceConfig {
  apiKey?: string;
  provider: "gemini" | "openai_compatible" | "mock_fallback";
  model: string;
}

export function getAiConfig(): AiServiceConfig {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    return {
      apiKey: geminiKey,
      provider: "gemini",
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    };
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return {
      apiKey: openaiKey,
      provider: "openai_compatible",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    };
  }

  return {
    provider: "mock_fallback",
    model: "deterministic-heuristic-engine",
  };
}

export function isAiEnabled(): boolean {
  if (process.env.AI_FEATURES_ENABLED === "false") {
    return false;
  }
  return true;
}

/**
 * Execute LLM call with a 15-second timeout and structured output extraction
 */
export async function callLlmStructured<T>(params: {
  systemPrompt: string;
  userPrompt: string;
  fallbackGenerator: () => T;
}): Promise<T> {
  const config = getAiConfig();

  if (!isAiEnabled() || config.provider === "mock_fallback" || !config.apiKey) {
    // Graceful offline heuristic engine
    return params.fallbackGenerator();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    if (config.provider === "gemini") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: `${params.systemPrompt}\n\nTask:\n${params.userPrompt}` },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        console.warn(`[AI Client] Gemini API returned status ${res.status}. Using fallback.`);
        return params.fallbackGenerator();
      }

      const json = await res.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        return params.fallbackGenerator();
      }

      return JSON.parse(rawText) as T;
    }

    if (config.provider === "openai_compatible") {
      const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: "system", content: params.systemPrompt },
            { role: "user", content: params.userPrompt },
          ],
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        console.warn(`[AI Client] OpenAI API returned status ${res.status}. Using fallback.`);
        return params.fallbackGenerator();
      }

      const json = await res.json();
      const content = json?.choices?.[0]?.message?.content;
      if (!content) {
        return params.fallbackGenerator();
      }

      return JSON.parse(content) as T;
    }

    return params.fallbackGenerator();
  } catch (err: unknown) {
    console.warn("[AI Client] LLM request failed or timed out. Falling back gracefully:", err instanceof Error ? err.message : err);
    return params.fallbackGenerator();
  } finally {
    clearTimeout(timeoutId);
  }
}
