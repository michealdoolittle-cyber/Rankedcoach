# Riot Sync Scaffolding

## 2026-07-05 22:53 -04:00

### Added files
- integrations/riotSync/index.js for Node/review-side scaffold.
- public/integrations/riot-sync.js for the current browser app.

### Feature flag state
- RIOT_SYNC_FEATURE_FLAG = false in both modules.
- Browser activation also requires window.RANKEDCOACH_FEATURES.riotSync === true, so it is doubly gated.
- No environment enables this yet.

### RSO auth path scaffold
- createRsoAuthorizationUrl() can build a Riot RSO authorization URL only when the flag is enabled.
- With the flag off it returns { enabled: false, reason: "riot_sync_feature_flag_off" }.

### Data-pull path scaffold
- pullMatches() / pullRiotMatches() are stubbed to return disabled status and no records.
- No live Riot data pull is executed from this scaffold.

### Schema mapping
- mapRiotMatch() / mapRiotMatchToCanonicalRecord() map future Riot match payloads through RankedCoachMatchRecord.fromRiotMatch().
- No Riot-specific parallel schema was added.
