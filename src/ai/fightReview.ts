import type { FightOutcome } from '../types';
import { downsampleSeries } from '../coaching/analytics';
import { getOpenAiApiKey, getOpenAiModel, isOpenAiConfigured } from './openaiConfig';

export interface FightReviewInput {
  outcome: FightOutcome;
  fightSeconds: number;
  location: string;
  samples: number[];
  /** Local average tension — context only, not shown as the score. */
  averageTension: number;
}

export interface FightAiReview {
  score: number;
  /** 0–100 indexes for the score screen. */
  consistency: number;
  control: number;
  recovery: number;
  /** ≤6 words. */
  highlight: string;
  /** ≤10 words — one fix. */
  tip: string;
  model: string;
}

export class OpenAiReviewError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenAiReviewError';
  }
}

/**
 * Post-fight OpenAI review: one score + three 0–100 metrics + tiny copy.
 * Live in-fight coaching stays local/deterministic.
 */
export async function reviewFightWithOpenAI(input: FightReviewInput): Promise<FightAiReview> {
  if (!isOpenAiConfigured()) {
    throw new OpenAiReviewError('OpenAI is not configured. Set EXPO_PUBLIC_OPENAI_API_KEY.');
  }

  const key = getOpenAiApiKey()!;
  const model = getOpenAiModel();
  const series = downsampleSeries(input.samples, 40);
  const stats = summarizeSeries(series);

  const system = `You are DragonFly fight coach for DragonFly 1.0.
Tension is a UNITLESS relative index — never claim pounds or calibrated force.
Return JSON only. Be extremely brief. Prefer numbers over sentences.`;

  const user = JSON.stringify({
    task: 'Score the fight with quant metrics and tiny labels — no paragraphs.',
    outcome: input.outcome,
    fightSeconds: input.fightSeconds,
    location: input.location,
    averageTension: input.averageTension,
    tensionStats: stats,
    tensionSeries: series,
    rules: {
      score: 'integer 0-100 overall control',
      consistency: '0-100 how smooth tension stayed (penalize spikes/slack)',
      control: '0-100 how well angler managed pressure vs fish runs',
      recovery: '0-100 how quickly they recovered after spikes or slack',
      highlight: 'max 6 words — best thing they did',
      tip: 'max 10 words — one concrete next-fight fix',
      lostNote:
        input.outcome === 'lost'
          ? 'Be honest; tip should name the likely mistake'
          : 'Still give one improvement tip',
      ban: 'No multi-sentence coaching. No fluff. No explanations longer than the word limits.',
    },
    outputSchema: {
      score: 'integer 0-100',
      consistency: 'integer 0-100',
      control: 'integer 0-100',
      recovery: 'integer 0-100',
      highlight: 'string ≤6 words',
      tip: 'string ≤10 words',
    },
  });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new OpenAiReviewError(
      `OpenAI request failed (${res.status})${errText ? `: ${errText.slice(0, 180)}` : ''}`
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new OpenAiReviewError('OpenAI returned an empty response.');

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content) as Record<string, unknown>;
  } catch {
    throw new OpenAiReviewError('OpenAI returned invalid JSON.');
  }

  const highlight = clipWords(asText(parsed.highlight, 'Steady pressure'), 6);
  const tip = clipWords(
    asText(parsed.tip, input.outcome === 'lost' ? 'Ease earlier on spikes' : 'Recover line faster on drops'),
    10
  );

  return {
    score: clampScore(parsed.score),
    consistency: clampScore(parsed.consistency ?? statsToConsistency(stats)),
    control: clampScore(parsed.control ?? parsed.score),
    recovery: clampScore(parsed.recovery ?? 60),
    highlight,
    tip,
    model,
  };
}

function clampScore(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function asText(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string') return fallback;
  const t = raw.trim();
  return t.length ? t : fallback;
}

function clipWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(' ');
  return words.slice(0, maxWords).join(' ');
}

function statsToConsistency(stats: ReturnType<typeof summarizeSeries>): number {
  if (stats.avg == null || stats.variability == null || stats.avg <= 0) return 50;
  const cv = stats.variability / stats.avg;
  return Math.max(0, Math.min(100, Math.round(100 - cv * 120)));
}

function summarizeSeries(samples: number[]) {
  if (!samples.length) {
    return { count: 0, min: null as number | null, max: null as number | null, avg: null as number | null, variability: null as number | null };
  }
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance = samples.reduce((acc, v) => acc + (v - avg) ** 2, 0) / samples.length;
  return {
    count: samples.length,
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    avg: Number(avg.toFixed(2)),
    variability: Number(Math.sqrt(variance).toFixed(2)),
  };
}
