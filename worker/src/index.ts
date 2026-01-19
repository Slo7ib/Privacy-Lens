export interface Env {
	USAGE_TRACKER: KVNamespace;
	API_KEY: string;
	EXTENSION_ID: string;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const requestId = crypto.randomUUID();
		const allowedOrigin = `chrome-extension://${env.EXTENSION_ID}`;
		const origin = request.headers.get("Origin");

		const corsHeaders = {
			"Access-Control-Allow-Origin": allowedOrigin,
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		};

		// Helper for JSON responses (success or error)
		const jsonResponse = (body: any, status = 200) => {
			return new Response(JSON.stringify({ ...body, requestId }), {
				status,
				headers: {
					"Content-Type": "application/json",
					...corsHeaders
				}
			});
		};

		// Helper for structured errors
		const errorResponse = (code: string, message: string, status: number) => {
			return jsonResponse({
				error: {
					code,
					message
				}
			}, status);
		};

		// Strict CORS check
		if (origin !== allowedOrigin) {
			// We can't use errorResponse here efficiently because we might want to deny even the CORS headers 
			// if we were super strict, but to return JSON we need headers? 
			// Actually, standard practice for 403 Forbidden Origin is just to return it.
			// However, requirement says "Invalid origin -> FORBIDDEN_ORIGIN".
			// If we return 403, we should probably still include CORS headers so the extension can read the body?
			// But if origin is wrong, the browser might block it anyway.
			// Let's return the JSON with CORS headers for consistency, assuming the browser allows it if the server explicitly allows the claimed origin (which we don't here, we only allow allowedOrigin).
			// If origin is mismatch, Access-Control-Allow-Origin: allowedOrigin will cause the browser to block the response reading script-side anyway.
			// But the requirements say "Refactor the worker so that all errors return JSON... Invalid origin -> FORBIDDEN_ORIGIN".
			// I'll return the JSON.
			return new Response(JSON.stringify({
				error: { code: "FORBIDDEN_ORIGIN", message: "Invalid origin" },
				requestId
			}), {
				status: 403,
				headers: { "Content-Type": "application/json" } // No CORS headers if origin is wrong, or maybe? 
				// If I don't send CORS headers, the extension can't read the JSON.
				// But I can't send Access-Control-Allow-Origin: <wrong-origin>.
				// I'll verify what the previous code did: line 14: return new Response("Forbidden", { status: 403 });
				// It returned plain text without CORS headers.
				// I will do the same but with JSON.
			});
		}

		// Handle CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, {
				headers: corsHeaders,
			});
		}

		if (request.method !== "POST") {
			return errorResponse("METHOD_NOT_ALLOWED", "Method not allowed", 405);
		}

		let body: any;
		try {
			body = await request.json();
		} catch {
			return errorResponse("INVALID_JSON", "Invalid JSON body", 400);
		}

		const { userId, type, prompt } = body;
		if (!userId || !type || !prompt) {
			return errorResponse("MISSING_FIELDS", "Missing required fields (userId, type, prompt)", 400);
		}

		// Rate limiting
		const today = new Date().toISOString().slice(0, 10);
		const kvKey = `usage:${userId}:${today}`;
		const currentUsage = Number(await env.USAGE_TRACKER.get(kvKey)) || 0;
		const LIMIT = 10;

		if (currentUsage >= LIMIT) {
			return errorResponse("RATE_LIMITED", "Daily limit reached", 429);
		}

		// Call OpenRouter
		try {
			const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${env.API_KEY}`,
					"Content-Type": "application/json",
					"HTTP-Referer": "https://privacylens.app",
					"X-Title": "Privacy Lens",
				},
				body: JSON.stringify({
					model: "google/gemini-2.5-flash-lite",
					messages: [{ role: "user", content: prompt }],
				}),
			});

			if (!aiResponse.ok) {
				const errorText = await aiResponse.text();
				console.error(`[Worker] OpenRouter Error (${requestId}):`, errorText);
				return errorResponse("OPENROUTER_ERROR", `OpenRouter failed: ${aiResponse.status}`, 502);
			}

			const aiData: any = await aiResponse.json();
			const content = aiData?.choices?.[0]?.message?.content;

			if (!content) {
				console.error(`[Worker] AI failed to return content (${requestId})`, aiData);
				return errorResponse("AI_FAILED", "AI response missing content", 500);
			}

			// Update KV
			await env.USAGE_TRACKER.put(kvKey, String(currentUsage + 1), { expirationTtl: 86400 });

			return jsonResponse({ content });

		} catch (err: any) {
			console.error(`[Worker] Unexpected error (${requestId}):`, err);
			return errorResponse("WORKER_ERROR", `Internal Error: ${err.message}`, 500);
		}
	},
};