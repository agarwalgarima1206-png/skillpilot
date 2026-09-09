from app.services.gemini_service import generate_text, gemini_status

print("Status:", gemini_status())

response = generate_text(
    "Reply with exactly: Hello from SkillPilot Gemini Service"
)

print("Response:", response)