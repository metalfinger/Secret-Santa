export type TenorGif = {
	url: string;
	tinyUrl?: string;
	alt: string;
};

export const getTenorKey = (): string | undefined => {
	// Public client-side API key (safe to expose). If not provided, meme selection is disabled.
	return (import.meta as unknown as { env?: Record<string, string> }).env
		?.VITE_TENOR_KEY;
};

const cache = new Map<string, TenorGif[]>();
let inflight: Promise<void> | null = null;

export const searchTenorGifs = async (args: {
	query: string;
	limit?: number;
}): Promise<TenorGif[]> => {
	const key = getTenorKey();
	if (!key) return [];

	const query = args.query.trim();
	const limit = Math.max(1, Math.min(args.limit ?? 9, 24));
	const cacheKey = `${query}::${limit}`;
	const cached = cache.get(cacheKey);
	if (cached) return cached;

	// Avoid multiple simultaneous fetches for the same query burst.
	if (inflight) await inflight;

	const run = async () => {
		const url = new URL("https://tenor.googleapis.com/v2/search");
		url.searchParams.set("key", key);
		url.searchParams.set("client_key", "vmt-secret-santa");
		url.searchParams.set("q", query);
		url.searchParams.set("limit", String(limit));
		url.searchParams.set("contentfilter", "high");
		url.searchParams.set("media_filter", "tinygif,gif");

		const res = await fetch(url.toString());
		if (!res.ok) throw new Error(`Tenor search failed (${res.status})`);
		const json = (await res.json()) as {
			results?: Array<{
				content_description?: string;
				media_formats?: {
					tinygif?: { url?: string };
					gif?: { url?: string };
				};
			}>;
		};

		const gifs = (json.results ?? [])
			.map((r) => {
				const tinyUrl = r.media_formats?.tinygif?.url;
				const url = r.media_formats?.gif?.url ?? tinyUrl;
				if (!url) return null;
				return {
					url,
					tinyUrl,
					alt: r.content_description || "Meme GIF",
				} satisfies TenorGif;
			})
			.filter(Boolean) as TenorGif[];

		cache.set(cacheKey, gifs);
	};

	inflight = run().finally(() => {
		inflight = null;
	});
	await inflight;

	return cache.get(cacheKey) ?? [];
};
