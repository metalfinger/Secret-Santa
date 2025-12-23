# Secret Santa (Office)

Simple office Secret Santa web app:

- PIN login (hardcoded list for now)
- Quick memory-match mini-game
- Score + leaderboard (saved in localStorage)
- Secret Santa reveal animation

## Run locally

- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Preview build: `npm run preview`

## Edit participants / PINs

Update the list in `src/data/participants.ts`.

## Remote leaderboard (optional)

Recommended setup: **Supabase + Netlify Functions**.

Why: the database secret stays server-side (Netlify env vars), and your frontend remains a static site.

### 1) Create Supabase table

In Supabase SQL editor:

```sql
create table if not exists public.scores (
	event_id text not null,
	participant_id text not null,
	name text not null,
	best_score integer not null,
	moves integer not null,
	seconds integer not null,
	updated_at timestamptz not null default now(),
	primary key (event_id, participant_id)
);

create index if not exists scores_event_best_idx
on public.scores (event_id, best_score desc);
```

### 2) Configure Netlify env vars

Set these **on Netlify** (Site settings → Environment variables):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `EVENT_ID` (optional; default is `vmt-secret-santa-2025`)

### 3) Enable remote leaderboard in the frontend

Set this in your local `.env` (and on Netlify if you want):

- `VITE_REMOTE_LEADERBOARD=1`

That’s it — the app will POST scores to `/.netlify/functions/leaderboard` and show the shared leaderboard.
