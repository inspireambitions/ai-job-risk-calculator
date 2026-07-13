import Anthropic from '@anthropic-ai/sdk';
import { createHash, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { ANALYSIS_TOOL, buildAnalysisPrompt, normalizeAnalysis, validateAnalysisInput } from '../../../lib/analysis';
import { applyDeterministicScores } from '../../../lib/scoring';

export const runtime = 'nodejs';
export const maxDuration = 60;

const REQUEST_TIMEOUT_MS = Number(process.env.ANTHROPIC_TIMEOUT_MS || 25000);
const CACHE_TTL_MS = Number(process.env.ANALYSIS_CACHE_TTL_MS || 30 * 60 * 1000);
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = Number(process.env.ANALYSIS_RATE_LIMIT_PER_HOUR || 20);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 0,
  timeout: REQUEST_TIMEOUT_MS,
});

const state = globalThis.__riskAnalysisState || {
  cache: new Map(), inFlight: new Map(), rateLimits: new Map(),
};
globalThis.__riskAnalysisState = state;

function getModelCandidates() {
  const configured = [process.env.ANTHROPIC_PRIMARY_MODEL, ...(process.env.ANTHROPIC_FALLBACK_MODELS || '').split(',')]
    .map((model) => model?.trim()).filter(Boolean);
  return [...new Set(configured.length > 0 ? configured : ['claude-haiku-4-5-20251001', 'claude-sonnet-4-5'])];
}

const hash = (value) => createHash('sha256').update(value).digest('hex');

function getClientKey(request) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return hash(forwardedFor || request.headers.get('x-real-ip') || 'unknown');
}

function checkRateLimit(clientKey) {
  const now = Date.now();
  const existing = state.rateLimits.get(clientKey);
  if (!existing || existing.resetAt <= now) {
    state.rateLimits.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  if (existing.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }
  existing.count += 1;
  return { allowed: true };
}

function isRetryable(error) {
  const status = Number(error?.status || 0);
  return status === 408 || status === 409 || status === 429 || status >= 500 ||
    error?.name === 'AbortError' || error?.code === 'ETIMEDOUT';
}

function publicError(error) {
  const status = Number(error?.status || 0);
  if (status === 429) return { code: 'PROVIDER_BUSY', message: 'The analysis service is busy. Please wait a moment and try again.' };
  if (error?.name === 'AbortError' || error?.code === 'ETIMEDOUT') {
    return { code: 'ANALYSIS_TIMEOUT', message: 'The analysis took too long. Your details are still here, so you can try again.' };
  }
  return { code: 'ANALYSIS_UNAVAILABLE', message: 'We could not complete the analysis right now. Your details are still here, so you can try again.' };
}

function extractToolResult(message) {
  const toolUse = message.content?.find((block) => block.type === 'tool_use' && block.name === ANALYSIS_TOOL.name);
  if (!toolUse?.input) {
    throw Object.assign(new Error('The model returned no structured analysis.'), { code: 'INVALID_MODEL_RESPONSE' });
  }
  return normalizeAnalysis(toolUse.input);
}

export async function runAnalysis(input, client = anthropic) {
  const prompt = buildAnalysisPrompt(input);
  let lastError;
  for (const model of getModelCandidates()) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const message = await client.messages.create({
          model, max_tokens: 4000, temperature: 0,
          tools: [ANALYSIS_TOOL],
          tool_choice: { type: 'tool', name: ANALYSIS_TOOL.name },
          messages: [{ role: 'user', content: prompt }],
        });
        return { analysis: extractToolResult(message), model };
      } catch (error) {
        lastError = error;
        if (!(attempt < 2 && isRetryable(error))) break;
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }
  throw lastError || new Error('No analysis model is configured.');
}

export function getOrCreateAnalysis(cacheKey, factory, now = Date.now()) {
  const cached = state.cache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return { source: 'cache', promise: Promise.resolve(cached.analysis) };
  }

  let promise = state.inFlight.get(cacheKey);
  if (!promise) {
    promise = factory()
      .then((result) => {
        state.cache.set(cacheKey, { analysis: result, expiresAt: Date.now() + CACHE_TTL_MS });
        return result;
      })
      .finally(() => state.inFlight.delete(cacheKey));
    state.inFlight.set(cacheKey, promise);
  }
  return { source: 'live', promise };
}

export async function POST(request) {
  const requestId = randomUUID();
  try {
    if (!process.env.ANTHROPIC_API_KEY) throw Object.assign(new Error('ANTHROPIC_API_KEY is missing.'), { code: 'CONFIGURATION_ERROR' });

    const rateLimit = checkRateLimit(getClientKey(request));
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many analyses. Please try again later.', code: 'RATE_LIMITED', requestId },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      );
    }

    const validation = validateAnalysisInput(await request.json());
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error, code: 'INVALID_INPUT', requestId }, { status: 400 });
    }

    const input = validation.value;
    const cacheKey = hash(JSON.stringify(input));
    const pending = getOrCreateAnalysis(cacheKey, () => runAnalysis(input));
    const { analysis: modelAnalysis, model } = await pending.promise;
    const analysis = applyDeterministicScores(modelAnalysis, input);

    console.info('Analysis completed', { requestId, model, taskCount: input.tasks.length });
    return NextResponse.json(analysis, { headers: { 'X-Analysis-Cache': pending.source === 'cache' ? 'HIT' : 'MISS', 'X-Request-Id': requestId } });
  } catch (error) {
    const safe = publicError(error);
    console.error('Analysis failed', { requestId, code: error?.code || error?.name || 'UNKNOWN', status: error?.status || 500, message: error?.message });
    return NextResponse.json({ error: safe.message, code: safe.code, requestId }, { status: safe.code === 'PROVIDER_BUSY' ? 503 : 500 });
  }
}
