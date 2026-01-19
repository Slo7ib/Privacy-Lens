export type AIErrorCode =
    | "NO_POLICY_TEXT"
    | "NETWORK_ERROR"
    | "RATE_LIMITED"
    | "WORKER_ERROR"
    | "OPENROUTER_ERROR"
    | "AI_INVALID_RESPONSE"
    | "JSON_PARSE_ERROR"
    | "UNKNOWN";

export interface AIError {
    code: AIErrorCode;
    message: string;
    details?: unknown;
}

export type AIWorkerResult =
    | { ok: true; content: string }
    | { ok: false; error: AIError };
