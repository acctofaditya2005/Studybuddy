# 🔗 HOW TO ADD SMART OWL TO YOUR EXISTING PROJECT

## 📂 Your Current Structure:
```
study-buddy-extension/
├── src/
│   ├── components/
│   │   ├── ChatInterface.jsx
│   │   ├── OwlCharacter.jsx
│   │   └── SpeechBubble.jsx
│   ├── content/
│   │   ├── index.jsx
│   │   └── StudyBuddy.jsx
│   ├── background/
│   │   └── service-worker.js
│   └── popup/
│       ├── Popup.jsx
│       ├── popup.html
│       └── index.jsx
├── public/
│   ├── manifest.json
│   └── icons/
└── package.json
```

---

## ⚡ QUICK INTEGRATION (3 Steps)

### **STEP 1: Add the New Component**

Copy `SmartInteractiveOwl.jsx` to your components folder:

```
C:\Users\accto\Desktop\study-buddy-extension\src\components\SmartInteractiveOwl.jsx
```

### **STEP 2: Replace Old Owl in StudyBuddy.jsx**

Open: `src/content/StudyBuddy.jsx`

**Replace the entire file with this:**

```javascript
import React from 'react';
import SmartInteractiveOwl from '../components/SmartInteractiveOwl';

const StudyBuddy = () => {
  return <SmartInteractiveOwl />;
};

export default StudyBuddy;
```

### **STEP 3: Rebuild and Test**

```bash
npm run build
```

Then reload your extension in Chrome (chrome://extensions/ → click reload icon)

---

## ✅ DONE! Your Owl Now:
- ✅ Opens wing menu on side with more space
- ✅ Chatbot positions smartly (always visible)
- ✅ Draggable
- ✅ Customizable settings
- ✅ Quick actions

---

## 🔌 CONNECT TO YOUR EXISTING GEMINI API

Your `service-worker.js` already has Gemini API code!

### **Option 1: Use Existing API Functions**

In `SmartInteractiveOwl.jsx`, replace the alert() calls with actual API calls:

```javascript
// At top of SmartInteractiveOwl.jsx, add:
const callGeminiAPI = async (prompt) => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      action: 'chat',
      message: prompt,
      pageContent: document.body.innerText.slice(0, 2000),
      language: 'English'
    }, (response) => {
      resolve(response.reply);
    });
  });
};

// Then in handleQuickAction, replace alerts:
case 'summarize':
  const summary = await callGeminiAPI('Summarize this page in 3 sentences');
  alert(summary); // Or display in UI
  break;
```

### **Option 2: Direct API Call**

```javascript
// Get API key from storage
const getApiKey = async () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['geminiApiKey'], (result) => {
      resolve(result.geminiApiKey);
    });
  });
};

// In summarizePage():
case 'summarize':
  const apiKey = await getApiKey();
  const pageContent = document.body.innerText.slice(0, 3000);
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Summarize: ${pageContent}` }] }]
      })
    }
  );
  
  const data = await response.json();
  const summary = data.candidates[0].content.parts[0].text;
  alert(summary);
  break;
```

---

## 🎨 CUSTOMIZE WING SIZE

In `SmartInteractiveOwl.jsx`, find this section (around line 240):

```javascript
const WING_WIDTH = 200;   // EDIT: Make wing wider/narrower
const WING_HEIGHT = 250;  // EDIT: Make wing taller/shorter
const WING_OFFSET = 80;   // EDIT: Distance from owl
```

Change these numbers to your preference!

---

## 💬 CONNECT CHATBOT

The chatbot UI is ready. To make it functional:

### **Add State for Messages:**

In `SmartInteractiveOwl.jsx`, add after other state:

```javascript
const [chatMessages, setChatMessages] = useState([]);
const [chatInput, setChatInput] = useState('');
```

### **Add Send Handler:**

```javascript
const handleSendMessage = async () => {
  if (!chatInput.trim()) return;
  
  // Add user message
  setChatMessages(prev => [...prev, { 
    role: 'user', 
    text: chatInput 
  }]);
  
  const userMessage = chatInput;
  setChatInput('');
  
  // Get AI response using your existing service worker
  chrome.runtime.sendMessage({
    action: 'chat',
    message: userMessage,
    pageContent: document.body.innerText.slice(0, 2000),
    language: 'English'
  }, (response) => {
    setChatMessages(prev => [...prev, {
      role: 'assistant',
      text: response.reply
    }]);
  });
};
```

### **Update Chat Input:**

In the renderChatbot() function, update the input:

```javascript
<input
  type="text"
  value={chatInput}
  onChange={(e) => setChatInput(e.target.value)}
  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
  placeholder="Ask me anything..."
  style={{...}}
/>

<button onClick={handleSendMessage} style={{...}}>
  ➤
</button>
```

### **Display Messages:**

Replace the placeholder content with:

```javascript
{chatMessages.map((msg, idx) => (
  <div key={idx} style={{
    background: msg.role === 'user' ? '#667eea' : 'white',
    color: msg.role === 'user' ? 'white' : '#333',
    padding: '12px',
    borderRadius: '12px',
    marginBottom: '10px',
    fontSize: '14px',
    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start'
  }}>
    {msg.text}
  </div>
))}
```

---

## 🎓 CONNECT QUICK ACTIONS TO YOUR FEATURES

### **Dyslexic Font:**

```javascript
case 'dyslexic-font':
  // Add/remove dyslexic font stylesheet
  const existingStyle = document.getElementById('dyslexic-font-style');
  if (existingStyle) {
    existingStyle.remove();
  } else {
    const style = document.createElement('style');
    style.id = 'dyslexic-font-style';
    style.textContent = `
      * {
        font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif !important;
      }
    `;
    document.head.appendChild(style);
  }
  break;
```

### **Text-to-Speech:**

```javascript
case 'text-to-speech':
  const textToRead = window.getSelection().toString() || 
                     document.body.innerText.slice(0, 500);
  
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'en-US'; // Or get from settings
    speechSynthesis.speak(utterance);
  }
  break;
```

### **Focus Mode:**

Import your existing FocusMode component and trigger it:

```javascript
// At top of file:
import FocusMode from './FocusMode';

// Add state:
const [focusModeActive, setFocusModeActive] = useState(false);

// In quick action:
case 'focus-mode':
  setFocusModeActive(true);
  break;

// In return statement:
{focusModeActive && (
  <FocusMode
    isActive={true}
    onExit={() => setFocusModeActive(false)}
  />
)}
```

---

## 📝 FILE STRUCTURE AFTER INTEGRATION

```
study-buddy-extension/
├── src/
│   ├── components/
│   │   ├── SmartInteractiveOwl.jsx  ← NEW!
│   │   ├── ChatInterface.jsx         (can keep for reference)
│   │   ├── OwlCharacter.jsx          (can keep for reference)
│   │   └── SpeechBubble.jsx          (can keep for reference)
│   ├── content/
│   │   ├── index.jsx
│   │   └── StudyBuddy.jsx            ← MODIFIED (now uses SmartInteractiveOwl)
│   ├── background/
│   │   └── service-worker.js         (already has Gemini API code!)
│   └── popup/
│       ├── Popup.jsx
│       ├── popup.html
│       └── index.jsx
```

---

## 🧪 TESTING CHECKLIST

After integration, test these:

- [ ] Owl appears on page
- [ ] Can drag owl around
- [ ] Hover owl → wing menu appears
- [ ] Wing opens on correct side (more space)
- [ ] Can click Settings → panel opens
- [ ] Can customize colors and bird type
- [ ] Can select 2 quick actions
- [ ] Quick actions trigger (even if just alerts for now)
- [ ] Can click AI Chat → chatbot opens
- [ ] Chatbot positions correctly (always visible)
- [ ] Can close all panels

---

## 🚀 NEXT STEPS

1. **Copy SmartInteractiveOwl.jsx** to your components folder
2. **Update StudyBuddy.jsx** to use new component
3. **npm run build**
4. **Reload extension** in Chrome
5. **Test basic functionality**
6. **Connect API calls** one by one
7. **Customize appearance** (colors, sizes)

---

## 💡 TIPS

- **Start simple:** Get it working with alerts first
- **Then connect API:** One feature at a time
- **Test each feature:** Before moving to next
- **Use console.log():** To debug positioning issues
- **Check Chrome console:** For any errors

---

## ❓ TROUBLESHOOTING

**Wing menu not opening?**
- Check browser console for errors
- Make sure owl is hovering properly

**Chatbot cut off at screen edge?**
- The smart positioning should handle this
- If not, adjust MARGIN in calculateChatPosition()

**Settings not saving?**
- Add chrome.storage.sync.set() calls
- Check popup.jsx for reference

---

**You're ready to integrate! Let me know if you need help with any step!** 🎉
