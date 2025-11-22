// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchClashConfig, parseClashNodes } from './services/clashService';
import { ClashNode } from './types';
import NodeCard from './components/NodeCard';

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [nodes, setNodes] = useState<ClashNode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Memoized function to fetch and parse Clash nodes from the provided URL.
   * Uses `useCallback` to prevent unnecessary re-creations.
   */
  const handleFetchNodes = useCallback(async () => {
    setError(null); // Clear previous errors
    setLoading(true); // Set loading state
    setNodes([]); // Clear previous nodes displayed

    if (!url.trim()) {
      setError('Please enter a valid URL.');
      setLoading(false);
      return;
    }

    try {
      const configContent = await fetchClashConfig(url);
      const parsedNodes = parseClashNodes(configContent);
      setNodes(parsedNodes);

      if (parsedNodes.length === 0) {
          setError("No Clash nodes found or unable to parse from the provided URL. Please check the URL and content format.");
      }
    } catch (err: any) {
      console.error("Error fetching or parsing:", err);
      // Display a user-friendly error message
      setError(err.message || "An unknown error occurred while fetching or parsing. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
    }
  }, [url]); // Dependency on 'url' ensures the function is re-created if URL changes.

  // Using useEffect with an empty dependency array to run only once on mount.
  // In this app, fetching is triggered by a button click, so this is mostly for demonstration
  // of correct useEffect usage if an initial load were desired.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // If you had a default URL to load on mount, you would call handleFetchNodes here:
    // if (DEFAULT_URL) { setUrl(DEFAULT_URL); handleFetchNodes(); }
  }, []); // Empty dependency array means this effect runs once on mount.

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Sticky Header for Input - Always visible at the top */}
      <header className="sticky top-0 z-10 bg-white shadow-md p-4 sm:p-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 text-center sm:text-left">Clash Node Viewer</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter Clash subscription URL (e.g., https://example.com/clash.yaml)"
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetchNodes()} // Trigger fetch on Enter key press
              aria-label="Clash subscription URL input"
            />
            <button
              onClick={handleFetchNodes}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !url.trim()} // Disable button when loading or URL is empty
              aria-live="polite" // Announce changes to assistive technologies
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Fetching...
                </span>
              ) : (
                'Fetch Nodes'
              )}
            </button>
          </div>
          {/* Error Message Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded-lg" role="alert">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
              <p className="text-sm mt-1">
                Please ensure the URL is correct and points to a valid Clash configuration file (YAML format).
                Remember this app uses a simplified parser and might not support all YAML complexities.
                A proper YAML library (e.g., `js-yaml`) is recommended for robust production use.
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area for Node Display */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Loading Indicator */}
        {loading && (
          <div className="text-center text-blue-600 text-lg font-medium py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Loading nodes... This might take a moment.
          </div>
        )}

        {/* Node Grid Display */}
        {!loading && nodes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nodes.map((node, index) => (
              <NodeCard key={index} node={node} /> // Use NodeCard to display each node
            ))}
          </div>
        )}

        {/* Initial Prompt / Empty State */}
        {!loading && !error && nodes.length === 0 && (
            <p className="text-center text-gray-500 text-xl mt-16 p-4">
                Enter a Clash subscription URL above to load and display your proxy nodes.
                <br />
                The nodes will appear here once fetched and parsed.
            </p>
        )}
      </main>

      {/* Optional Footer */}
      <footer className="bg-gray-800 text-white text-center p-4 mt-8">
        <p className="text-sm">Clash Node Viewer &copy; {new Date().getFullYear()} - Built with React & Tailwind CSS</p>
      </footer>
    </div>
  );
};

export default App;