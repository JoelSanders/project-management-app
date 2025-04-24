// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Helper function for making API requests
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Add authorization header if user is logged in
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'API request failed');
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authApi = {
  login: (email, password) => {
    return apiRequest('/auth/login', 'POST', { email, password });
  },
  
  register: (name, email, password) => {
    return apiRequest('/auth/register', 'POST', { name, email, password });
  },
  
  verifyMfa: (code) => {
    return apiRequest('/auth/verify-mfa', 'POST', { code });
  }
};

// Projects API
export const projectsApi = {
  getAll: () => {
    return apiRequest('/projects');
  },
  
  getById: (id) => {
    return apiRequest(`/projects/${id}`);
  },
  
  create: (projectData) => {
    return apiRequest('/projects', 'POST', projectData);
  },
  
  update: (id, projectData) => {
    return apiRequest(`/projects/${id}`, 'PUT', projectData);
  },
  
  delete: (id) => {
    return apiRequest(`/projects/${id}`, 'DELETE');
  }
};

// Objectives API
export const objectivesApi = {
  getAll: (projectId = null) => {
    const endpoint = projectId ? `/projects/${projectId}/objectives` : '/objectives';
    return apiRequest(endpoint);
  },
  
  getById: (id) => {
    return apiRequest(`/objectives/${id}`);
  },
  
  create: (objectiveData) => {
    return apiRequest('/objectives', 'POST', objectiveData);
  },
  
  update: (id, objectiveData) => {
    return apiRequest(`/objectives/${id}`, 'PUT', objectiveData);
  },
  
  delete: (id) => {
    return apiRequest(`/objectives/${id}`, 'DELETE');
  }
};