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
      
      const result = await response.json();
      console.log(`API response from ${url}:`, result);
      return result;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
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
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
