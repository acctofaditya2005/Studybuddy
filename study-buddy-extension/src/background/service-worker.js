// Background service worker - handles API calls to Google Gemini

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
// Get API key from storage
async function getApiKey() {
  const result = await chrome.storage.sync.get(['geminiApiKey']);
  return result.geminiApiKey || '';
}

// Call Google Gemini API
async function callGemini(prompt, apiKey) {
  if (!apiKey) {
    throw new Error('API key not set. Please add your Gemini API key in the extension popup.');
  }

  const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${error}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// Handle summarization
async function handleSummarize(pageContent, language) {
  const apiKey = await getApiKey();
  
  const prompt = `You are a helpful study assistant. Summarize the following webpage content in ${language}. 
  Make it concise, clear, and perfect for a student studying this material.
  
  Content:
  ${pageContent}
  
  Provide a summary in ${language}:`;

  const summary = await callGemini(prompt, apiKey);
  return { summary };
}

// Handle chat
async function handleChat(message, pageContent, language, conversationHistory) {
  const apiKey = await getApiKey();
  
  // Build conversation context
  let conversationText = conversationHistory
    .map(msg => `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  const prompt = `You are a helpful study assistant helping a student understand a webpage. 
  Respond in ${language}. Be encouraging, clear, and educational.
  
  Page content:
  ${pageContent}
  
  Previous conversation:
  ${conversationText}
  
  Student: ${message}
  Assistant:`;

  const reply = await callGemini(prompt, apiKey);
  return { reply };
}

// Handle saving summaries
async function saveSummary(summary, url, title) {
  const timestamp = new Date().toISOString();
  const summaryData = {
    summary,
    url,
    title,
    timestamp
  };

  // Get existing summaries
  const result = await chrome.storage.local.get(['summaries']);
  const summaries = result.summaries || [];
  
  // Add new summary
  summaries.unshift(summaryData);
  
  // Keep only last 100 summaries
  if (summaries.length > 100) {
    summaries.splice(100);
  }

  // Save
  await chrome.storage.local.set({ summaries });
  
  return { success: true };
}

// Get saved summaries
async function getSummaries() {
  const result = await chrome.storage.local.get(['summaries']);
  return { summaries: result.summaries || [] };
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      let response;

      switch (request.action) {
        case 'summarize':
          response = await handleSummarize(request.pageContent, request.language);
          break;

        case 'chat':
          response = await handleChat(
            request.message,
            request.pageContent,
            request.language,
            request.conversationHistory
          );
          break;

        case 'saveSummary':
          response = await saveSummary(
            request.summary,
            request.url,
            request.title
          );
          break;

        case 'getSummaries':
          response = await getSummaries();
          break;

        default:
          response = { error: 'Unknown action' };
      }

      sendResponse(response);
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ error: error.message });
    }
  })();

  return true; // Keep message channel open for async response
});

console.log('Study Buddy background service worker loaded!');
