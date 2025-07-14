// src/components/Navbar.jsx

import React from 'react';
import './Navbar.css';

// This version removes the "brand" section and uses the <nav> tag again.
function Navbar({ activeSection, setActiveSection }) {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'cag-demo', label: 'Sandbox' },
    { id: 'arxiv-demo', label: 'ArXiv Research' },
    { id: 'overview', label: 'Overview' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <nav>
      <ul className="navbar-nav">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setActiveSection(item.id)}
              className={activeSection === item.id ? 'active' : ''}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;