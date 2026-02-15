import React, { useState, useRef, useEffect } from 'react';

const ChatInterface = ({ onClose, pageContent, language }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I can help you understand this page. Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        action: 'chat',
        message: userMessage,
        pageContent: pageContent,
        language: language,
        conversationHistory: messages
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please check your API key in the extension settings.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      width: '350px',
      height: '450px',
      background: 'white',
      borderRadius: '15px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
          Study Buddy Chat
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}
          >
            <div style={{
              background: msg.role === 'user' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#f0f0f0',
              color: msg.role === 'user' ? 'white' : '#333',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' 
                ? '15px 15px 5px 15px'
                : '15px 15px 15px 5px',
              fontSize: '14px',
              lineHeight: '1.4',
              wordWrap: 'break-word'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div style={{
              background: '#f0f0f0',
              padding: '10px 14px',
              borderRadius: '15px 15px 15px 5px',
              fontSize: '14px'
            }}>
              <span className="typing-indicator">●●●</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '15px',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        gap: '10px'
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about this page..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #ddd',
            borderRadius: '20px',
            fontSize: '14px',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isLoading || !input.trim() ? 0.5 : 1
          }}
        >
          ➤
        </button>
      </div>

      <style>{`
        .typing-indicator {
          display: inline-block;
          animation: typing 1.4s infinite;
        }
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
