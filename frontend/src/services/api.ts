// API service layer — all backend calls go through here
const API_BASE = '/api';
const TOKEN_KEY = 'whisper_token';

// ── Token helpers ──────────────────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('whisper_user');
}

// ── Shared fetch wrapper ───────────────────────────────────────────────
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Only set Content-Type for requests with a body
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });

  // Handle empty responses
  const text = await res.text();
  if (!text) {
    throw new Error('Server returned empty response. Is the backend running?');
  }

  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Invalid server response: ${text.slice(0, 100)}`);
  }

  if (!res.ok || json.code !== 200) {
    throw new Error(json.message || `Request failed: ${res.status}`);
  }
  return json.data as T;
}

// ── Auth ───────────────────────────────────────────────────────────────
export interface LoginData {
  token: string;
  username: string;
  role: string;
  email: string;
  avatar: string;
}
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar: string;
  createdAt: string;
}

export interface ProfileData {
  id: number;
  username: string;
  email: string;
  avatar: string;
}

export function login(username: string, password: string): Promise<LoginData> {
  return request<LoginData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }).then(data => {
    setToken(data.token);
    // Store full user info for session recovery
    localStorage.setItem('whisper_user', JSON.stringify({
      username: data.username,
      role: data.role,
      email: data.email,
      avatar: data.avatar,
    }));
    return data;
  });
}

export async function register(username: string, password: string, email: string): Promise<string> {
  return request<string>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, email }),
  });
}

export async function getUserInfo(): Promise<UserInfo> {
  return request<UserInfo>('/auth/info');
}

export async function fetchProfile(): Promise<ProfileData> {
  return request<ProfileData>('/user/profile');
}

export async function updateProfile(data: { username: string; email: string; avatar: string }): Promise<ProfileData> {
  return request<ProfileData>('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updatePassword(data: { oldPassword: string; newPassword: string }): Promise<string> {
  return request<string>('/user/password', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function uploadAvatar(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  const token = getToken();
  const res = await fetch(`${API_BASE}/upload/avatar`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const text = await res.text();
  if (!text) throw new Error('Upload failed');
  const json = JSON.parse(text);
  const data = json.data || json;
  return { url: data.url };
}

// ── Translation ────────────────────────────────────────────────────────
export interface TaskResult {
  taskId: number;
  status: string;
  srcLang: string;
  tgtLang: string;
  detectedLang: string;
  transcription: string;
  translation: string;
  audioDuration: number;
  segments: Segment[];
  createdAt: string;
}

export interface Segment {
  seq: number;
  start: number;
  end: number;
  sourceText: string;
  targetText: string;
  confidence: number;
}

export async function translateAudio(audio: Blob, srcLang: string, tgtLang: string): Promise<{ taskId: number; status: string }> {
  const form = new FormData();
  form.append('file', audio, 'recording.webm');
  form.append('srcLang', srcLang);
  form.append('tgtLang', tgtLang);

  const token = getToken();
  const res = await fetch(`${API_BASE}/translate`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  const text = await res.text();
  if (!text) throw new Error('后端服务未响应，请确认 SpringBoot 正在运行');
  let json: any;
  try { json = JSON.parse(text); } catch { throw new Error(`后端返回异常: ${text.slice(0, 100)}`); }

  if (!res.ok) throw new Error(json.message || `翻译请求失败: ${res.status}`);

  // 后端 Result<T> 格式: { code: 200, message: "success", data: { taskId, status } }
  const data = json.data || json;
  return { taskId: data.taskId, status: data.status };
}

export async function getTaskResult(taskId: number): Promise<TaskResult> {
  const res = await fetch(`${API_BASE}/translate/${taskId}`);
  const text = await res.text();
  if (!text) throw new Error('后端无响应');
  let json: any;
  try { json = JSON.parse(text); } catch { throw new Error(`后端返回异常: ${text.slice(0, 100)}`); }
  const data = json.data || json;
  return data;
}

export async function processTask(taskId: number): Promise<string> {
  const res = await fetch(`${API_BASE}/translate/${taskId}/process`, {
    method: 'PUT',
  });
  const text = await res.text();
  if (!text) return 'ok';
  try {
    const json = JSON.parse(text);
    return json.data || json.message || 'ok';
  } catch {
    return text;
  }
}

// ── History ────────────────────────────────────────────────────────────
export interface HistoryItem {
  id: number;
  userId: number;
  srcLang: string;
  tgtLang: string;
  transcription: string;
  translation: string;
  status: string;
  audioDuration: number;
  createdAt: string;
}

export interface HistoryPage {
  records: HistoryItem[];
  total: number;
  page: number;
  size: number;
}

export async function fetchHistory(page = 1, size = 10): Promise<HistoryPage> {
  return request<HistoryPage>(`/history?page=${page}&size=${size}`);
}

export async function exportHistory(id: number): Promise<{ content: string; filename: string }> {
  return request(`/history/${id}/export`);
}

// ── Admin ──────────────────────────────────────────────────────────────
export interface DashboardData {
  totalUsers: number;
  todayTasks: number;
  completedTasks: number;
  processingTasks: number;
  gpuUsage: number;
  accuracy: number;
  avgLatency: string;
  recentRequests: number[];
}

export async function fetchDashboard(): Promise<DashboardData> {
  return request<DashboardData>('/admin/dashboard');
}

export async function fetchAdminUsers(page = 1, size = 10, keyword?: string) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (keyword) params.set('keyword', keyword);
  return request<any>(`/admin/users?${params}`);
}

export async function fetchAdminLogs(page = 1, size = 20) {
  return request<any>(`/admin/logs?page=${page}&size=${size}`);
}

export async function fetchMonitor() {
  return request<any>('/admin/monitor');
}

export async function fetchModels() {
  return request<any>('/admin/models');
}

export async function updateModel(id: number, body: any) {
  return request<string>(`/admin/models/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function fetchAnalyticsOverview() {
  return request<any>('/admin/analytics/overview');
}

export async function fetchSettings() {
  return request<any>('/admin/settings');
}

export async function updateSettings(body: any) {
  return request<string>('/admin/settings', { method: 'PUT', body: JSON.stringify(body) });
}

export async function freezeUser(id: number): Promise<string> {
  return request<string>(`/admin/users/${id}/freeze`, { method: 'PUT' });
}

export async function unfreezeUser(id: number): Promise<string> {
  return request<string>(`/admin/users/${id}/unfreeze`, { method: 'PUT' });
}

export async function deleteAdminUser(id: number): Promise<string> {
  return request<string>(`/admin/users/${id}`, { method: 'DELETE' });
}
