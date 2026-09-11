const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
let authToken = null;
export const setAuthToken = (token) => { authToken = token; };

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  let data = null; try { data = await response.json(); } catch {}
  if (!response.ok) throw new Error(data?.detail || `Request failed (${response.status})`);
  return data;
}
export const signup = (payload) => request("/auth/signup", { method:"POST", body:JSON.stringify(payload) });
export const login = (payload) => request("/auth/login", { method:"POST", body:JSON.stringify(payload) });
export const getMe = () => request("/me");
export const updateProfile = (payload) => request("/me/profile", { method:"PUT", body:JSON.stringify(payload) });
export const getRoles = () => request("/roles");
export const getRole = (roleId) => request(`/roles/${roleId}`);
export const startChat = (roleId) => request("/chat/start", { method:"POST", body:JSON.stringify({ role_id:roleId }) });
export const replyChat = (sessionId, answer) => request("/chat/reply", { method:"POST", body:JSON.stringify({ session_id:sessionId, answer }) });
export const getChatHistory = (sessionId) => request(`/chat/${sessionId}`);
export const getChatSessions = () => request("/chat/sessions");
export const getSkillGap = (sessionId) => request(`/skill-gap/${sessionId}`);
export const getCurrentSkillGap = () => request("/me/skill-gap");
export const getRoadmap = (sessionId) => request(`/roadmap/${sessionId}`);
export const getCurrentRoadmap = () => request("/me/roadmap");
export const createRoadmap = (sessionId, payload) => request(`/roadmap/${sessionId}/create`, { method:"POST", body:JSON.stringify(payload) });
export const updateRoadmapProgress = (sessionId, taskId, done) => request(`/roadmap/${sessionId}/progress`, { method:"POST", body:JSON.stringify({task_id:taskId,done}) });
export const adaptRoadmap = (sessionId, payload) => request(`/roadmap/${sessionId}/adapt`, { method:"POST", body:JSON.stringify(payload) });
export const getRoadmapHistory = () => request("/roadmap/history");
export const getAnalyses = () => request("/analyses");
export const reanalyze = (sessionId) => request(`/reanalyze/${sessionId}`, { method:"POST" });
export const getEarlyWarning = () => request("/me/early-warning");
