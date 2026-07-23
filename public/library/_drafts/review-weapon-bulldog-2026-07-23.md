# Library Draft Review — Weapon: Bulldog — 2026-07-23

## Summary

One-time full-coverage baseline. 4 fields changed for Patch 13.01.

## Screenshot

![Before](./screenshots/bulldog-before.png)
![After](./screenshots/bulldog-after.png)

## Field-by-field changes

| Field | Tier | Before | After | Sources checked | Confidence |
| --- | --- | --- | --- | --- | --- |
| `image` | canonical | /assets/weapons/bulldog.png | https://media.valorant-api.com/weapons/ae3de142-4d85-2547-dd26-4e90bed35cf7/displayicon.png | [https://valorant-api.com/v1/weapons/ae3de142-4d85-2547-dd26-4e90bed35cf7?language=en-US](https://valorant-api.com/v1/weapons/ae3de142-4d85-2547-dd26-4e90bed35cf7?language=en-US) | n/a (auto-approved) |
| `damageRanges` | canonical | [<br>  {<br>    "range": "0-50m",<br>    "head": 116,<br>    "body": 35,<br>    "legs": 30<br>  }<br>] | [<br>  {<br>    "range": "0-50m",<br>    "head": 115.5,<br>    "body": 35,<br>    "legs": 29.75<br>  }<br>] | [https://valorant-api.com/v1/weapons/ae3de142-4d85-2547-dd26-4e90bed35cf7?language=en-US](https://valorant-api.com/v1/weapons/ae3de142-4d85-2547-dd26-4e90bed35cf7?language=en-US) | n/a (auto-approved) |
| `uuid` | canonical |  | ae3de142-4d85-2547-dd26-4e90bed35cf7 | [https://valorant-api.com/v1/weapons/ae3de142-4d85-2547-dd26-4e90bed35cf7?language=en-US](https://valorant-api.com/v1/weapons/ae3de142-4d85-2547-dd26-4e90bed35cf7?language=en-US) | n/a (auto-approved) |
| `source` | canonical |  | https://valorant-api.com/v1/weapons/ae3de142-4d85-2547-dd26-4e90bed35cf7?language=en-US | [https://valorant-api.com/v1/weapons/ae3de142-4d85-2547-dd26-4e90bed35cf7?language=en-US](https://valorant-api.com/v1/weapons/ae3de142-4d85-2547-dd26-4e90bed35cf7?language=en-US) | n/a (auto-approved) |

## Approval

- [ ] Approved as-is
- [ ] Approved with edits (note edits below)
- [ ] Rejected (note why below)

Notes:

Promotion totals: 4 canonical, 0 synthesized, 0 mixed-tier field groups.
