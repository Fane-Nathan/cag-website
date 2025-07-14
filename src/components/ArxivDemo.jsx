// ArXiv Research Demo Component
import React, { useState } from 'react';
import apiClient from '../api/client'; // This is now active
import './ArxivDemo.css';

// Simple markdown renderer component (same as CAG Demo)
const MarkdownRenderer = ({ content }) => {
  const formatMarkdown = (text) => {
    if (!text) return '';
    
    // Convert markdown to HTML-like structure
    let formatted = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="numbered">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    // Wrap in paragraphs and handle lists
    formatted = '<p>' + formatted + '</p>';
    formatted = formatted.replace(/<p><\/p>/g, '');
    
    // Group list items
    formatted = formatted.replace(/(<li(?:\s+class="numbered")?>.*?<\/li>)(?:\s*<br>\s*<li(?:\s+class="numbered")?>.*?<\/li>)*/g, (match) => {
      const isNumbered = match.includes('class="numbered"');
      const listItems = match.replace(/<br>\s*/g, '');
      return isNumbered ? `<ol>${listItems}</ol>` : `<ul>${listItems}</ul>`;
    });
    
    return formatted;
  };

  return (
    <div 
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
    />
  );
};

function ArxivDemo() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [analysisId, setAnalysisId] = useState('');
  const [analysisQuery, setAnalysisQuery] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [maxResults, setMaxResults] = useState(25);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults(null);
    setCurrentPage(1);

    try {
      const response = await apiClient.searchArxiv(searchQuery, {
        maxResults: maxResults,
        sortBy: sortBy,
        useCache: true,
      });
      setSearchResults(response);
      setTotalResults(response.total_results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreResults = async () => {
    if (!searchQuery.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const startIndex = currentPage * maxResults;
      const response = await apiClient.searchArxiv(searchQuery, {
        maxResults: maxResults,
        sortBy: sortBy,
        startIndex: startIndex,
        useCache: true,
      });
      
      // Append new results to existing ones
      setSearchResults(prev => ({
        ...response,
        papers: [...(prev?.papers || []), ...response.papers]
      }));
      setCurrentPage(prev => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysis = async (e) => {
    e.preventDefault();
    if (!analysisId.trim() || !analysisQuery.trim()) {
      setError('Please provide both arXiv ID and analysis query');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await apiClient.analyzeArxivPaper(analysisId, analysisQuery, {
        useCache: true,
        storeInDb: true,
      });
      setAnalysisResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const extractArxivId = (url) => {
    const match = url.match(/arxiv\.org\/abs\/([^\/\s]+)/);
    return match ? match[1] : url;
  };

  const exampleSearches = [
    'machine learning transformers',
    'quantum computing algorithms',
    'computer vision deep learning',
    'natural language processing BERT'
  ];

  const exampleAnalyses = [
    'What is the main contribution of this paper?',
    'What methodology does this paper use?',
    'What are the key results and findings?',
    'How does this work compare to previous research?'
  ];

  return (
    <div className="arxiv-demo">
      <div className="arxiv-demo-left">
        <div className="search-form-box">
          <div className="demo-header">
            <h2>ArXiv Research Assistant</h2>
            <p className="demo-description">
              Search academic papers on arXiv and get AI-powered analysis of their content.
            </p>
          </div>

          <div className="tab-container">
            <button 
              className={`tab ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              Search Papers
            </button>
            <button 
              className={`tab ${activeTab === 'analyze' ? 'active' : ''}`}
              onClick={() => setActiveTab('analyze')}
            >
              Analyze Paper
            </button>
          </div>

      {activeTab === 'search' && (
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-group">
              <label htmlFor="searchQuery">Search Query:</label>
              <input
                type="text"
                id="searchQuery"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., machine learning, quantum computing, neural networks"
                required
              />
            </div>
            
            <div className="search-options">
              <div className="form-group">
                <label htmlFor="maxResults">Results per page:</label>
                <select
                  id="maxResults"
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value))}
                  className="form-select"
                >
                  <option value={10}>10 papers</option>
                  <option value={25}>25 papers</option>
                  <option value={50}>50 papers</option>
                  <option value={100}>100 papers</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="sortBy">Sort by:</label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select"
                >
                  <option value="relevance">Relevance</option>
                  <option value="lastUpdatedDate">Last Updated</option>
                  <option value="submittedDate">Submitted Date</option>
                </select>
              </div>
            </div>
          </form>

          {searchResults && (
            <div className="search-results">
              <div className="results-header">
                <h3>Search Results</h3>
                <div className="results-info">
                  <span className="results-count">
                    Showing {searchResults.papers.length} of {totalResults} papers
                  </span>
                  <span className="results-query">
                    for "{searchQuery}"
                  </span>
                </div>
              </div>
              
              <div className="papers-list">
                {searchResults.papers.map((paper, index) => (
                  <div key={index} className="paper-card">
                    <h4 className="paper-title">{paper.title}</h4>
                    <p className="paper-authors">
                      <strong>Authors:</strong> {paper.authors.join(', ')}
                    </p>
                    <p className="paper-summary">{paper.summary}</p>
                    <div className="paper-metadata">
                      <div className="metadata-item">
                        <span className="metadata-icon">🆔</span>
                        <span className="metadata-label">ID:</span>
                        <span className="metadata-value">{paper.id}</span>
                      </div>
                      
                      <div className="metadata-item">
                        <span className="metadata-icon">📅</span>
                        <span className="metadata-label">Published:</span>
                        <span className="metadata-value">{new Date(paper.published).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="metadata-item categories-item">
                        <span className="metadata-icon">🏷️</span>
                        <span className="metadata-label">Categories:</span>
                        <div className="categories-list">
                          {paper.categories.map((category, idx) => (
                            <span key={idx} className="category-tag">
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="paper-actions">
                      <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" className="pdf-link">
                        View PDF
                      </a>
                      <button 
                        onClick={() => {
                          setAnalysisId(paper.id);
                          setActiveTab('analyze');
                        }}
                        className="analyze-paper-btn"
                      >
                        Analyze This Paper
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {searchResults.papers.length < totalResults && (
                <div className="load-more-section">
                  <button
                    onClick={loadMoreResults}
                    disabled={loading}
                    className="load-more-button"
                  >
                    {loading ? 'Loading...' : `Load More Papers (${totalResults - searchResults.papers.length} remaining)`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analyze' && (
        <div className="analysis-section">
          <form onSubmit={handleAnalysis} className="analysis-form">
            <div className="form-group">
              <label htmlFor="analysisId">ArXiv ID or URL:</label>
              <input
                type="text"
                id="analysisId"
                value={analysisId}
                onChange={(e) => setAnalysisId(extractArxivId(e.target.value))}
                placeholder="e.g., 2301.07041 or https://arxiv.org/abs/2301.07041"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="analysisQuery">Analysis Question:</label>
              <textarea
                id="analysisQuery"
                value={analysisQuery}
                onChange={(e) => setAnalysisQuery(e.target.value)}
                placeholder="What would you like to know about this paper?"
                rows="3"
                required
              />
            </div>
          </form>

        </div>
    )}

    {analysisResult && (
          <div className="analysis-results">
            <h3>Analysis Result</h3>
            <div className="analysis-metadata">
              <h4>{analysisResult.paper_title}</h4>
              <p><strong>ArXiv ID:</strong> {analysisResult.arxiv_id}</p>
              <p><strong>Query:</strong> {analysisResult.query}</p>
              <p><strong>Processing Time:</strong> {analysisResult.processing_time?.toFixed(2)}s</p>
              <p><strong>Cached:</strong> Paper: {analysisResult.paper_cached ? '✓' : '✗'} | Analysis: {analysisResult.analysis_cached ? '✓' : '✗'}</p>
            </div>
            <div className="analysis-content">
              <h4>AI Analysis:</h4>
              <div className="analysis-text">
                <MarkdownRenderer content={analysisResult.analysis} />
              </div>
            </div>
          </div>
        )}

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}
        </div>
      </div>

      <div className="arxiv-demo-right">
        <div className="categories-search-box">
          <div className="examples">
            <h3>
              {activeTab === 'search' ? 'Example Searches:' : 'Example Questions:'}
            </h3>
            {activeTab === 'search' ? (
              exampleSearches.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(example)}
                  className="example-button"
                >
                  {example}
                </button>
              ))
            ) : (
              exampleAnalyses.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setAnalysisQuery(example)}
                  className="example-button"
                >
                  {example}
                </button>
              ))
            )}
          </div>

          <div className="search-action">
            <button
              onClick={activeTab === 'search' ? handleSearch : handleAnalysis}
              disabled={loading || (activeTab === 'search' ? !searchQuery.trim() : !analysisId.trim() || !analysisQuery.trim())}
              className="submit-button analyze-button"
            >
              {loading ? (activeTab === 'search' ? 'Searching...' : 'Analyzing...') : (activeTab === 'search' ? 'Search ArXiv' : 'Analyze Paper')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArxivDemo;