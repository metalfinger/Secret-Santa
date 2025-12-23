import { useEffect, useState } from "react";

export type LeaderboardMeme = {
	src: string;
	alt: string;
};

const fallbackForRank = (rank: number): LeaderboardMeme | null => {
	if (rank === 1) return { src: "/memes/top1.svg", alt: "Top 1 victory meme" };
	if (rank === 2) return { src: "/memes/top2.svg", alt: "Top 2 meme" };
	return null;
};

type RankMemes = Record<number, LeaderboardMeme>;

let cachedRankMemes: RankMemes | null = null;
let inflight: Promise<RankMemes> | null = null;

const getTenorKey = () => {
	// Public client-side API key (safe to expose). If not provided, we fall back.
	return (import.meta as unknown as { env?: Record<string, string> }).env
		?.VITE_TENOR_KEY;
};

const fetchTenorFeatured = async (): Promise<RankMemes> => {
	const key = getTenorKey();
	if (!key) {
		return {
			1: fallbackForRank(1)!,
			2: fallbackForRank(2)!,
		};
	}

	const url = new URL("https://tenor.googleapis.com/v2/featured");
	url.searchParams.set("key", key);
	url.searchParams.set("client_key", "vmt-secret-santa");
	url.searchParams.set("limit", "12");
	url.searchParams.set("contentfilter", "high");
	url.searchParams.set("media_filter", "tinygif,gif");

	const res = await fetch(url.toString());
	if (!res.ok) throw new Error(`Tenor fetch failed (${res.status})`);
	const json = (await res.json()) as {
		results?: Array<{
			content_description?: string;
			media_formats?: {
				tinygif?: { url?: string };
				gif?: { url?: string };
			};
		}>;
	};

	const picks = (json.results ?? [])
		.map((r) => {
			const src = r.media_formats?.tinygif?.url ?? r.media_formats?.gif?.url;
			if (!src) return null;
			return {
				src,
				alt: r.content_description || "Meme GIF",
			} satisfies LeaderboardMeme;
		})
		.filter(Boolean) as LeaderboardMeme[];

	return {
		1: picks[0] ?? fallbackForRank(1)!,
		2: picks[1] ?? fallbackForRank(2)!,
	};
};

export const useRankMemes = (): RankMemes => {
	const [memes, setMemes] = useState<RankMemes>(
		() =>
			cachedRankMemes ?? {
				1: fallbackForRank(1)!,
				2: fallbackForRank(2)!,
			}
	);

	useEffect(() => {
		let cancelled = false;
		if (cachedRankMemes) {
			setMemes(cachedRankMemes);
			return;
		}
		inflight ??= fetchTenorFeatured();
		inflight
			.then((m) => {
				cachedRankMemes = m;
				if (!cancelled) setMemes(m);
			})
			.catch(() => {
				const fallback: RankMemes = {
					1: fallbackForRank(1)!,
					2: fallbackForRank(2)!,
				};
				cachedRankMemes = fallback;
				if (!cancelled) setMemes(fallback);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	return memes;
};

export const memeForRank = (rank: number): LeaderboardMeme | null => {
	return fallbackForRank(rank);
};
