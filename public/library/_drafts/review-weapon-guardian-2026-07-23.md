# Library Draft Review — Weapon: Guardian — 2026-07-23

## Summary

One-time full-coverage baseline. 4 fields changed for Patch 13.01.

## Screenshot

![Before](./screenshots/guardian-before.png)
![After](./screenshots/guardian-after.png)

## Field-by-field changes

| Field | Tier | Before | After | Sources checked | Confidence |
| --- | --- | --- | --- | --- | --- |
| `image` | canonical | /assets/weapons/guardian.png | https://media.valorant-api.com/weapons/4ade7faa-4cf1-8376-95ef-39884480959b/displayicon.png | [https://valorant-api.com/v1/weapons/4ade7faa-4cf1-8376-95ef-39884480959b?language=en-US](https://valorant-api.com/v1/weapons/4ade7faa-4cf1-8376-95ef-39884480959b?language=en-US) | n/a (auto-approved) |
| `damageRanges` | canonical | [<br>  {<br>    "range": "0-50m",<br>    "head": 195,<br>    "body": 65,<br>    "legs": 49<br>  }<br>] | [<br>  {<br>    "range": "0-50m",<br>    "head": 195,<br>    "body": 65,<br>    "legs": 48.75<br>  }<br>] | [https://valorant-api.com/v1/weapons/4ade7faa-4cf1-8376-95ef-39884480959b?language=en-US](https://valorant-api.com/v1/weapons/4ade7faa-4cf1-8376-95ef-39884480959b?language=en-US) | n/a (auto-approved) |
| `uuid` | canonical |  | 4ade7faa-4cf1-8376-95ef-39884480959b | [https://valorant-api.com/v1/weapons/4ade7faa-4cf1-8376-95ef-39884480959b?language=en-US](https://valorant-api.com/v1/weapons/4ade7faa-4cf1-8376-95ef-39884480959b?language=en-US) | n/a (auto-approved) |
| `source` | canonical |  | https://valorant-api.com/v1/weapons/4ade7faa-4cf1-8376-95ef-39884480959b?language=en-US | [https://valorant-api.com/v1/weapons/4ade7faa-4cf1-8376-95ef-39884480959b?language=en-US](https://valorant-api.com/v1/weapons/4ade7faa-4cf1-8376-95ef-39884480959b?language=en-US) | n/a (auto-approved) |

## Approval

- [ ] Approved as-is
- [ ] Approved with edits (note edits below)
- [ ] Rejected (note why below)

Notes:

Promotion totals: 4 canonical, 0 synthesized, 0 mixed-tier field groups.
