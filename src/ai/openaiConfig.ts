/**
 * OpenAI config for post-fight review.
 * Prefer a backend proxy in production — client keys can be extracted from the app bundle.
 */
export function getOpenAiApiKey(): string | null {
  const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

export function isOpenAiConfigured(): boolean {
  return getOpenAiApiKey() != null;
}

/** Cost-efficient default; override with EXPO_PUBLIC_OPENAI_MODEL if needed. */
export function getOpenAiModel(): string {
  return process.env.EXPO_PUBLIC_OPENAI_MODEL?.trim() || 'gpt-4o-mini';
}
