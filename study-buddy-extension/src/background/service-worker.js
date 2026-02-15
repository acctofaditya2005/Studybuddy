// Background service worker - handles API calls to Google Gemini

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// arina: URL from ElevenLabs for text-to-speech API
const ELEVENLABS_ENDPOINT_BASE = 'https://api.elevenlabs.io/v1/text-to-speech';

// Get API key from storage
async function getApiKey() {
  const result = await chrome.storage.sync.get(['geminiApiKey']);
  return result.geminiApiKey || '';
}

// arina: Get ElevenLabs API key from storage
async function getElevenLabsKey() {
  return 'sk_f1671aff2652558ed2593ef1cb3ef897a0f4abe62362b4e5'; // hardcoded key. 
}

// arina: Call ElevenLabs text-to-speech API
// This function sends text to ElevenLabs and gets back voice audio
// so we can play it in the popup.
async function callElevenLabsTTS(text, voiceId) {
  // Get the ElevenLabs API key we saved in Chrome storage
  const apiKey = await getElevenLabsKey();

  // If the key is missing, stop and show an error
  if (!apiKey) {
    throw new Error('ElevenLabs API key not set. Please add it in the extension popup.');
  }

  if (!voiceId) {
  voiceId = 'hpp4J3VqNfWAUOO0d1Us';
}

  // If there is no text, stop
  if (!text || !text.trim()) {
    throw new Error('No text provided for text-to-speech.');
  }

  // This is the full URL for the voice
  const url = `${ELEVENLABS_ENDPOINT_BASE}/${voiceId}`;

  // Send the text to ElevenLabs
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,              // ElevenLabs key
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg'             // tells ElevenLabs to return audio
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {                  
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  });

  // If error: show message from elevenlabs
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs API Error (${response.status}): ${errText}`);
  }

  // Get the MP3 audio bytes
  const arrayBuffer = await response.arrayBuffer();

  // Convert MP3 bytes into base64 text (so we can send it back to the popup)
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Audio = btoa(binary);

  // Return the base64 audio string
  return { base64Audio };
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
        // arina: handle text-to-speech requests from the popup
        case 'textToSpeech':
          response = await callElevenLabsTTS(request.text, request.voiceId);
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
