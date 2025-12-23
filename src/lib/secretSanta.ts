import type { Participant } from "../data/participants";

type Assignments = Record<string, string>;

const hashStringToSeed = (input: string) => {
	let h = 2166136261;
	for (let i = 0; i < input.length; i++) {
		h ^= input.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
};

const mulberry32 = (seed: number) => {
	return () => {
		let t = (seed += 0x6d2b79f5);
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

const shuffleInPlace = <T>(arr: T[], rand: () => number) => {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
};

// Produces a derangement (no one gets themselves) by shuffling recipients
// until there are no fixed points. For small office lists this is fast.
export const buildAssignments = (
	participants: Participant[],
	seed: string
): Assignments => {
	const ids = participants.map((p) => p.id);
	const rand = mulberry32(hashStringToSeed(seed));

	// If you ever go below 2 participants, assignment is impossible.
	if (ids.length < 2) {
		return Object.fromEntries(ids.map((id) => [id, id]));
	}

	const recipients = [...ids];
	for (let attempt = 0; attempt < 50; attempt++) {
		shuffleInPlace(recipients, rand);
		const ok = recipients.every((r, i) => r !== ids[i]);
		if (ok) {
			return Object.fromEntries(ids.map((id, i) => [id, recipients[i]]));
		}
	}

	// Fallback: rotate by 1 (guaranteed derangement when n>1)
	const rotated = [...ids.slice(1), ids[0]];
	return Object.fromEntries(ids.map((id, i) => [id, rotated[i]]));
};
