export interface Env {
	USAGE_TRACKER: KVNamespace;
	API_KEY: string;
  }
  
  export default {
	async fetch(request: Request, env: Env): Promise<Response> {
	  // Handle CORS (Crucial for Chrome Extensions)
	  if (request.method === "OPTIONS") {
		return new Response(null, {
		  headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		  },
		});
	  }
  
	  if (request.method !== "POST") {
		return new Response("Method Not Allowed", { status: 405 });
	  }
  
	  let body: any;
	  try {
		body = await request.json();
	  } catch {
		return new Response("Invalid JSON", { status: 400 });
	  }
  
	  const { userId, type, prompt } = body;
	  if (!userId || !type || !prompt) {
		return new Response("Missing fields", { status: 400 });
	  }
  
	  // Rate limiting
	  const today = new Date().toISOString().slice(0, 10);
	  const kvKey = `usage:${userId}:${today}`;
	  const currentUsage = Number(await env.USAGE_TRACKER.get(kvKey)) || 0;
	  const LIMIT = 10;
  
	  if (currentUsage >= LIMIT) {
		return new Response(JSON.stringify({ error: "Daily limit reached" }), {
		  status: 429,
		  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
		});
	  }
  
	  // Call OpenRouter
	  const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
		method: "POST",
		headers: {
		  "Authorization": `Bearer ${env.API_KEY}`,
		  "Content-Type": "application/json",
		  "HTTP-Referer": "https://privacylens.app",
		  "X-Title": "Privacy Lens",
		},
		body: JSON.stringify({
		  model: "mistralai/mistral-nemo",
		  messages: [{ role: "user", content: prompt }],
		}),
	  });
  
	  const aiData: any = await aiResponse.json();
	  const content = aiData?.choices?.[0]?.message?.content;
  
	  if (!content) return new Response("AI failed", { status: 500 });
  
	  // Update KV
	  await env.USAGE_TRACKER.put(kvKey, String(currentUsage + 1), { expirationTtl: 86400 });
  
	  return new Response(JSON.stringify({ content }), {
		headers: { 
		  "Content-Type": "application/json",
		  "Access-Control-Allow-Origin": "*" 
		},
	  });
	},
  };