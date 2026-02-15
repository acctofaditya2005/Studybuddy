import React, { useState, useEffect } from 'react';

const Popup = () => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [summaries, setSummaries] = useState([]);
  const [activeTab, setActiveTab] = useState('settings');

  useEffect(() => {
    // Load API key
    chrome.storage.sync.get(['geminiApiKey'], (result) => {
      if (result.geminiApiKey) {
        setApiKey(result.geminiApiKey);
      }
    });

    // Load summaries
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    const response = await chrome.runtime.sendMessage({ action: 'getSummaries' });
    setSummaries(response.summaries || []);
  };

  const handleSaveApiKey = () => {
    chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '400px',
      background: 'white'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🦉</div>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: '600' }}>
          Study Buddy
        </h1>
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
          Your AI Reading Companion
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e0e0e0',
        background: '#f9f9f9'
      }}>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            background: activeTab === 'settings' ? 'white' : 'transparent',
            borderBottom: activeTab === 'settings' ? '2px solid #667eea' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'settings' ? '600' : 'normal',
            color: activeTab === 'settings' ? '#667eea' : '#666'
          }}
        >
          Settings
        </button>
        <button
          onClick={() => {
            setActiveTab('summaries');
            loadSummaries();
          }}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            background: activeTab === 'summaries' ? 'white' : 'transparent',
            borderBottom: activeTab === 'summaries' ? '2px solid #667eea' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'summaries' ? '600' : 'normal',
            color: activeTab === 'summaries' ? '#667eea' : '#666'
          }}
        >
          Saved ({summaries.length})
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {activeTab === 'settings' && (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                fontSize: '14px',
                color: '#333'
              }}>
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              onClick={handleSaveApiKey}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '15px'
              }}
            >
              {saved ? '✓ Saved!' : 'Save API Key'}
            </button>

            <div style={{
              background: '#f0f7ff',
              border: '1px solid #cce5ff',
              borderRadius: '6px',
              padding: '15px',
              fontSize: '13px',
              lineHeight: '1.5'
            }}>
              <strong>How to get your API key:</strong>
              <ol style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" style={{ color: '#667eea' }}>Google AI Studio</a></li>
                <li>Sign in with your Google account</li>
                <li>Click "Create API key"</li>
                <li>Copy and paste it above</li>
              </ol>
              <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
                ✨ <strong>Free tier:</strong> 1,500 requests/day (perfect for studying!)
              </p>
            </div>

            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#fff9e6',
              borderRadius: '6px',
              fontSize: '13px'
            }}>
              <strong>🦉 How to use:</strong>
              <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                <li>The owl appears on every webpage</li>
                <li>Drag it anywhere you want</li>
                <li>Click the 📝 button to summarize</li>
                <li>Click the owl to chat about the page</li>
                <li>Select language with the flag button</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'summaries' && (
          <div>
            {summaries.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#999'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📚</div>
                <p>No saved summaries yet!</p>
                <p style={{ fontSize: '13px' }}>
                  Click the 📝 button on any page to create your first summary.
                </p>
              </div>
            ) : (
              <div style={{
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {summaries.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: '15px',
                      padding: '12px',
                      background: '#f9f9f9',
                      borderRadius: '6px',
                      fontSize: '13px',
                      borderLeft: '3px solid #667eea'
                    }}
                  >
                    <div style={{
                      fontWeight: '600',
                      marginBottom: '5px',
                      color: '#333',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      marginBottom: '8px'
                    }}>
                      {formatDate(item.timestamp)}
                    </div>
                    <div style={{
                      color: '#555',
                      lineHeight: '1.4',
                      marginBottom: '8px'
                    }}>
                      {item.summary.slice(0, 150)}...
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      style={{
                        color: '#667eea',
                        textDecoration: 'none',
                        fontSize: '12px'
                      }}
                    >
                      View original →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;
