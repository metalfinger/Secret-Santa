export type Participant = {
	id: string;
	name: string;
	pin: string;
};

const makeId = (name: string) =>
	name
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "");

// NOTE: Update these PINs whenever you decide the real ones.
// For now they are deterministic and unique.
export const participants: Participant[] = [
	{ name: "Atharva", pin: "1001" },
	{ name: "Nakul", pin: "1002" },
	{ name: "Ashfaq", pin: "1003" },
	{ name: "Hrithik", pin: "1004" },
	{ name: "Keshav", pin: "1005" },
	{ name: "Kartik", pin: "1006" },
	{ name: "Bhuvan", pin: "1007" },
	{ name: "Hardik", pin: "1008" },
	{ name: "Ashwin", pin: "1009" },
	{ name: "Sanjeev", pin: "1010" },
	{ name: "Ankit", pin: "1011" },
	{ name: "Ajay", pin: "1012" },
	{ name: "Ansh", pin: "1013" },
	{ name: "Rajat", pin: "1014" },
	{ name: "Hiren", pin: "1015" },
	{ name: "Shaurya", pin: "1016" },
	{ name: "Gaurav", pin: "1017" },
	{ name: "Kishan", pin: "1018" },
	{ name: "Varun Raja", pin: "1019" },
	{ name: "Divin", pin: "1020" },
].map((p) => ({ ...p, id: makeId(p.name) }));

// Fixed Secret Santa pairing (code-only, deterministic).
// This maps each person to the next person in the list (last -> first).
// Change the list order above if you want to change the pairing.
export const fixedAssignments: Record<Participant["id"], Participant["id"]> =
	Object.fromEntries(
		participants.map((p, i) => [
			p.id,
			participants[(i + 1) % participants.length]!.id,
		])
	) as Record<Participant["id"], Participant["id"]>;
