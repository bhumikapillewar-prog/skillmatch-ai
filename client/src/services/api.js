/**
 * SkillMatch AI Frontend API Client
 * Wraps fetch requests with token injection and unified error handling.
 */

const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('skillmatch_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async register(name, email, password, headline) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, headline }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register');
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to sign in');
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
    return data;
  },

  async deleteAccount() {
    const res = await fetch(`${API_BASE}/auth/account`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete account');
    return data;
  },

  async getPrivacyPolicy() {
    const res = await fetch(`${API_BASE}/auth/privacy`);
    return await res.json();
  },

  // Analyses
  async createAnalysisFormData(formData) {
    const res = await fetch(`${API_BASE}/analyses`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to perform analysis');
    return data;
  },

  async createAnalysisJson(payload) {
    const res = await fetch(`${API_BASE}/analyses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to perform analysis');
    return data;
  },

  async getAnalyses(search = '', sort = 'desc') {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);

    const res = await fetch(`${API_BASE}/analyses?${params.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch analyses');
    return data;
  },

  async getAnalysisById(id) {
    const res = await fetch(`${API_BASE}/analyses/${id}`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch analysis details');
    return data;
  },

  async deleteAnalysis(id) {
    const res = await fetch(`${API_BASE}/analyses/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete analysis');
    return data;
  },

  async clearAllAnalyses() {
    const res = await fetch(`${API_BASE}/analyses/clear-all`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to clear analyses');
    return data;
  },
};
