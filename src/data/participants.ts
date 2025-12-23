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

// NOTE: PINs are hardcoded (deterministic) so each person always has the same PIN.
// These are random-looking 4-digit values (not sequential) but still fixed in code.
export const participants: Participant[] = [
	{ name: "Atharva", pin: "7482" },
	{ name: "Nakul", pin: "1936" },
	{ name: "Ashfaq", pin: "5609" },
	{ name: "Hrithik", pin: "8274" },
	{ name: "Keshav", pin: "4168" },
	{ name: "Kartik", pin: "9051" },
	{ name: "Bhuvan", pin: "2793" },
	{ name: "Hardik", pin: "6385" },
	{ name: "Ashwin", pin: "7129" },
	{ name: "Sanjeev", pin: "3547" },
	{ name: "Ankit", pin: "9614" },
	{ name: "Ajay", pin: "4820" },
	{ name: "Ansh", pin: "1359" },
	{ name: "Rajat", pin: "8062" },
	{ name: "Hiren", pin: "2976" },
	{ name: "Shaurya", pin: "5741" },
	{ name: "Gaurav", pin: "2208" },
	{ name: "Kishan", pin: "6890" },
	{ name: "Varun Raja", pin: "9437" },
	{ name: "Divin", pin: "5173" },
	{ name: "Sagar", pin: "0000" },
].map((p) => ({ ...p, id: makeId(p.name) }));

// Fixed Secret Santa pairing (code-only, deterministic).
// Edit this mapping using NAMES only (more readable than relying on list order).
// Requirements:
// - Every name on the left must exist in participants.
// - Every name on the right must exist in participants.
// - Nobody should map to themselves.
// - Ideally each recipient is unique.
const fixedAssignmentsByName: Record<Participant["name"], Participant["name"]> =
	{
		Atharva: "Nakul",
		Nakul: "Ashfaq",
		Ashfaq: "Hrithik",
		Hrithik: "Keshav",
		Keshav: "Kartik",
		Kartik: "Bhuvan",
		Bhuvan: "Hardik",
		Hardik: "Ashwin",
		Ashwin: "Sanjeev",
		Sanjeev: "Ankit",
		Ankit: "Ajay",
		Ajay: "Ansh",
		Ansh: "Rajat",
		Rajat: "Hiren",
		Hiren: "Shaurya",
		Shaurya: "Gaurav",
		Gaurav: "Kishan",
		Kishan: "Varun Raja",
		"Varun Raja": "Divin",
		Divin: "Atharva",
		Sagar: "Sagar",
	};

const buildFixedAssignments = (): Record<
	Participant["id"],
	Participant["id"]
> => {
	const nameToId = new Map(participants.map((p) => [p.name, p.id] as const));
	const fromNames = Object.keys(
		fixedAssignmentsByName
	) as Participant["name"][];
	const toNames = Object.values(
		fixedAssignmentsByName
	) as Participant["name"][];

	for (const p of participants) {
		if (!(p.name in fixedAssignmentsByName)) {
			throw new Error(`Missing Secret Santa mapping for: ${p.name}`);
		}
	}

	for (const fromName of fromNames) {
		if (!nameToId.has(fromName)) {
			throw new Error(
				`Secret Santa mapping uses unknown giver name: ${fromName}`
			);
		}
		const toName = fixedAssignmentsByName[fromName];
		if (!nameToId.has(toName)) {
			throw new Error(
				`Secret Santa mapping for ${fromName} points to unknown name: ${toName}`
			);
		}
		if (fromName === toName) {
			throw new Error(
				`Secret Santa mapping cannot assign ${fromName} to themselves`
			);
		}
	}

	// Optional safety check: avoid duplicate recipients.
	const uniqueRecipients = new Set(toNames);
	if (uniqueRecipients.size !== participants.length) {
		throw new Error(
			"Secret Santa mapping must assign unique recipients (one-to-one)."
		);
	}

	return Object.fromEntries(
		participants.map((p) => {
			const toName = fixedAssignmentsByName[p.name];
			return [p.id, nameToId.get(toName)!];
		})
	) as Record<Participant["id"], Participant["id"]>;
};

export const fixedAssignments = buildFixedAssignments();
