import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';
import './CAGDemo.css';

// Simple markdown renderer component
const MarkdownRenderer = ({ content }) => {
  const formatMarkdown = (text) => {
    if (!text) return '';
    
    // Pre-process: Split into lines for better list handling
    const lines = text.split('\n');
    let formatted = '';
    let inList = false;
    let listItems = [];
    let inCodeBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          formatted += '</code></pre>';
          inCodeBlock = false;
        } else {
          if (inList) {
            formatted += '<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>';
            inList = false;
            listItems = [];
          }
          formatted += '<pre><code>';
          inCodeBlock = true;
        }
        continue;
      }
      
      if (inCodeBlock) {
        formatted += line + '\n';
        continue;
      }
      
      // Handle bullet points
      if (line.trim().match(/^[*-]\s+(.+)/)) {
        const content = line.trim().replace(/^[*-]\s+/, '');
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(content);
        continue;
      }
      
      // Handle numbered lists
      if (line.trim().match(/^\d+\.\s+(.+)/)) {
        const content = line.trim().replace(/^\d+\.\s+/, '');
        if (inList) {
          formatted += '<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>';
          listItems = [];
        }
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(`<li class="numbered">${content}</li>`);
        continue;
      }
      
      // End list if we hit a non-list line
      if (inList && line.trim() !== '') {
        formatted += '<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>';
        inList = false;
        listItems = [];
      }
      
      // Handle headers
      if (line.trim().match(/^###\s+(.+)/)) {
        formatted += `<h3>${line.trim().replace(/^###\s+/, '')}</h3>`;
        continue;
      }
      if (line.trim().match(/^##\s+(.+)/)) {
        formatted += `<h2>${line.trim().replace(/^##\s+/, '')}</h2>`;
        continue;
      }
      if (line.trim().match(/^#\s+(.+)/)) {
        formatted += `<h1>${line.trim().replace(/^#\s+/, '')}</h1>`;
        continue;
      }
      
      // Handle regular paragraphs
      if (line.trim() !== '') {
        formatted += `<p>${line.trim()}</p>`;
      }
    }
    
    // Close any remaining list
    if (inList) {
      formatted += '<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>';
    }
    
    // Post-process for inline formatting
    formatted = formatted
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>');
    
    return formatted;
  };

  return (
    <div 
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
    />
  );
};

function CAGDemo() {
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useCache, setUseCache] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const demoRef = useRef(null);

  // Test connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing connection to:', apiClient.baseURL);
        await apiClient.healthCheck();
        setConnectionStatus('connected');
        console.log('Backend connection successful');
      } catch (err) {
        setConnectionStatus('disconnected');
        console.error('Backend connection failed:', err);
      }
    };
    testConnection();
  }, []);

  // Dynamic sizing based on content
  useEffect(() => {
    if (demoRef.current && result) {
      const responseLength = result.response?.length || 0;
      const urlLength = result.url?.length || 0;
      const totalContentLength = responseLength + urlLength;
      
      // Remove existing content-based classes
      demoRef.current.classList.remove('has-long-content', 'has-short-content');
      
      // Add appropriate class based on content length
      if (totalContentLength > 1000) {
        demoRef.current.classList.add('has-long-content');
      } else if (totalContentLength < 300) {
        demoRef.current.classList.add('has-short-content');
      }
    }
  }, [result]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim() || !query.trim()) {
      setError('Please provide both URL and query');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setIsStreaming(true);
    setStreamingContent('');

    let streamingResult = {
      url: url,
      query: query,
      response: '',
      crawl_cached: false,
      llm_cached: false,
      processing_time: 0
    };

    try {
      console.log('Making CAG request:', { url, query, useCache });
      
      // Try streaming first, fallback to regular request
      try {
        await apiClient.cagAnalysisStream(
          url, 
          query, 
          { useCache, includeHistory: false },
          // onChunk callback
          (chunk) => {
            if (chunk.type === 'metadata') {
              streamingResult = { ...streamingResult, ...chunk.data };
              setResult({ ...streamingResult });
            } else if (chunk.type === 'content') {
              streamingResult.response += chunk.data.content;
              streamingResult.llm_cached = chunk.data.cached;
              setStreamingContent(streamingResult.response);
              setResult({ ...streamingResult });
            }
          },
          // onComplete callback
          (completion) => {
            console.log('Streaming completed:', completion);
            streamingResult.processing_time = completion.processing_time;
            streamingResult.llm_cached = completion.cached;
            setResult({ ...streamingResult });
            setIsStreaming(false);
            setLoading(false);
          },
          // onError callback
          (error) => {
            console.error('Streaming failed, falling back to regular request:', error);
            throw error; // This will trigger the fallback
          }
        );
      } catch {
        console.log('Streaming not available, using regular CAG request');
        setIsStreaming(false);
        
        // Fallback to regular CAG request
        const response = await apiClient.cagAnalysis(url, query, {
          useCache,
          includeHistory: false,
        });
        
        console.log('CAG response:', response);
        setResult(response);
        setLoading(false);
      }
    } catch (err) {
      console.error('CAG request failed:', err);
      setError(err.message);
      setIsStreaming(false);
      setLoading(false);
    }
  };

  const exampleQueries = [
    {
      url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
      query: 'What are the main applications of artificial intelligence?'
    },
    {
      url: 'https://openai.com/blog/chatgpt',
      query: 'How does ChatGPT work and what are its capabilities?'
    }
  ];

  const loadExample = (example) => {
    setUrl(example.url);
    setQuery(example.query);
  };

  return (
    <div className="cag-demo" ref={demoRef}>
      <div className="cag-demo-left">
        <div className="demo-form-box">
          <div className="demo-header">
            <h2>CAG System Demo</h2>
            <div className="connection-status">
              Backend Status:
              <span className={`status-${connectionStatus}`}>
                {connectionStatus === 'checking' && ' Checking...'}
                {connectionStatus === 'connected' && ' Connected'}
                {connectionStatus === 'disconnected' && ' Disconnected'}
              </span>
            </div>
            <p className="demo-description">
              Enter a URL and ask a question about its content. Our Cache-Augmented Generation system 
              will crawl the website and provide intelligent answers based on the content.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="cag-form" id="cag-form">
            <div className="form-group">
              <label htmlFor="url">Website URL:</label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="query">Your Question:</label>
              <textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What would you like to know about this website's content?"
                rows="3"
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={useCache}
                  onChange={(e) => setUseCache(e.target.checked)}
                />
                Use caching for faster responses
              </label>
            </div>
          </form>

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {result && (
          <div className="result-container">
            <h3>Analysis Result</h3>
            <div className="result-metadata">
              <div className="metadata-item">
                <span className="icon">🔗</span>
                <span className="label">URL:</span>
                <span className="value">
                  <a href={result.url} target="_blank" rel="noopener noreferrer">{result.url}</a>
                </span>
              </div>
              
              <div className="metadata-item">
                <span className="icon">⚡</span>
                <span className="label">Processing Time:</span>
                <span className="value processing-time">{result.processing_time?.toFixed(2)}s</span>
              </div>
              
              <div className="metadata-item">
                <span className="icon">💾</span>
                <span className="label">Cache Status:</span>
                <span className="value">
                  <span className={`cache-badge ${result.crawl_cached ? 'cached' : 'not-cached'}`}>
                    <span className="badge-icon">{result.crawl_cached ? '✓' : '✗'}</span>
                    Crawl
                  </span>
                  {' | '}
                  <span className={`cache-badge ${result.llm_cached ? 'cached' : 'not-cached'}`}>
                    <span className="badge-icon">{result.llm_cached ? '✓' : '✗'}</span>
                    LLM
                  </span>
                </span>
              </div>
            </div>
            <div className="result-content">
              <h4>Query: {result.query}</h4>
              <div className="response">
                {isStreaming ? (
                  <div className="streaming-response">
                    <MarkdownRenderer content={streamingContent} />
                    <span className="streaming-cursor">|</span>
                  </div>
                ) : (
                  <MarkdownRenderer content={result.response} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="cag-demo-right">
        <div className="examples-analyze-box">
          <div className="examples">
            <h3>Try these examples:</h3>
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => loadExample(example)}
                className="example-button"
              >
                {example.query}
              </button>
            ))}
          </div>

          <div className="analyze-section">
            <button 
              type="submit" 
              form="cag-form" 
              disabled={loading} 
              className={`submit-button analyze-button ${isStreaming ? 'streaming' : ''}`}
            >
              {loading ? (isStreaming ? 'Streaming...' : 'Analyzing...') : 'Analyze Website'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CAGDemo;