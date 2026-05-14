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

Row-level security is enabled so users can only read and write their own records.

## 2. Confirm App Config

The app can use the hardcoded demo Supabase project, or you can override it before `app.js` loads:

```html
<script>
  window.VIP_SUPABASE_CONFIG = {
    url: "https://YOUR_PROJECT.supabase.co",
    anonKey: "YOUR_SUPABASE_ANON_KEY"
  };
</script>
```

For local testing without editing HTML, set these in the browser console and refresh:

```js
localStorage.setItem("vip_supabase_url", "https://YOUR_PROJECT.supabase.co");
localStorage.setItem("vip_supabase_anon_key", "YOUR_SUPABASE_ANON_KEY");
```

## 3. What Persists

After signup/login, the app saves:

- profiles and active profile
- Riot ID and region
- reflection logs
- imported/demo match snapshots
- Theme Builder state and UI state

Guest mode still works locally for the demo, but signed-in users sync to Supabase.
