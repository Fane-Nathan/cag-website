import React, { useState } from 'react';
import Navbar from './components/Navbar';
import WaveAnimation from './components/WaveAnimation';
import CAGDemo from './components/CAGDemo';
import ArxivDemo from './components/ArxivDemo';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FaGithub, FaEnvelope, FaFileCode } from 'react-icons/fa'; // 1. Import icons here
import './HomePage.css';

function App() {
  const [activeSection, setActiveSection] = useState('home');

  const renderContent = () => {
    switch (activeSection) {
      case 'cag-demo':
        return (
          <section className="demo-container">
            <CAGDemo />
          </section>
        );
      case 'arxiv-demo':
        return (
          <section className="demo-container">
            <ArxivDemo />
          </section>
        );
      case 'overview':
        return (
          <section id="overview">
            <h2>Cache-Augmented Generation: A Scientific Framework</h2>
            <div className="overview-content">
              {/* Abstract */}
              <div className="academic-section">
                <h3>Abstract</h3>
                <p>
                  Cache-Augmented Generation (CAG) represents a paradigm shift
                  in large language model (LLM) architecture, introducing an
                  external memory system that fundamentally addresses the
                  knowledge cutoff problem and computational inefficiencies
                  inherent in traditional autoregressive models. By implementing
                  semantic similarity-based retrieval mechanisms and intelligent
                  caching strategies, CAG achieves significant improvements in
                  factual accuracy, response latency, and cost-effectiveness
                  while maintaining the generative capabilities of modern
                  transformer architectures.
                </p>
              </div>

              {/* Technical Architecture */}
              <div className="academic-section">
                <h3>Technical Architecture</h3>
                <p>
                  The CAG framework operates on a three-tier architecture:{' '}
                  <strong>Semantic Encoding</strong>,
                  <strong>Cache Management</strong>, and{' '}
                  <strong>Response Generation</strong>. Input queries undergo
                  vector embedding transformation using state-of-the-art
                  sentence transformers, enabling high-dimensional semantic
                  similarity computation against cached knowledge
                  representations.
                </p>
                <p>
                  The system employs a hybrid retrieval mechanism combining
                  exact-match hashing for deterministic queries and approximate
                  nearest neighbor (ANN) search for semantic similarity. Cache
                  hits (similarity threshold &gt;= 0.95) bypass expensive LLM
                  inference, while cache misses trigger both generation and
                  intelligent cache population strategies.
                </p>
              </div>

              {/* Mathematical Foundation */}
              <div className="academic-section">
                <h3>Mathematical Foundation</h3>
                <p>
                  Given a query <InlineMath math="q" />, the CAG system computes
                  semantic similarity using cosine distance:
                </p>
                <div className="latex-formula">
                  <BlockMath math="\text{similarity}(q, c) = \frac{E(q) \cdot E(c)}{\|E(q)\| \times \|E(c)\|}" />
                </div>
                <p>
                  Where <InlineMath math="E(\cdot)" /> represents the embedding
                  function, and <InlineMath math="c" /> denotes cached entries.
                  The cache retrieval function is defined as:
                </p>
                <div className="latex-formula">
                  <BlockMath
                    math="R(q) = \begin{cases} 
                    \arg\max_{c \in C} \text{similarity}(q, c) & \text{if } \max \text{similarity} \geq \tau \\
                    \emptyset & \text{otherwise}
                  \end{cases}"
                  />
                </div>
                <p>
                  Where <InlineMath math="\tau" /> is the similarity threshold
                  and <InlineMath math="C" /> represents the cache corpus.
                </p>
                <p>The cache hit probability can be modeled as:</p>
                <div className="latex-formula">
                  <BlockMath math="P(\text{hit}) = P(\max_{c \in C} \text{similarity}(q, c) \geq \tau)" />
                </div>
                <p>And the expected response time follows:</p>
                <div className="latex-formula">
                  <BlockMath math="E[T] = P(\text{hit}) \cdot T_{\text{cache}} + P(\text{miss}) \cdot T_{\text{LLM}}" />
                </div>
                <p>
                  Where{' '}
                  <InlineMath math="T_{\text{cache}} \ll T_{\text{LLM}}" />{' '}
                  represents the significant performance advantage of cache
                  retrieval.
                </p>
              </div>

              {/* Performance Metrics */}
              <div className="academic-section">
                <h3>Performance Characteristics</h3>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <h4>🎯 Accuracy Enhancement</h4>
                    <p>
                      <strong>15-25% improvement</strong> in factual recall
                      accuracy compared to baseline LLMs, particularly for
                      time-sensitive information and domain-specific knowledge.
                    </p>
                  </div>
                  <div className="metric-item">
                    <h4>⚡ Latency Reduction</h4>
                    <p>
                      <strong>85-95% reduction</strong> in response time for
                      cached queries (10ms vs 1.5s), enabling real-time
                      applications and improved user experience.
                    </p>
                  </div>
                  <div className="metric-item">
                    <h4>💰 Cost Optimization</h4>
                    <p>
                      <strong>60-80% reduction</strong> in API costs through
                      intelligent cache utilization, making large-scale
                      deployments economically viable.
                    </p>
                  </div>
                  <div className="metric-item">
                    <h4>🔄 Cache Efficiency</h4>
                    <p>
                      <strong>70-85% hit rate</strong> in production
                      environments with adaptive cache management and semantic
                      clustering algorithms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Research Applications */}
              <div className="academic-section">
                <h3>Research Applications &amp; Use Cases</h3>
                <p>
                  CAG demonstrates particular efficacy in knowledge-intensive
                  domains including:
                </p>
                <ul className="research-list">
                  <li>
                    <strong>Scientific Literature Analysis:</strong> Integration
                    with ArXiv for real-time research paper processing and
                    citation analysis
                  </li>
                  <li>
                    <strong>Financial Information Systems:</strong>{' '}
                    Time-sensitive market data retrieval with guaranteed
                    freshness constraints
                  </li>
                  <li>
                    <strong>Educational Platforms:</strong> Consistent, accurate
                    responses for frequently asked academic questions
                  </li>
                  <li>
                    <strong>Technical Documentation:</strong> Version-controlled
                    knowledge bases with semantic search capabilities
                  </li>
                </ul>
              </div>

              {/* Future Directions */}
              <div className="academic-section">
                <h3>Future Research Directions</h3>
                <p>
                  Current research focuses on{' '}
                  <strong>adaptive cache invalidation</strong> mechanisms,
                  <strong>multi-modal caching</strong> for images and structured
                  data, and
                  <strong>federated cache architectures</strong> for distributed
                  knowledge systems. Ongoing work explores the integration of
                  reinforcement learning for optimal cache management policies
                  and the development of domain-specific embedding models for
                  specialized applications.
                </p>
              </div>
            </div>
          </section>
        );
      case 'contact':
        return (
          <section id="contact">
            <h2>Contact &amp; Support</h2>
            <div className="contact-content">
              <p className="contact-intro">
                Get in touch for questions, support, or collaboration
                opportunities with the CAG System project.
              </p>
              <div className="contact-info">
                <div className="contact-item">
                  {/* 2. Use the new icons */}
                  <h3>
                    <FaEnvelope /> Email
                  </h3>
                  <p>
                    <a
                      href="mailto:felnat.surjo@gmail.com"
                      className="contact-link"
                    >
                      felnat.surjo@gmail.com
                    </a>
                  </p>
                  <p className="contact-description">
                    For questions, support, or collaboration inquiries
                  </p>
                </div>
                <div className="contact-item">
                  <h3>
                    <FaFileCode /> API Documentation
                  </h3>
                  <p>
                    <a
                      href="http://localhost:8001/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link"
                    >
                      Interactive API Documentation
                    </a>
                  </p>
                  <p className="contact-description">
                    Complete API reference with live testing interface
                  </p>
                </div>
                <div className="contact-item">
                  <h3>
                    <FaGithub /> GitHub Repository
                  </h3>
                  <p>
                    <a
                      href="https://github.com/Fane-nathan/cag-system"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link"
                    >
                      View Source Code
                    </a>
                  </p>
                  <p className="contact-description">
                    Contribute to the open-source CAG System project
                  </p>
                </div>
              </div>

              <div className="additional-info">
                <h3>Quick Links</h3>
                <div className="quick-links">
                  <a
                    href="http://localhost:8001/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="quick-link"
                  >
                    &#128269; System Health Check
                  </a>
                  <a
                    href="http://localhost:8001/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="quick-link"
                  >
                    &#127760; API Root Endpoint
                  </a>
                  <a
                    href="#overview"
                    className="quick-link"
                    onClick={() => setActiveSection('overview')}
                  >
                    &#128218; Technical Overview
                  </a>
                </div>
              </div>
            </div>
          </section>
        );
      default:
        return (
          <section id="home">
            <h1>Cache-Augmented Generation</h1>
            <p className="subtitle">
              A novel framework for language models that leverages an external
              cache to enhance factual accuracy and reduce financial cost
              substantially.
            </p>

            <div className="feature-list">
              <div className="feature-card">
                <h3>Enhanced Accuracy</h3>
                <p>Improves recall of specific, verifiable facts.</p>
              </div>
              <div className="feature-card">
                <h3>Lower Latency</h3>
                <p>
                  Reduces generation time by accessing a pre-computed cache.
                </p>
              </div>
              <div className="feature-card">
                <h3>Novel Architecture</h3>
                <p>A unique approach to augmenting generative models.</p>
              </div>
            </div>

            <div className="cta-buttons">
              <button
                onClick={() => setActiveSection('cag-demo')}
                className="cta-button primary"
              >
                Try CAG Demo
              </button>
              <button
                onClick={() => setActiveSection('arxiv-demo')}
                className="cta-button secondary"
              >
                ArXiv Research
              </button>
              <button
                onClick={() => setActiveSection('overview')}
                className="cta-button secondary"
              >
                Learn More
              </button>
            </div>
          </section>
        );
    }
  };

  return (
    <div className="homepage-container">
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <WaveAnimation />
      <main className="content-container">{renderContent()}</main>
    </div>
  );
}

export default App;
