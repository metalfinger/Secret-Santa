import type { GameResult } from "../screens/ResultsScreen";

type BestScore = {
	score: number;
	moves: number;
	seconds: number;
	at: string;
};

type BestScoreMap = Record<string, BestScore>;

const KEY = "ss.bestScores.v1";

const readJson = <T>(key: string, fallback: T): T => {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
};

const writeJson = (key: string, value: unknown) => {
	localStorage.setItem(key, JSON.stringify(value));
};

export const getBestScores = (): BestScoreMap =>
	readJson<BestScoreMap>(KEY, {});

export const setBestScore = (participantId: string, result: GameResult) => {
	const current = getBestScores();
	const prev = current[participantId];

	if (!prev || result.score > prev.score) {
		current[participantId] = {
			score: result.score,
			moves: result.moves,
			seconds: result.seconds,
			at: new Date().toISOString(),
		};
		writeJson(KEY, current);
	}
};

export const clearBestScores = () => {
	localStorage.removeItem(KEY);
};
