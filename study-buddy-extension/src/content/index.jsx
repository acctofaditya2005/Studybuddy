import React from 'react';
import { createRoot } from 'react-dom/client';
import StudyBuddy from './StudyBuddy';

// Create a container for the Study Buddy
const init = () => {
  // Check if already injected
  if (document.getElementById('study-buddy-root')) {
    return;
  }

  // Create root element
  const rootElement = document.createElement('div');
  rootElement.id = 'study-buddy-root';
  
  // Add to page
  document.body.appendChild(rootElement);

  // Render React component
  const root = createRoot(rootElement);
  root.render(<StudyBuddy />);
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
