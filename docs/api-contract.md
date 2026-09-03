# API Contract — SkillPilot

## 1. GET /roles
Returns the 3 pre-curated roles for RoleExplorer page.

Response:
[
  { "id": "data-scientist", "title": "Data Scientist", "impact_tag": "Balanced impact" },
  { "id": "software-developer", "title": "Software Developer", "impact_tag": "AI-heavy role" },
  { "id": "ux-designer", "title": "UI/UX Designer", "impact_tag": "Balanced impact" }
]

## 2. GET /roles/{role_id}
Returns full skill breakdown for RoleDetail page (Human-Core / AI-Augmented / AI-Accelerated tiers).

Response:
{
  "id": "data-scientist",
  "title": "Data Scientist",
  "what_it_does": ["Frame business problems...", "Design experiments...", "..."],
  "skills": [
    { "name": "Experiment Design", "tier": "Human-Core", "depth": "MASTER", "note": "Framing the right question is the whole job." },
    { "name": "SQL & Data Modeling", "tier": "AI-Augmented", "depth": "AI-AUGMENT", "note": "Query drafting is automated — judgment is not." },
    { "name": "EDA & Reporting Dashboards", "tier": "AI-Accelerated", "depth": "BASIC-AWARENESS", "note": "Agents generate these from a prompt." }
  ]
}

## 3. POST /chat/start
Starts the guided onboarding chat for a chosen role.

Request:
{ "role_id": "data-scientist" }

Response:
{
  "session_id": "abc123",
  "message": "To calibrate your depth recommendations, I need to know where you stand. First: how many years have you worked with SQL?",
  "quick_replies": null
}

## 4. POST /chat/reply
Sends the user's answer, gets the next question (or final results if done).

Request:
{
  "session_id": "abc123",
  "answer": "About 4 years, using it daily."
}

Response (mid-chat):
{
  "session_id": "abc123",
  "message": "Strong signal — SQL is tracking toward a Master-depth call. Next: have you built models end-to-end yourself, or leaned on AutoML?",
  "quick_replies": ["I build models from scratch", "Mostly AutoML tools", "Only coursework so far"],
  "done": false
}

Response (final message, all skills covered):
{
  "session_id": "abc123",
  "done": true,
  "redirect_to": "/skill-gap"
}

## 5. GET /skill-gap/{session_id}
Returns the full analysis once chat is complete.

Response:
{
  "futureproof_score": 62,
  "summary": { "at_or_above_target": 3, "need_real_depth": 4, "already_past_target": 1 },
  "skills": [
    {
      "name": "SQL & Data Modeling",
      "tier": "AI-Augmented",
      "depth_call": "AI-AUGMENT",
      "your_level_pct": 70,
      "role_target_pct": 80
    },
    {
      "name": "Experiment Design",
      "tier": "Human-Core",
      "depth_call": "MASTER",
      "your_level_pct": 35,
      "role_target_pct": 85
    }
  ],
  "biggest_lever": "Experiment Design"
}

## 6. GET /roadmap/{session_id}
Returns the phased 90-day plan.

Response:
{
  "total_hours": 78,
  "master_count": 3,
  "augment_count": 3,
  "awareness_count": 2,
  "phases": [
    {
      "phase_number": 1,
      "title": "Master the Core",
      "days": "1-30",
      "skills": [
        { "name": "SQL & Data Modeling", "depth": "AI-AUGMENT", "hours_per_week": 3, "resource": "Mode SQL Advanced", "status": "Not Started" },
        { "name": "Experiment Design", "depth": "MASTER", "hours_per_week": 5, "resource": "Causal Inference course", "status": "Not Started" }
      ]
    }
  ]
}
