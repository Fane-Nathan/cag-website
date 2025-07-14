// src/pages/HomePage.jsx

import React from 'react';
import Navbar from './components/Navbar';
import WaveAnimation from './components/WaveAnimation';
import { FaGithub } from "react-icons/fa"; // 1. Import the icon
import './HomePage.css';

function HomePage() {
  return (
    <div className="homepage-container">
      <Navbar />
      <WaveAnimation />
      <main className="content-container">
        <section id="home">
          {/* --- 1. Headline and Subtitle --- */}
          <h1>Cache-Augmented Generation</h1>
          <p className="subtitle">
            A novel framework for language models that leverages an external cache to enhance factual accuracy and reduce financial cost substantiallyJj.
          </p>

          {/* --- 2. Key Feature Highlights --- */}
          <div className="feature-list">
            <div className="feature-card">
              <h3>Enhanced Accuracy</h3>
              <p>Improves recall of specific, verifiable facts.</p>
            </div>
            <div className="feature-card">
              <h3>Lower Latency</h3>
              <p>Reduces generation time by accessing a pre-computed cache.</p>
            </div>
            <div className="feature-card">
              <h3>Novel Architecture</h3>
              <p>A unique approach to augmenting generative models.</p>
            </div>
          </div>

          {/* --- 3. Call to Action Buttons --- */}
          <div className="cta-buttons">
            <a href="#demo" className="cta-button primary">Try the Sandbox</a>
            <a href="#overview" className="cta-button secondary">Learn More</a>
          </div>
        </section>

        <section id="demo">
          <h2>Sandbox</h2>
          <p>Here you can add the interface for testing your CAG system.</p>
        </section>
        <section id="overview">
          <h2>CAG Overview</h2>
          <p>Here you can add the detailed, academic explanation of the CAG framework.</p>
        </section>
        <section id="contact">
          <h2>Contact &amp; Support</h2>
          <div className="contact-content">
            <p>Get in touch for questions, support, or collaboration opportunities with the CAG System project.</p>
            <div className="contact-info">
              <div className="contact-item">
                <h3>&#9993; Email</h3>
                <p>
                  <a href="mailto:felnat.surjo@gmail.com" className="contact-link">
                    felnat.surjo@gmail.com
                  </a>
                </p>
                <p className="contact-description">
                  For questions, support, or collaboration inquiries
                </p>
              </div>
              <div className="contact-item">
                <h3>&#128214; API Documentation</h3>
                <p>
                  <a href="http://localhost:8001/docs" target="_blank" rel="noopener noreferrer" className="contact-link">
                    Interactive API Documentation
                  </a>
                </p>
                <p className="contact-description">
                  Complete API reference with live testing interface
                </p>
              </div>
              <div className="contact-item">
                <h3><FaGithub /> GitHub Repository</h3>
                <p>
                  <a href="https://github.com/felixnathaniel/cag-system" target="_blank" rel="noopener noreferrer" className="contact-link">
                    View Source Code
                  </a>
                </p>
                <p className="contact-description">
                  Contribute to the open-source CAG System project
                </p>
              </div>
            </div>
            
            <div className="additional-info">
              <h3>&#128640; Quick Links</h3>
              <div className="quick-links">
                <a href="http://localhost:8001/health" target="_blank" rel="noopener noreferrer" className="quick-link">
                  &#128269; System Health Check
                </a>
                <a href="http://localhost:8001/" target="_blank" rel="noopener noreferrer" className="quick-link">
                  &#127760; API Root Endpoint
                </a>
                <a href="#overview" className="quick-link">
                  &#128218; Technical Overview
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;