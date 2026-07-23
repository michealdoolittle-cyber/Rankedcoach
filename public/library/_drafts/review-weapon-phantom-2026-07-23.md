# Library Draft Review — Weapon: Phantom — 2026-07-23

## Summary

One-time full-coverage baseline. 4 fields changed for Patch 13.01.

## Screenshot

![Before](./screenshots/phantom-before.png)
![After](./screenshots/phantom-after.png)

## Field-by-field changes

| Field | Tier | Before | After | Sources checked | Confidence |
| --- | --- | --- | --- | --- | --- |
| `image` | canonical | /assets/weapons/phantom.png | https://media.valorant-api.com/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a/displayicon.png | [https://valorant-api.com/v1/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a?language=en-US](https://valorant-api.com/v1/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a?language=en-US) | n/a (auto-approved) |
| `damageRanges` | canonical | [<br>  {<br>    "range": "0-20m",<br>    "head": 156,<br>    "body": 39,<br>    "legs": 33<br>  },<br>  {<br>    "range": "20-50m",<br>    "head": 140,<br>    "body": 35,<br>    "legs": 30<br>  }<br>] | [<br>  {<br>    "range": "0-20m",<br>    "head": 156,<br>    "body": 39,<br>    "legs": 33.15<br>  },<br>  {<br>    "range": "20-50m",<br>    "head": 140,<br>    "body": 35,<br>    "legs": 29.75<br>  }<br>] | [https://valorant-api.com/v1/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a?language=en-US](https://valorant-api.com/v1/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a?language=en-US) | n/a (auto-approved) |
| `uuid` | canonical |  | ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a | [https://valorant-api.com/v1/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a?language=en-US](https://valorant-api.com/v1/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a?language=en-US) | n/a (auto-approved) |
| `source` | canonical |  | https://valorant-api.com/v1/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a?language=en-US | [https://valorant-api.com/v1/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a?language=en-US](https://valorant-api.com/v1/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a?language=en-US) | n/a (auto-approved) |

## Approval

- [ ] Approved as-is
- [ ] Approved with edits (note edits below)
- [ ] Rejected (note why below)

Notes:

Promotion totals: 4 canonical, 0 synthesized, 0 mixed-tier field groups.
