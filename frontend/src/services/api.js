const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  let data = null;
  try { data = await response.json(); } catch { /* empty response */ }
  if (!response.ok) throw new Error(data?.detail || `Request failed (${response.status})`);
  return data;
}

export const getRoles = () => request("/roles");
export const getRole = (roleId) => request(`/roles/${roleId}`);
export const startChat = (roleId) => request("/chat/start", { method: "POST", body: JSON.stringify({ role_id: roleId }) });
export const replyChat = (sessionId, answer) => request("/chat/reply", { method: "POST", body: JSON.stringify({ session_id: sessionId, answer }) });
export const getSkillGap = (sessionId) => request(`/skill-gap/${sessionId}`);
export const getRoadmap = (sessionId) => request(`/roadmap/${sessionId}`);
export const getHealth = () => request("/health");
