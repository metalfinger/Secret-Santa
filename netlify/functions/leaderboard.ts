import { createClient } from "@supabase/supabase-js";

type ScoreRow = {
	event_id: string;
	participant_id: string;
	name: string;
	best_score: number;
	moves: number;
	seconds: number;
	meme_url?: string | null;
	meme_tiny_url?: string | null;
	updated_at?: string;
};

type Database = {
	public: {
		Tables: {
			scores: {
				Row: {
					event_id: string;
					participant_id: string;
					name: string;
					best_score: number;
					moves: number;
					seconds: number;
					meme_url: string | null;
					meme_tiny_url: string | null;
					updated_at: string;
				};
				Insert: {
					event_id: string;
					participant_id: string;
					name: string;
					best_score: number;
					moves: number;
					seconds: number;
					meme_url?: string | null;
					meme_tiny_url?: string | null;
					updated_at?: string;
				};
				Update: {
					name?: string;
					best_score?: number;
					moves?: number;
					seconds?: number;
					meme_url?: string | null;
					meme_tiny_url?: string | null;
					updated_at?: string;
				};
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
};

const json = (statusCode: number, body: unknown) => ({
	statusCode,
	headers: {
		"content-type": "application/json; charset=utf-8",
		// allow local dev origins (Netlify will override as needed)
		"access-control-allow-origin": "*",
	},
	body: JSON.stringify(body),
});

export const handler = async (event: {
	httpMethod: string;
	queryStringParameters?: Record<string, string>;
	body?: string;
}) => {
	if (event.httpMethod === "OPTIONS") {
		return {
			statusCode: 204,
			headers: {
				"access-control-allow-origin": "*",
				"access-control-allow-headers": "content-type",
				"access-control-allow-methods": "GET,POST,OPTIONS",
			},
			body: "",
		};
	}

	const supabaseUrl = process.env.SUPABASE_URL;
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !serviceKey) {
		return json(500, {
			error:
				"Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars on Netlify.",
		});
	}

	// Validate early so misconfigured env vars don't surface as a Netlify 502.
	try {
		const u = new URL(supabaseUrl);
		if (u.protocol !== "https:" && u.protocol !== "http:") {
			return json(500, {
				error: "Invalid SUPABASE_URL: must start with https:// or http://",
			});
		}
	} catch {
		return json(500, {
			error:
				"Invalid SUPABASE_URL: must be the Project URL like https://xxxx.supabase.co (not the dashboard URL).",
		});
	}

	let supabase: ReturnType<typeof createClient<Database>>;
	try {
		supabase = createClient<Database>(supabaseUrl, serviceKey);
	} catch (e) {
		return json(500, {
			error:
				e instanceof Error ? e.message : "Failed to initialize Supabase client",
		});
	}

	const eventId =
		event.queryStringParameters?.eventId ||
		process.env.EVENT_ID ||
		"vmt-secret-santa-2025";

	if (event.httpMethod === "GET") {
		const { data, error } = await supabase
			.from("scores")
			.select(
				"event_id,participant_id,name,best_score,moves,seconds,meme_url,meme_tiny_url,updated_at"
			)
			.eq("event_id", eventId)
			.order("best_score", { ascending: false })
			.order("updated_at", { ascending: true })
			.limit(50);

		if (error) return json(500, { error: error.message });
		return json(200, { eventId, leaderboard: data ?? [] });
	}

	if (event.httpMethod === "POST") {
		if (!event.body) return json(400, { error: "Missing JSON body" });

		let payload: unknown;
		try {
			payload = JSON.parse(event.body);
		} catch {
			return json(400, { error: "Invalid JSON body" });
		}

		const p = payload as Partial<ScoreRow>;
		if (!p.participant_id || !p.name)
			return json(400, { error: "participant_id and name are required" });
		if (
			typeof p.best_score !== "number" ||
			typeof p.moves !== "number" ||
			typeof p.seconds !== "number"
		) {
			return json(400, { error: "best_score, moves, seconds must be numbers" });
		}

		if (
			p.meme_url !== undefined &&
			p.meme_url !== null &&
			typeof p.meme_url !== "string"
		) {
			return json(400, { error: "meme_url must be a string" });
		}
		if (
			p.meme_tiny_url !== undefined &&
			p.meme_tiny_url !== null &&
			typeof p.meme_tiny_url !== "string"
		) {
			return json(400, { error: "meme_tiny_url must be a string" });
		}
		if (typeof p.meme_url === "string" && p.meme_url.length > 2000) {
			return json(400, { error: "meme_url too long" });
		}
		if (typeof p.meme_tiny_url === "string" && p.meme_tiny_url.length > 2000) {
			return json(400, { error: "meme_tiny_url too long" });
		}

		// Read existing best score (we keep best score, but allow updating meme anytime).
		const { data: existing, error: readErr } = await supabase
			.from("scores")
			.select("best_score")
			.eq("event_id", eventId)
			.eq("participant_id", p.participant_id)
			.maybeSingle();

		if (readErr) return json(500, { error: readErr.message });

		const now = new Date().toISOString();
		const hasMemeUpdate =
			p.meme_url !== undefined || p.meme_tiny_url !== undefined;

		if (
			existing?.best_score !== undefined &&
			existing.best_score !== null &&
			p.best_score <= existing.best_score
		) {
			if (!hasMemeUpdate) {
				return json(200, { ok: true, updatedScore: false, updatedMeme: false });
			}

			const updatePatch: Database["public"]["Tables"]["scores"]["Update"] = {
				name: p.name,
				updated_at: now,
			};
			if (p.meme_url !== undefined) updatePatch.meme_url = p.meme_url;
			if (p.meme_tiny_url !== undefined)
				updatePatch.meme_tiny_url = p.meme_tiny_url;

			const { error: updateErr } = await supabase
				.from("scores")
				.update(updatePatch)
				.eq("event_id", eventId)
				.eq("participant_id", p.participant_id);

			if (updateErr) {
				return json(500, {
					error: updateErr.message,
					hint: "If you just enabled memes, ensure your Supabase scores table has columns meme_url and meme_tiny_url.",
				});
			}

			return json(200, { ok: true, updatedScore: false, updatedMeme: true });
		}

		const row: Database["public"]["Tables"]["scores"]["Insert"] = {
			event_id: eventId,
			participant_id: p.participant_id,
			name: p.name,
			best_score: p.best_score,
			moves: p.moves,
			seconds: p.seconds,
			meme_url: p.meme_url ?? null,
			meme_tiny_url: p.meme_tiny_url ?? null,
			updated_at: now,
		};

		const { error: writeErr } = await supabase
			.from("scores")
			.upsert(row, { onConflict: "event_id,participant_id" });

		if (writeErr)
			return json(500, {
				error: writeErr.message,
				hint: "If you just enabled memes, ensure your Supabase scores table has columns meme_url and meme_tiny_url.",
			});

		return json(200, {
			ok: true,
			updatedScore: true,
			updatedMeme: hasMemeUpdate,
		});
	}

	return json(405, { error: "Method not allowed" });
};
