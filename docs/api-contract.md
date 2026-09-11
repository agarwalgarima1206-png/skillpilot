# SkillPilot API Contract

The frontend talks only to these FastAPI endpoints.

## GET /roles

Returns the three supported roles.

## GET /roles/{role_id}

Returns role metadata, O*NET identifiers/evidence, responsibilities, and SkillPilot depth classifications.

## POST /chat/start

Request:

```json
{"role_id":"data-scientist"}
```

Response includes a generated `session_id`, the first role-specific question, and quick replies.

## POST /chat/reply

Request:

```json
{"session_id":"...","answer":"I build projects from scratch"}
```

Response returns the next question and quick replies. On the final answer it returns `done: true` and the frontend redirects to `/skill-gap`.

## GET /skill-gap/{session_id}

Returns the calibrated score, summary counts, every skill's current level, target level, depth call, gap, and biggest learning lever.

## GET /roadmap/{session_id}

Returns three phases, grouped by depth:

1. Master the Core — days 1–30
2. Augment with AI — days 31–60
3. Awareness & Ship — days 61–90

Each roadmap item includes estimated weekly hours, a resource type, and status.

## GET /me/early-warning

Returns the stable v1 early-warning contract in `contracts/early-warning-v1.json`.
The current fallback is a deterministic product signal based on available SkillPilot assessment evidence.
It is explicitly marked `ED-02_pending` until the OULAD benchmark model is trained and wired into the service.
