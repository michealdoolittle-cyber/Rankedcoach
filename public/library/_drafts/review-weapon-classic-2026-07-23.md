# Library Draft Review — Weapon: Classic — 2026-07-23

## Summary

One-time full-coverage baseline. 4 fields changed for Patch 13.01.

## Screenshot

![Before](./screenshots/classic-before.png)
![After](./screenshots/classic-after.png)

## Field-by-field changes

| Field | Tier | Before | After | Sources checked | Confidence |
| --- | --- | --- | --- | --- | --- |
| `image` | canonical | /assets/weapons/classic.png | https://media.valorant-api.com/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8/displayicon.png | [https://valorant-api.com/v1/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8?language=en-US](https://valorant-api.com/v1/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8?language=en-US) | n/a (auto-approved) |
| `damageRanges` | canonical | [<br>  {<br>    "range": "0-30m",<br>    "head": 78,<br>    "body": 26,<br>    "legs": 22<br>  },<br>  {<br>    "range": "30-50m",<br>    "head": 66,<br>    "body": 22,<br>    "legs": 19<br>  }<br>] | [<br>  {<br>    "range": "0-30m",<br>    "head": 78,<br>    "body": 26,<br>    "legs": 22.1<br>  },<br>  {<br>    "range": "30-50m",<br>    "head": 66,<br>    "body": 22,<br>    "legs": 18.7<br>  }<br>] | [https://valorant-api.com/v1/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8?language=en-US](https://valorant-api.com/v1/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8?language=en-US) | n/a (auto-approved) |
| `uuid` | canonical |  | 29a0cfab-485b-f5d5-779a-b59f85e204a8 | [https://valorant-api.com/v1/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8?language=en-US](https://valorant-api.com/v1/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8?language=en-US) | n/a (auto-approved) |
| `source` | canonical |  | https://valorant-api.com/v1/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8?language=en-US | [https://valorant-api.com/v1/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8?language=en-US](https://valorant-api.com/v1/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8?language=en-US) | n/a (auto-approved) |

## Approval

- [ ] Approved as-is
- [ ] Approved with edits (note edits below)
- [ ] Rejected (note why below)

Notes:

Promotion totals: 4 canonical, 0 synthesized, 0 mixed-tier field groups.
