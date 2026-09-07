const API_BASE_URL = "http://127.0.0.1:8000";

export async function analyzeJob(jobData) {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jobData),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze job");
  }

  return await response.json();
}
