import type { FightOutcome } from '../types';
import { downsampleSeries } from '../coaching/analytics';
import { getOpenAiApiKey, getOpenAiModel, isOpenAiConfigured } from './openaiConfig';

export interface FightReviewInput {
  outcome: FightOutcome;
  fightSeconds: number;
  location: string;
  samples: number[];
  /** Rule-based fallbacks already computed locally. */
  baselineAverage: number;
  baselineSummary?: string;
  baselineWhatWentWell?: string;
  baselineImprovement?: string;
}

export interface FightAiReview {
  score: number;
  scoreRationale: string;
  summary: string;
  whatWentWell: string;
  improvement: string;
  model: string;
}

export class OpenAiReviewError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenAiReviewError';
  }
}

/**
 * Post-fight OpenAI review: rubric score (0–100) + coaching copy.
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

  const system = `You are DragonFly, a coaching assistant for beginner anglers using a smart fishing-rod attachment.
Tension samples are a UNITLESS relative index — never claim pounds, Newtons, or calibrated force.
Be encouraging, specific, and practical for family/friends learning to fight a fish.
Respond with JSON only.`;

  const user = JSON.stringify({
    task: 'Score this fight and write short coaching notes.',
    outcome: input.outcome,
    fightSeconds: input.fightSeconds,
    location: input.location,
    baselineAverageTension: input.baselineAverage,
    localHints: {
      summary: input.baselineSummary,
      whatWentWell: input.baselineWhatWentWell,
      improvement: input.baselineImprovement,
    },
    tensionStats: stats,
    tensionSeries: series,
    rubric: {
      scoreRange: '0-100 integer',
      consistency: 'Reward smooth relative tension; penalize wild spikes and slack drops',
      control: 'Reward recovering after spikes/slack; penalize long uncontrolled runs',
      outcomeNote:
        input.outcome === 'lost'
          ? 'Fish got away — score effort/control honestly, but emphasize the main mistake to fix'
          : 'Fish landed — celebrate control, still give one improvement',
      tone: 'Beginner-friendly, outdoor coach, no jargon dump',
    },
    outputSchema: {
      score: 'integer 0-100',
      scoreRationale: '1 short sentence explaining the score',
      summary: '2 sentences max on what happened',
      whatWentWell: '1-2 sentences',
      improvement: '1 concrete next-fight tip',
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
      temperature: 0.4,
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

  const score = clampScore(parsed.score);
  return {
    score,
    scoreRationale: asText(parsed.scoreRationale, 'Scored from relative tension control this fight.'),
    summary: asText(parsed.summary, input.baselineSummary ?? 'Fight captured.'),
    whatWentWell: asText(parsed.whatWentWell, input.baselineWhatWentWell ?? 'You stayed with the fight.'),
    improvement: asText(
      parsed.improvement,
      input.baselineImprovement ?? 'Keep pressure smooth and recover line when tension drops.'
    ),
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

function summarizeSeries(samples: number[]) {
  if (!samples.length) {
    return { count: 0, min: null, max: null, avg: null, variability: null };
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
