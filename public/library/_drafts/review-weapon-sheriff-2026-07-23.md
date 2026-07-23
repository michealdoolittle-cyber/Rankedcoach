# Library Draft Review — Weapon: Sheriff — 2026-07-23

## Summary

One-time full-coverage baseline. 4 fields changed for Patch 13.01.

## Screenshot

![Before](./screenshots/sheriff-before.png)
![After](./screenshots/sheriff-after.png)

## Field-by-field changes

| Field | Tier | Before | After | Sources checked | Confidence |
| --- | --- | --- | --- | --- | --- |
| `image` | canonical | /assets/weapons/sheriff.png | https://media.valorant-api.com/weapons/e336c6b8-418d-9340-d77f-7a9e4cfe0702/displayicon.png | [https://valorant-api.com/v1/weapons/e336c6b8-418d-9340-d77f-7a9e4cfe0702?language=en-US](https://valorant-api.com/v1/weapons/e336c6b8-418d-9340-d77f-7a9e4cfe0702?language=en-US) | n/a (auto-approved) |
| `damageRanges` | canonical | [<br>  {<br>    "range": "0-30m",<br>    "head": 160,<br>    "body": 55,<br>    "legs": 47<br>  },<br>  {<br>    "range": "30-50m",<br>    "head": 145,<br>    "body": 50,<br>    "legs": 43<br>  }<br>] | [<br>  {<br>    "range": "0-30m",<br>    "head": 159.5,<br>    "body": 55,<br>    "legs": 46.75<br>  },<br>  {<br>    "range": "30-50m",<br>    "head": 145,<br>    "body": 50,<br>    "legs": 42.5<br>  }<br>] | [https://valorant-api.com/v1/weapons/e336c6b8-418d-9340-d77f-7a9e4cfe0702?language=en-US](https://valorant-api.com/v1/weapons/e336c6b8-418d-9340-d77f-7a9e4cfe0702?language=en-US) | n/a (auto-approved) |
| `uuid` | canonical |  | e336c6b8-418d-9340-d77f-7a9e4cfe0702 | [https://valorant-api.com/v1/weapons/e336c6b8-418d-9340-d77f-7a9e4cfe0702?language=en-US](https://valorant-api.com/v1/weapons/e336c6b8-418d-9340-d77f-7a9e4cfe0702?language=en-US) | n/a (auto-approved) |
| `source` | canonical |  | https://valorant-api.com/v1/weapons/e336c6b8-418d-9340-d77f-7a9e4cfe0702?language=en-US | [https://valorant-api.com/v1/weapons/e336c6b8-418d-9340-d77f-7a9e4cfe0702?language=en-US](https://valorant-api.com/v1/weapons/e336c6b8-418d-9340-d77f-7a9e4cfe0702?language=en-US) | n/a (auto-approved) |

## Approval

- [ ] Approved as-is
- [ ] Approved with edits (note edits below)
- [ ] Rejected (note why below)

Notes:

Promotion totals: 4 canonical, 0 synthesized, 0 mixed-tier field groups.
