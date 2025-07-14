// API client for CAG System
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class CAGApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // CAG System endpoints
  async cagAnalysis(url, query, options = {}) {
    return this.request('/cag', {
      method: 'POST',
      body: JSON.stringify({
        url,
        query,
        use_cache: options.useCache ?? true,
        include_history: options.includeHistory ?? false,
        user_id: options.userId || null,
      }),
    });
  }

  // Streaming CAG Analysis
  async cagAnalysisStream(url, query, options = {}, onChunk = null, onComplete = null, onError = null) {
    const requestUrl = `${this.baseURL}/cag/stream`;
    
    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          query,
          use_cache: options.useCache ?? true,
          include_history: options.includeHistory ?? false,
          user_id: options.userId || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'metadata' && onChunk) {
                onChunk({ type: 'metadata', data });
              } else if (data.type === 'content' && onChunk) {
                onChunk({ type: 'content', data });
              } else if (data.type === 'complete' && onComplete) {
                onComplete(data);
              } else if (data.type === 'error' && onError) {
                onError(new Error(data.error));
              }
            } catch (e) {
              console.warn('Failed to parse streaming data:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming request failed:', error);
      if (onError) onError(error);
      throw error;
    }
  }

  async crawlWebsite(url, useCache = true) {
    return this.request('/crawl', {
      method: 'POST',
      body: JSON.stringify({
        url,
        use_cache: useCache,
      }),
    });
  }

  async generateText(prompt, useCache = true) {
    return this.request('/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        use_cache: useCache,
      }),
    });
  }

  async chat(prompt, useCache = true) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        use_cache: useCache,
      }),
    });
  }

  // ArXiv endpoints
  async searchArxiv(query, options = {}) {
    return this.request('/api/arxiv/search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        max_results: options.maxResults || 10,
        sort_by: options.sortBy || 'relevance',
        sort_order: options.sortOrder || 'descending',
        use_cache: options.useCache ?? true,
      }),
    });
  }

  async getArxivPaper(arxivId, useCache = true) {
    return this.request(`/api/arxiv/paper/${arxivId}?use_cache=${useCache}`);
  }

  async analyzeArxivPaper(arxivId, query, options = {}) {
    return this.request('/api/arxiv/analyze', {
      method: 'POST',
      body: JSON.stringify({
        arxiv_id: arxivId,
        query,
        use_cache: options.useCache ?? true,
        store_in_db: options.storeInDb ?? true,
        user_id: options.userId || null,
      }),
    });
  }

  async getArxivCategories() {
    return this.request('/api/arxiv/categories');
  }

  async getDatabaseStats() {
    return this.request('/api/arxiv/stats');
  }

  // History endpoints
  async addChatTurn(userId, message, role) {
    return this.request('/history/add', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        message,
        role,
      }),
    });
  }

  async getChatHistory(userId) {
    return this.request(`/history/get/${userId}`);
  }
}

export default new CAGApiClient();