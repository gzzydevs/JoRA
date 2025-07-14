class ApiService {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  async request(url, options = {}) {
    try {
      console.log(`Making API call to: ${url}`);
      const response = await fetch(`${this.baseURL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      // Handle 204 No Content responses (e.g., DELETE operations)
      if (response.status === 204) {
        return null;
      }
      
      const result = await response.json();
      console.log(`API response from ${url}:`, result);
      return result;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Generic HTTP methods
  async get(url) {
    return this.request(url);
  }

  async post(url, data) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(url, data) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(url) {
    return this.request(url, {
      method: 'DELETE'
    });
  }

  // Project data
  async getProject() {
    return this.request('/api/project');
  }

  // Tasks
  async getTasks() {
    return this.request('/api/tasks');
  }

  async createTask(taskData) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  async updateTask(taskId, updates) {
    return this.request(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteTask(taskId) {
    return this.request(`/api/tasks/${taskId}`, {
      method: 'DELETE'
    });
  }

  // Epics
  async getEpics() {
    return this.request('/api/epics');
  }

  async createEpic(epicData) {
    return this.request('/api/epics', {
      method: 'POST',
      body: JSON.stringify(epicData)
    });
  }

  async updateEpic(epicId, updates) {
    return this.request(`/api/epics/${epicId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteEpic(epicId) {
    return this.request(`/api/epics/${epicId}`, {
      method: 'DELETE'
    });
  }

  // Authors
  async getAuthors() {
    return this.request('/api/authors');
  }

  async createAuthor(authorData) {
    return this.request('/api/authors', {
      method: 'POST',
      body: JSON.stringify(authorData)
    });
  }

  async updateAuthor(authorId, updates) {
    return this.request(`/api/authors/${authorId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteAuthor(authorId) {
    return this.request(`/api/authors/${authorId}`, {
      method: 'DELETE'
    });
  }

  // Releases
  async getReleases() {
    return this.request('/api/releases');
  }

  async createRelease(releaseData) {
    return this.request('/api/releases', {
      method: 'POST',
      body: JSON.stringify(releaseData)
    });
  }

  // Git operations
  async getGitStatus() {
    return this.request('/api/git/status');
  }

  async syncWithRemote() {
    return this.request('/api/git/sync', {
      method: 'POST'
    });
  }

  async saveChanges() {
    return this.request('/api/git/save-changes', {
      method: 'POST'
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Also export as named export for convenience
export const api = apiService;
