export type RemoteLeaderboardRow = {
	participantId: string;
	name: string;
	bestScore: number;
	moves: number;
	seconds: number;
	updatedAt?: string;
};

const DEFAULT_EVENT_ID = "vmt-secret-santa-2025";

const endpoint = (eventId: string) =>
	`/.netlify/functions/leaderboard?eventId=${encodeURIComponent(eventId)}`;

export const fetchRemoteLeaderboard = async (
	eventId: string = DEFAULT_EVENT_ID
): Promise<RemoteLeaderboardRow[]> => {
	const res = await fetch(endpoint(eventId));
	if (!res.ok) throw new Error(`Leaderboard fetch failed (${res.status})`);
	const json = (await res.json()) as {
		leaderboard: Array<{
			participant_id: string;
			name: string;
			best_score: number;
			moves: number;
			seconds: number;
			updated_at?: string;
		}>;
	};

	return (json.leaderboard ?? []).map((r) => ({
		participantId: r.participant_id,
		name: r.name,
		bestScore: r.best_score,
		moves: r.moves,
		seconds: r.seconds,
		updatedAt: r.updated_at,
	}));
};

export const submitRemoteBestScore = async (args: {
	eventId?: string;
	participantId: string;
	name: string;
	bestScore: number;
	moves: number;
	seconds: number;
}) => {
	const res = await fetch(endpoint(args.eventId ?? DEFAULT_EVENT_ID), {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			participant_id: args.participantId,
			name: args.name,
			best_score: args.bestScore,
			moves: args.moves,
			seconds: args.seconds,
		}),
	});

	if (!res.ok) {
		throw new Error(`Leaderboard submit failed (${res.status})`);
	}
};

export const isRemoteLeaderboardEnabled = () => {
	// Keep it opt-in; if you don't set this env var, the app stays local-only.
	return import.meta.env.VITE_REMOTE_LEADERBOARD === "1";
};
