# Library Draft Review — Weapon: Spectre — 2026-07-23

## Summary

One-time full-coverage baseline. 5 fields changed for Patch 13.01.

## Screenshot

![Before](./screenshots/spectre-before.png)
![After](./screenshots/spectre-after.png)

## Field-by-field changes

| Field | Tier | Before | After | Sources checked | Confidence |
| --- | --- | --- | --- | --- | --- |
| `image` | canonical | /assets/weapons/spectre.png | https://media.valorant-api.com/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7/displayicon.png | [https://valorant-api.com/v1/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7?language=en-US](https://valorant-api.com/v1/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7?language=en-US) | n/a (auto-approved) |
| `fireRate` | canonical | 13.33 rounds/sec | 13.333 rounds/sec | [https://valorant-api.com/v1/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7?language=en-US](https://valorant-api.com/v1/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7?language=en-US) | n/a (auto-approved) |
| `damageRanges` | canonical | [<br>  {<br>    "range": "0-15m",<br>    "head": 78,<br>    "body": 26,<br>    "legs": 22<br>  },<br>  {<br>    "range": "15-30m",<br>    "head": 66,<br>    "body": 22,<br>    "legs": 19<br>  },<br>  {<br>    "range": "30-50m",<br>    "head": 60,<br>    "body": 20,<br>    "legs": 17<br>  }<br>] | [<br>  {<br>    "range": "0-15m",<br>    "head": 78,<br>    "body": 26,<br>    "legs": 22.1<br>  },<br>  {<br>    "range": "15-30m",<br>    "head": 66,<br>    "body": 22,<br>    "legs": 18.7<br>  },<br>  {<br>    "range": "30-50m",<br>    "head": 60,<br>    "body": 20,<br>    "legs": 17<br>  }<br>] | [https://valorant-api.com/v1/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7?language=en-US](https://valorant-api.com/v1/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7?language=en-US) | n/a (auto-approved) |
| `uuid` | canonical |  | 462080d1-4035-2937-7c09-27aa2a5c27a7 | [https://valorant-api.com/v1/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7?language=en-US](https://valorant-api.com/v1/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7?language=en-US) | n/a (auto-approved) |
| `source` | canonical |  | https://valorant-api.com/v1/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7?language=en-US | [https://valorant-api.com/v1/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7?language=en-US](https://valorant-api.com/v1/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7?language=en-US) | n/a (auto-approved) |

## Approval

- [ ] Approved as-is
- [ ] Approved with edits (note edits below)
- [ ] Rejected (note why below)

Notes:

Promotion totals: 5 canonical, 0 synthesized, 0 mixed-tier field groups.
