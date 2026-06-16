# Supabase Persistence Setup

This app now treats localStorage as a local cache and Supabase as the signed-in account source of truth.

## 1. Create Tables

Open your Supabase project, go to SQL Editor, and run:

```sql
-- contents of supabase/schema.sql
```

The schema creates:

- `users_profiles`: active Riot profile/account metadata.
- `vip_app_state`: full app state for cross-device restore.
- `reflection_logs`: normalized long-term logging history for coaching/ML.
- `match_snapshots`: normalized imported/demo match history for coaching/ML.
- `bug_reports`: in-app bug reports with account/guest context for review in Supabase Table Editor.

Row-level security is enabled so users can only read and write their own records.

## 2. Confirm App Config

The app can use the hardcoded demo Supabase project, or you can override it before `app.js` loads:

```html
<script>
  window.VIP_SUPABASE_CONFIG = {
    url: "https://jqrsjaaxtdxfmpbtrupj.supabase.co",
    anonKey: "YOUR_SUPABASE_ANON_KEY"
  };
</script>
```

For local testing without editing HTML, set these in the browser console and refresh:

```js
localStorage.setItem("vip_supabase_url", "https://jqrsjaaxtdxfmpbtrupj.supabase.co");
localStorage.setItem("vip_supabase_anon_key", "YOUR_SUPABASE_ANON_KEY");
```

## 3. What Persists

After signup/login, the app saves:

- profiles and active profile
- Riot ID and region
- reflection logs
- imported/demo match snapshots
- Theme Builder state and UI state
- bug reports submitted through the header bug icon

Guest mode still works locally for the demo, but signed-in users sync to Supabase.

Bug reports can also be submitted by guests. If the `bug_reports` table has not been created yet, the browser keeps the report in localStorage and shows a setup hint.

## 4. Ask Coach AI Backend

Ask Coach uses a Supabase Edge Function so the browser never receives the OpenAI API key.

This repo is configured for the RankedCoach Supabase project in `supabase/config.toml`:

```bash
project ref: jqrsjaaxtdxfmpbtrupj
site url: https://rankedcoach.gg
```

Authenticate the Supabase CLI locally before deploying:

```bash
supabase login
```

Or use a one-time environment variable without committing it:

```bash
$env:SUPABASE_ACCESS_TOKEN="your-token"
```

Create the function secret:

```bash
supabase secrets set OPENAI_API_KEY=sk-your-openai-key --project-ref jqrsjaaxtdxfmpbtrupj
```

Optional model override:

```bash
supabase secrets set OPENAI_MODEL=gpt-5.5 --project-ref jqrsjaaxtdxfmpbtrupj
```

Deploy the function:

```bash
supabase functions deploy ask-coach --project-ref jqrsjaaxtdxfmpbtrupj --use-api
```

If the Supabase project is paused or the function is not deployed, the app falls back to the local rule-based Ask Coach responses.
