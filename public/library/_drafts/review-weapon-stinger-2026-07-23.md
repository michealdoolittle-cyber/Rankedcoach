# Library Draft Review — Weapon: Stinger — 2026-07-23

## Summary

One-time full-coverage baseline. 4 fields changed for Patch 13.01.

## Screenshot

![Before](./screenshots/stinger-before.png)
![After](./screenshots/stinger-after.png)

## Field-by-field changes

| Field | Tier | Before | After | Sources checked | Confidence |
| --- | --- | --- | --- | --- | --- |
| `image` | canonical | /assets/weapons/stinger.png | https://media.valorant-api.com/weapons/f7e1b454-4ad4-1063-ec0a-159e56b58941/displayicon.png | [https://valorant-api.com/v1/weapons/f7e1b454-4ad4-1063-ec0a-159e56b58941?language=en-US](https://valorant-api.com/v1/weapons/f7e1b454-4ad4-1063-ec0a-159e56b58941?language=en-US) | n/a (auto-approved) |
| `damageRanges` | canonical | [<br>  {<br>    "range": "0-15m",<br>    "head": 68,<br>    "body": 27,<br>    "legs": 23<br>  },<br>  {<br>    "range": "15-50m",<br>    "head": 57,<br>    "body": 23,<br>    "legs": 19<br>  }<br>] | [<br>  {<br>    "range": "0-15m",<br>    "head": 67.5,<br>    "body": 27,<br>    "legs": 22.95<br>  },<br>  {<br>    "range": "15-50m",<br>    "head": 57,<br>    "body": 23,<br>    "legs": 19<br>  }<br>] | [https://valorant-api.com/v1/weapons/f7e1b454-4ad4-1063-ec0a-159e56b58941?language=en-US](https://valorant-api.com/v1/weapons/f7e1b454-4ad4-1063-ec0a-159e56b58941?language=en-US) | n/a (auto-approved) |
| `uuid` | canonical |  | f7e1b454-4ad4-1063-ec0a-159e56b58941 | [https://valorant-api.com/v1/weapons/f7e1b454-4ad4-1063-ec0a-159e56b58941?language=en-US](https://valorant-api.com/v1/weapons/f7e1b454-4ad4-1063-ec0a-159e56b58941?language=en-US) | n/a (auto-approved) |
| `source` | canonical |  | https://valorant-api.com/v1/weapons/f7e1b454-4ad4-1063-ec0a-159e56b58941?language=en-US | [https://valorant-api.com/v1/weapons/f7e1b454-4ad4-1063-ec0a-159e56b58941?language=en-US](https://valorant-api.com/v1/weapons/f7e1b454-4ad4-1063-ec0a-159e56b58941?language=en-US) | n/a (auto-approved) |

## Approval

- [ ] Approved as-is
- [ ] Approved with edits (note edits below)
- [ ] Rejected (note why below)

Notes:

Promotion totals: 4 canonical, 0 synthesized, 0 mixed-tier field groups.
