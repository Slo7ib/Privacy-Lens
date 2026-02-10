export interface Env {
	USAGE_TRACKER: KVNamespace;
	API_KEY: string;
	EXTENSION_ID: string;
	LEMON_SQUEEZY_API_KEY: string;
	varient_Id: string;
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
			return new Response(JSON.stringify({
				error: { code: "FORBIDDEN_ORIGIN", message: "Invalid origin" },
				requestId
			}), {
				status: 403,
				headers: { "Content-Type": "application/json" }
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

		const url = new URL(request.url);
		const path = url.pathname;

		// --- LICENSE VALIDATION ENDPOINTS ---

		if (path === "/validate-license" || path === "/check-license") {
			const { licenseKey } = body;
			if (!licenseKey) {
				return errorResponse("MISSING_LICENSE", "License key is required", 400);
			}

			try {
				const lsResponse = await fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
					method: "POST",
					headers: {
						"Authorization": `Bearer ${env.LEMON_SQUEEZY_API_KEY}`,
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						license_key: licenseKey,
						variant_id: Number(env.varient_Id) // Using explicit variable name as requested
					})
				});

				if (!lsResponse.ok) {
					const errorText = await lsResponse.text();
					console.error(`[Worker] Lemon Squeezy Error (${requestId}):`, errorText);
					return errorResponse("LICENSE_VALIDATION_FAILED", "Failed to validate license with provider", 502);
				}

				const lsData: any = await lsResponse.json();

				// Check if license is valid
				// Lemon Squeezy returns { valid: true, ... } or { valid: false, ... }
				// We also check status just in case
				const isValid = lsData.valid === true;

				// Return sanitized response
				return jsonResponse({
					valid: isValid,
					// Optionally return meta if needed, but keeping it minimal for now
					// status: lsData.license_key?.status  
				});

			} catch (err: any) {
				console.error(`[Worker] License check error (${requestId}):`, err);
				return errorResponse("WORKER_ERROR", `Internal Error: ${err.message}`, 500);
			}
		}

		// --- AI ENDPOINTS ---

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