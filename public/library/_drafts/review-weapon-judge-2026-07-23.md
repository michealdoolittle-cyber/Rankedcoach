# Library Draft Review — Weapon: Judge — 2026-07-23

## Summary

One-time full-coverage baseline. 4 fields changed for Patch 13.01.

## Screenshot

![Before](./screenshots/judge-before.png)
![After](./screenshots/judge-after.png)

## Field-by-field changes

| Field | Tier | Before | After | Sources checked | Confidence |
| --- | --- | --- | --- | --- | --- |
| `image` | canonical | /assets/weapons/judge.png | https://media.valorant-api.com/weapons/ec845bf4-4f79-ddda-a3da-0db3774b2794/displayicon.png | [https://valorant-api.com/v1/weapons/ec845bf4-4f79-ddda-a3da-0db3774b2794?language=en-US](https://valorant-api.com/v1/weapons/ec845bf4-4f79-ddda-a3da-0db3774b2794?language=en-US) | n/a (auto-approved) |
| `damageRanges` | canonical | [<br>  {<br>    "range": "0-10m",<br>    "head": 34,<br>    "body": 17,<br>    "legs": 14<br>  },<br>  {<br>    "range": "10-15m",<br>    "head": 20,<br>    "body": 10,<br>    "legs": 9<br>  },<br>  {<br>    "range": "15-50m",<br>    "head": 14,<br>    "body": 7,<br>    "legs": 6<br>  }<br>] | [<br>  {<br>    "range": "0-10m",<br>    "head": 34,<br>    "body": 17,<br>    "legs": 14.45<br>  },<br>  {<br>    "range": "10-15m",<br>    "head": 20,<br>    "body": 10,<br>    "legs": 8.5<br>  },<br>  {<br>    "range": "15-50m",<br>    "head": 14,<br>    "body": 7,<br>    "legs": 5.95<br>  }<br>] | [https://valorant-api.com/v1/weapons/ec845bf4-4f79-ddda-a3da-0db3774b2794?language=en-US](https://valorant-api.com/v1/weapons/ec845bf4-4f79-ddda-a3da-0db3774b2794?language=en-US) | n/a (auto-approved) |
| `uuid` | canonical |  | ec845bf4-4f79-ddda-a3da-0db3774b2794 | [https://valorant-api.com/v1/weapons/ec845bf4-4f79-ddda-a3da-0db3774b2794?language=en-US](https://valorant-api.com/v1/weapons/ec845bf4-4f79-ddda-a3da-0db3774b2794?language=en-US) | n/a (auto-approved) |
| `source` | canonical |  | https://valorant-api.com/v1/weapons/ec845bf4-4f79-ddda-a3da-0db3774b2794?language=en-US | [https://valorant-api.com/v1/weapons/ec845bf4-4f79-ddda-a3da-0db3774b2794?language=en-US](https://valorant-api.com/v1/weapons/ec845bf4-4f79-ddda-a3da-0db3774b2794?language=en-US) | n/a (auto-approved) |

## Approval

- [ ] Approved as-is
- [ ] Approved with edits (note edits below)
- [ ] Rejected (note why below)

Notes:

Promotion totals: 4 canonical, 0 synthesized, 0 mixed-tier field groups.
