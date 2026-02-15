# 🦉 Study Buddy - AI Reading Companion Extension

An animated Chrome extension that helps students understand any webpage with AI-powered summaries, chat, and multi-language support!

## ✨ Features

- **🦉 Animated Owl Character** - Draggable buddy that reacts to your scrolling and text selection
- **💬 AI Chat** - Ask questions about any webpage content
- **📝 Smart Summaries** - Get instant summaries in English, Spanish, or Russian
- **🌍 Multi-language Support** - Perfect for international students
- **💾 Save Summaries** - Keep your study notes for later
- **🎨 Interactive Animations** - Owl shows emotions and comic-style speech bubbles
- **🆓 FREE API** - Uses Google Gemini (1,500 free requests/day)

## 🚀 Setup Instructions

### Step 1: Install Dependencies

Open terminal in this folder and run:

```bash
npm install
```

This will take 1-2 minutes to download all dependencies.

### Step 2: Get Your FREE Google Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API key"
4. **Copy the key** (starts with something like `AIza...`)
5. Keep it handy - you'll need it in Step 4!

**Cost:** Completely FREE! 1,500 requests per day (perfect for studying)

### Step 3: Build the Extension

In terminal, run:

```bash
npm run build
```

This creates a `dist` folder with your extension. Takes about 30 seconds.

### Step 4: Load Extension into Chrome

1. Open Chrome browser
2. Go to: `chrome://extensions/`
3. **Enable "Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"** button
5. Select the `dist` folder inside this project
6. You should see "Study Buddy" appear! 🎉

### Step 5: Add Your API Key

1. Click the Study Buddy extension icon in Chrome (top-right, looks like 🦉)
2. Paste your Google Gemini API key
3. Click "Save API Key"
4. You're ready to go! ✨

## 🎮 How to Use

### Basic Usage

1. **Visit any webpage** (try Wikipedia, news sites, articles)
2. **See the owl appear** in bottom-right corner
3. **Drag the owl** anywhere you want on the page
4. **Watch the owl react** when you:
   - Scroll down (falls and looks scared 😱)
   - Scroll up (flies happily 🦉)
   - Highlight text (gets excited 😊)

### Features

**📝 Summarize a Page:**
- Click the **📝 button** next to the owl
- Owl thinks for a moment...
- Get an instant summary!
- Summary is automatically saved

**💬 Chat About the Page:**
- Click the **owl itself**
- Chat window opens
- Ask questions like:
  - "What is the main idea?"
  - "Explain this in simpler terms"
  - "What are the key points?"
- Owl responds based on page content!

**🌍 Change Language:**
- Click the **flag button** 🇬🇧
- Choose: English 🇬🇧, Spanish 🇪🇸, or Russian 🇷🇺
- All summaries/chat will be in that language!

**📚 View Saved Summaries:**
- Click extension icon (top-right)
- Go to "Saved" tab
- See all your summaries with links back to original pages

## 🛠️ Development Commands

```bash
# Build for production (what you ran above)
npm run build

# Build in development mode with auto-reload
npm run dev

# Clean build folder
npm run clean
```

## 🎨 Customization Ideas

Want to make it your own? Here are easy tweaks:

### Change Owl Colors
Edit: `src/components/OwlCharacter.jsx`
- Line 58: Body color (`#8B4513` → your color)
- Line 111: Eye color
- Line 131: Beak color (`#FFA500` → your color)

### Add More Languages
Edit: `src/content/StudyBuddy.jsx`
- Line 197-200: Add more language options

### Change Owl Position
Edit: `src/content/StudyBuddy.jsx`
- Line 11: Change `x` and `y` values

## 🐛 Troubleshooting

**❌ "API key not set" error**
- Make sure you added your Gemini API key in the extension popup
- Click the extension icon → Settings tab → paste key → Save

**❌ Owl doesn't appear**
- Refresh the webpage after loading the extension
- Check Chrome console (F12) for errors
- Make sure extension is enabled in `chrome://extensions/`

**❌ Chat/Summarize not working**
- Check your API key is correct
- Make sure you have internet connection
- Check you haven't exceeded 1,500 requests/day (very unlikely)

**❌ Build errors**
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again
- Run `npm run build`

## 📁 Project Structure

```
study-buddy-extension/
├── dist/                    # Built extension (load this into Chrome)
├── public/
│   ├── manifest.json        # Extension configuration
│   └── icons/              # Extension icons
├── src/
│   ├── components/
│   │   ├── OwlCharacter.jsx      # Animated owl
│   │   ├── SpeechBubble.jsx      # Comic bubbles
│   │   └── ChatInterface.jsx     # Chat UI
│   ├── content/
│   │   ├── StudyBuddy.jsx        # Main component
│   │   └── index.jsx             # Injection point
│   ├── background/
│   │   └── service-worker.js     # API calls
│   └── popup/
│       ├── Popup.jsx             # Settings UI
│       └── popup.html
├── package.json
└── webpack.config.js
```

## 🎯 Next Steps / Ideas

Want to add more features? Try these:

- ✅ Quiz generation from summaries
- ✅ Export summaries to PDF
- ✅ Highlight important text automatically
- ✅ Text-to-speech for accessibility
- ✅ Dark mode
- ✅ More owl emotions/reactions
- ✅ Team collaboration features
- ✅ AWS cloud storage (sync across devices)

## 🤝 For Your Hackathon

**Demo Tips:**
1. Show the owl's personality (scroll, highlight text)
2. Demonstrate multi-language support
3. Show how it helps international students
4. Display saved summaries feature
5. Emphasize it's FREE to use!

**Presentation Talking Points:**
- Problem: International students struggle with English academic content
- Solution: Fun, interactive AI companion that helps in any language
- Tech: Chrome Extension + React + Google Gemini API
- Impact: Makes learning accessible and enjoyable
- Cost: 100% free for students to use

## 📝 License

MIT License - Feel free to use, modify, and share!

---

**Built with ❤️ for students worldwide 🌍**

Questions? Check the troubleshooting section or ask your AI assistant! 🦉
