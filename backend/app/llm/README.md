# SkillPilot LLM layer

SkillPilot uses the OpenAI Responses API when `OPENAI_API_KEY` is configured. The current model default is `gpt-5.6-luna`.

The LLM is deliberately not the source of truth for the final AI-resilience score. It can:
- evaluate free-text assessment answers and return structured skill signals;
- translate a user's natural-language roadmap change into safe duration/weekly-hours/goal parameters.

If no API key is configured or an LLM call fails, the backend falls back to deterministic scoring so the hackathon demo remains functional.
