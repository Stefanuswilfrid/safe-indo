'use client';

import { useState } from 'react';

interface TestResult {
  endpoint: string;
  method: string;
  success: boolean;
  status: number;
  data: any;
  error?: string;
  duration: number;
}

interface EndpointConfig {
  name: string;
  path: string;
  method: 'GET' | 'POST';
  requiresAuth: boolean;
  description: string;
}

const DEBUG_ENDPOINTS: EndpointConfig[] = [
  {
    name: 'Environment Variables',
    path: '/api/debug/env',
    method: 'GET',
    requiresAuth: true,
    description: 'Check environment variable configuration'
  },
  {
    name: 'Authentication Test',
    path: '/api/debug/auth-test',
    method: 'GET',
    requiresAuth: false,
    description: 'Test authentication middleware'
  },
  {
    name: 'Azure OpenAI Test',
    path: '/api/debug/azure-openai',
    method: 'GET',
    requiresAuth: true,
    description: 'Test Azure OpenAI connection'
  },
  {
    name: 'OpenRouter Test',
    path: '/api/debug/openrouter',
    method: 'GET',
    requiresAuth: true,
    description: 'Test OpenRouter connection'
  },
  {
    name: 'RSS Cache Status',
    path: '/api/debug/rss',
    method: 'GET',
    requiresAuth: false,
    description: 'Check RSS cache status and metrics'
  },
  {
    name: 'RSS Test',
    path: '/api/debug/rss-test',
    method: 'POST',
    requiresAuth: false,
    description: 'Test RSS endpoint functionality'
  },
  {
    name: 'Clear RSS Cache',
    path: '/api/debug/clear-rss-cache',
    method: 'POST',
    requiresAuth: false,
    description: 'Clear RSS cache and trigger fresh fetch'
  }
];

export default function DebugPage() {
  const [apiKey, setApiKey] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedEndpoints, setSelectedEndpoints] = useState<Set<string>>(
    new Set(DEBUG_ENDPOINTS.map(ep => ep.path))
  );

  const testEndpoint = async (endpoint: EndpointConfig): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (endpoint.requiresAuth && apiKey) {
        headers['x-api-key'] = apiKey;
      }

      const response = await fetch(endpoint.path, {
        method: endpoint.method,
        headers,
      });

      const duration = Date.now() - startTime;
      const data = await response.json();

      return {
        endpoint: endpoint.path,
        method: endpoint.method,
        success: response.ok,
        status: response.status,
        data,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        endpoint: endpoint.path,
        method: endpoint.method,
        success: false,
        status: 0,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    const selectedConfigs = DEBUG_ENDPOINTS.filter(ep => 
      selectedEndpoints.has(ep.path)
    );

    for (const endpoint of selectedConfigs) {
      const result = await testEndpoint(endpoint);
      setResults(prev => [...prev, result]);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsRunning(false);
  };

  const toggleEndpoint = (path: string) => {
    setSelectedEndpoints(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Debug Endpoints Tester
          </h1>
          
          {/* API Key Input */}
          <div className="mb-6">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              API Key (for authenticated endpoints)
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Required for endpoints that need authentication
            </p>
          </div>

          {/* Endpoint Selection */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Endpoints to Test</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEBUG_ENDPOINTS.map((endpoint) => (
                <label key={endpoint.path} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEndpoints.has(endpoint.path)}
                    onChange={() => toggleEndpoint(endpoint.path)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{endpoint.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        endpoint.requiresAuth 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {endpoint.requiresAuth ? 'Auth Required' : 'No Auth'}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {endpoint.method}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{endpoint.description}</p>
                    <p className="text-xs text-gray-500 font-mono">{endpoint.path}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunning || selectedEndpoints.size === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Running Tests...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Run Tests ({selectedEndpoints.size} selected)</span>
                </>
              )}
            </button>
            
            <button
              onClick={clearResults}
              disabled={isRunning}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Clear Results
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
              
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {results.filter(r => r.success).length}
                  </div>
                  <div className="text-sm text-green-700">Successful</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {results.filter(r => !r.success).length}
                  </div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(results.reduce((acc, r) => acc + r.duration, 0) / results.length)}ms
                  </div>
                  <div className="text-sm text-blue-700">Avg Duration</div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      result.success 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          result.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.success ? '✅ Success' : '❌ Failed'}
                        </span>
                        <span className="font-mono text-sm text-gray-600">
                          {result.method} {result.endpoint}
                        </span>
                        <span className="text-sm text-gray-500">
                          {result.duration}ms
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        result.status >= 200 && result.status < 300
                          ? 'bg-green-100 text-green-800'
                          : result.status >= 400
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {result.status}
                      </span>
                    </div>

                    {result.error && (
                      <div className="mb-3 p-3 bg-red-100 border border-red-200 rounded">
                        <p className="text-sm text-red-800 font-medium">Error:</p>
                        <p className="text-sm text-red-700">{result.error}</p>
                      </div>
                    )}

                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        View Response Data
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-100 text-black rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
