import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Get the root element from the HTML document
const rootElement = document.getElementById('root');

// Ensure the root element exists before attempting to mount the React app
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create a React root and render the application in strict mode
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);