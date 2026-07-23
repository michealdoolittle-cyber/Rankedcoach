# Library Draft Review — Weapon: Marshal — 2026-07-23

## Summary

One-time full-coverage baseline. 4 fields changed for Patch 13.01.

## Screenshot

![Before](./screenshots/marshal-before.png)
![After](./screenshots/marshal-after.png)

## Field-by-field changes

| Field | Tier | Before | After | Sources checked | Confidence |
| --- | --- | --- | --- | --- | --- |
| `image` | canonical | /assets/weapons/marshal.png | https://media.valorant-api.com/weapons/c4883e50-4494-202c-3ec3-6b8a9284f00b/displayicon.png | [https://valorant-api.com/v1/weapons/c4883e50-4494-202c-3ec3-6b8a9284f00b?language=en-US](https://valorant-api.com/v1/weapons/c4883e50-4494-202c-3ec3-6b8a9284f00b?language=en-US) | n/a (auto-approved) |
| `damageRanges` | canonical | [<br>  {<br>    "range": "0-50m",<br>    "head": 202,<br>    "body": 101,<br>    "legs": 86<br>  }<br>] | [<br>  {<br>    "range": "0-50m",<br>    "head": 202,<br>    "body": 101,<br>    "legs": 85.85<br>  }<br>] | [https://valorant-api.com/v1/weapons/c4883e50-4494-202c-3ec3-6b8a9284f00b?language=en-US](https://valorant-api.com/v1/weapons/c4883e50-4494-202c-3ec3-6b8a9284f00b?language=en-US) | n/a (auto-approved) |
| `uuid` | canonical |  | c4883e50-4494-202c-3ec3-6b8a9284f00b | [https://valorant-api.com/v1/weapons/c4883e50-4494-202c-3ec3-6b8a9284f00b?language=en-US](https://valorant-api.com/v1/weapons/c4883e50-4494-202c-3ec3-6b8a9284f00b?language=en-US) | n/a (auto-approved) |
| `source` | canonical |  | https://valorant-api.com/v1/weapons/c4883e50-4494-202c-3ec3-6b8a9284f00b?language=en-US | [https://valorant-api.com/v1/weapons/c4883e50-4494-202c-3ec3-6b8a9284f00b?language=en-US](https://valorant-api.com/v1/weapons/c4883e50-4494-202c-3ec3-6b8a9284f00b?language=en-US) | n/a (auto-approved) |

## Approval

- [ ] Approved as-is
- [ ] Approved with edits (note edits below)
- [ ] Rejected (note why below)

Notes:

Promotion totals: 4 canonical, 0 synthesized, 0 mixed-tier field groups.
