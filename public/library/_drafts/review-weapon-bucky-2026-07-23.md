# Library Draft Review — Weapon: Bucky — 2026-07-23

## Summary

One-time full-coverage baseline. 4 fields changed for Patch 13.01.

## Screenshot

![Before](./screenshots/bucky-before.png)
![After](./screenshots/bucky-after.png)

## Field-by-field changes

| Field | Tier | Before | After | Sources checked | Confidence |
| --- | --- | --- | --- | --- | --- |
| `image` | canonical | /assets/weapons/bucky.png | https://media.valorant-api.com/weapons/910be174-449b-c412-ab22-d0873436b21b/displayicon.png | [https://valorant-api.com/v1/weapons/910be174-449b-c412-ab22-d0873436b21b?language=en-US](https://valorant-api.com/v1/weapons/910be174-449b-c412-ab22-d0873436b21b?language=en-US) | n/a (auto-approved) |
| `damageRanges` | canonical | [<br>  {<br>    "range": "0-8m",<br>    "head": 34,<br>    "body": 17,<br>    "legs": 14<br>  },<br>  {<br>    "range": "8-12m",<br>    "head": 26,<br>    "body": 13,<br>    "legs": 11<br>  },<br>  {<br>    "range": "12-50m",<br>    "head": 18,<br>    "body": 9,<br>    "legs": 8<br>  }<br>] | [<br>  {<br>    "range": "0-8m",<br>    "head": 34,<br>    "body": 17,<br>    "legs": 14<br>  },<br>  {<br>    "range": "8-12m",<br>    "head": 26,<br>    "body": 13,<br>    "legs": 11.05<br>  },<br>  {<br>    "range": "12-50m",<br>    "head": 18,<br>    "body": 9,<br>    "legs": 7.65<br>  }<br>] | [https://valorant-api.com/v1/weapons/910be174-449b-c412-ab22-d0873436b21b?language=en-US](https://valorant-api.com/v1/weapons/910be174-449b-c412-ab22-d0873436b21b?language=en-US) | n/a (auto-approved) |
| `uuid` | canonical |  | 910be174-449b-c412-ab22-d0873436b21b | [https://valorant-api.com/v1/weapons/910be174-449b-c412-ab22-d0873436b21b?language=en-US](https://valorant-api.com/v1/weapons/910be174-449b-c412-ab22-d0873436b21b?language=en-US) | n/a (auto-approved) |
| `source` | canonical |  | https://valorant-api.com/v1/weapons/910be174-449b-c412-ab22-d0873436b21b?language=en-US | [https://valorant-api.com/v1/weapons/910be174-449b-c412-ab22-d0873436b21b?language=en-US](https://valorant-api.com/v1/weapons/910be174-449b-c412-ab22-d0873436b21b?language=en-US) | n/a (auto-approved) |

## Approval

- [ ] Approved as-is
- [ ] Approved with edits (note edits below)
- [ ] Rejected (note why below)

Notes:

Promotion totals: 4 canonical, 0 synthesized, 0 mixed-tier field groups.
