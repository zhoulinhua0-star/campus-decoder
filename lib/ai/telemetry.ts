export type AiOperation = "context" | "practice" | "feedback";

export type AiFailureReason =
  | "timeout"
  | "authentication"
  | "rate_limit"
  | "upstream_error"
  | "empty_response"
  | "truncated"
  | "invalid_json"
  | "invalid_schema"
  | "invalid_language"
  | "grounding_failed"
  | "unknown";

export class AiProviderFailure extends Error {
  constructor(readonly reason: AiFailureReason, readonly detail?: string) {
    super(`AI provider failure: ${reason}${detail ? ` (${detail})` : ""}`);
    this.name = "AiProviderFailure";
  }
}

export function classifyAiFailure(error: unknown): AiFailureReason {
  if (error instanceof AiProviderFailure) return error.reason;

  const candidate = error as { name?: unknown; status?: unknown } | null;
  const name = typeof candidate?.name === "string" ? candidate.name : "";
  const status = typeof candidate?.status === "number" ? candidate.status : null;

  if (name.includes("Timeout") || name === "AbortError") return "timeout";
  if (status === 401 || status === 403) return "authentication";
  if (status === 429) return "rate_limit";
  if (status !== null && status >= 500) return "upstream_error";
  if (name === "APIConnectionError") return "upstream_error";
  return "unknown";
}

export function logAiFallback({
  operation,
  model,
  error,
  elapsedMs,
}: {
  operation: AiOperation;
  model: string;
  error: unknown;
  elapsedMs: number;
}) {
  console.warn(JSON.stringify({
    event: "ai_fallback",
    operation,
    provider: "kimi",
    model,
    reason: classifyAiFailure(error),
    ...(error instanceof AiProviderFailure && error.detail ? { detail: error.detail } : {}),
    elapsedMs: Math.max(0, Math.round(elapsedMs)),
  }));
}

export function logAiRetry({ operation, model, error }: { operation: AiOperation; model: string; error: unknown }) {
  console.warn(JSON.stringify({
    event: "ai_retry",
    operation,
    provider: "kimi",
    model,
    reason: classifyAiFailure(error),
    ...(error instanceof AiProviderFailure && error.detail ? { detail: error.detail } : {}),
  }));
}
