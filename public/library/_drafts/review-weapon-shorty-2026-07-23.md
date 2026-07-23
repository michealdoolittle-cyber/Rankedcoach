# Library Draft Review — Weapon: Shorty — 2026-07-23

## Summary

One-time full-coverage baseline. 4 fields changed for Patch 13.01.

## Screenshot

![Before](./screenshots/shorty-before.png)
![After](./screenshots/shorty-after.png)

## Field-by-field changes

| Field | Tier | Before | After | Sources checked | Confidence |
| --- | --- | --- | --- | --- | --- |
| `image` | canonical | /assets/weapons/shorty.png | https://media.valorant-api.com/weapons/42da8ccc-40d5-affc-beec-15aa47b42eda/displayicon.png | [https://valorant-api.com/v1/weapons/42da8ccc-40d5-affc-beec-15aa47b42eda?language=en-US](https://valorant-api.com/v1/weapons/42da8ccc-40d5-affc-beec-15aa47b42eda?language=en-US) | n/a (auto-approved) |
| `damageRanges` | canonical | [<br>  {<br>    "range": "0-7m",<br>    "head": 22,<br>    "body": 11,<br>    "legs": 9<br>  },<br>  {<br>    "range": "7-15m",<br>    "head": 12,<br>    "body": 6,<br>    "legs": 5<br>  },<br>  {<br>    "range": "15-50m",<br>    "head": 6,<br>    "body": 3,<br>    "legs": 3<br>  }<br>] | [<br>  {<br>    "range": "0-7m",<br>    "head": 22,<br>    "body": 11,<br>    "legs": 9.35<br>  },<br>  {<br>    "range": "7-15m",<br>    "head": 12,<br>    "body": 6,<br>    "legs": 5.1<br>  },<br>  {<br>    "range": "15-50m",<br>    "head": 6,<br>    "body": 3,<br>    "legs": 2.55<br>  }<br>] | [https://valorant-api.com/v1/weapons/42da8ccc-40d5-affc-beec-15aa47b42eda?language=en-US](https://valorant-api.com/v1/weapons/42da8ccc-40d5-affc-beec-15aa47b42eda?language=en-US) | n/a (auto-approved) |
| `uuid` | canonical |  | 42da8ccc-40d5-affc-beec-15aa47b42eda | [https://valorant-api.com/v1/weapons/42da8ccc-40d5-affc-beec-15aa47b42eda?language=en-US](https://valorant-api.com/v1/weapons/42da8ccc-40d5-affc-beec-15aa47b42eda?language=en-US) | n/a (auto-approved) |
| `source` | canonical |  | https://valorant-api.com/v1/weapons/42da8ccc-40d5-affc-beec-15aa47b42eda?language=en-US | [https://valorant-api.com/v1/weapons/42da8ccc-40d5-affc-beec-15aa47b42eda?language=en-US](https://valorant-api.com/v1/weapons/42da8ccc-40d5-affc-beec-15aa47b42eda?language=en-US) | n/a (auto-approved) |

## Approval

- [ ] Approved as-is
- [ ] Approved with edits (note edits below)
- [ ] Rejected (note why below)

Notes:

Promotion totals: 4 canonical, 0 synthesized, 0 mixed-tier field groups.
