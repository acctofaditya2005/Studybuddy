import React, { useState, useEffect, useRef } from 'react';
import OwlCharacter from '../components/OwlCharacter';
import SpeechBubble from '../components/SpeechBubble';
import ChatInterface from '../components/ChatInterface';

const StudyBuddy = () => {
  const [position, setPosition] = useState({ x: window.innerWidth - 120, y: window.innerHeight - 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [emotion, setEmotion] = useState('idle');
  const [speechBubble, setSpeechBubble] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [pageContent, setPageContent] = useState('');
  const [language, setLanguage] = useState('English');
  
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const lastScrollY = useRef(window.scrollY);
  const scrollTimeout = useRef(null);

  // Extract page content
  useEffect(() => {
    const extractContent = () => {
      const bodyText = document.body.innerText;
      const title = document.title;
      setPageContent(`Title: ${title}\n\n${bodyText.slice(0, 3000)}`);
    };
    
    extractContent();
    
    // Re-extract if page changes dynamically
    const observer = new MutationObserver(() => {
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(extractContent, 1000);
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Handle scroll reactions
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;

      if (Math.abs(scrollDelta) > 50) {
        if (scrollDelta > 0) {
          // Scrolling down
          setEmotion('falling');
          setSpeechBubble({ message: 'Wheee! 😱', type: 'exclamation' });
        } else {
          // Scrolling up
          setEmotion('flying');
          setSpeechBubble({ message: 'Going up! 🦉', type: 'speech' });
        }

        setTimeout(() => {
          setEmotion('idle');
          setSpeechBubble(null);
        }, 800);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText.length > 5) {
        setEmotion('excited');
        setSpeechBubble({ 
          message: 'Ooh! Let me help with that! 📖', 
          type: 'speech' 
        });

        setTimeout(() => {
          setEmotion('idle');
        }, 2000);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  // Dragging logic
  const handleMouseDown = (e) => {
    if (e.target.closest('.chat-interface')) return;
    
    setIsDragging(true);
    setEmotion('flying');
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 100));
    const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 100));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setEmotion('idle');
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleOwlClick = () => {
    if (!isDragging) {
      setShowChat(!showChat);
      if (!showChat) {
        setEmotion('excited');
        setSpeechBubble({ message: 'How can I help? 🤓', type: 'speech' });
        setTimeout(() => {
          setSpeechBubble(null);
          setEmotion('idle');
        }, 2000);
      }
    }
  };

  const handleSummarize = async () => {
    setEmotion('thinking');
    setSpeechBubble({ message: 'Let me summarize this...', type: 'thought' });

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'summarize',
        pageContent: pageContent,
        language: language
      });

      setEmotion('excited');
      setSpeechBubble({ 
        message: response.summary.slice(0, 150) + '...', 
        type: 'speech',
        autoClose: false 
      });

      // Save summary
      chrome.runtime.sendMessage({
        action: 'saveSummary',
        summary: response.summary,
        url: window.location.href,
        title: document.title
      });

    } catch (error) {
      setEmotion('idle');
      setSpeechBubble({ 
        message: 'Oops! Check your API key in settings.', 
        type: 'exclamation' 
      });
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onClick={handleOwlClick}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 999999,
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
      >
        <OwlCharacter emotion={emotion} />
        
        {speechBubble && (
          <SpeechBubble
            message={speechBubble.message}
            type={speechBubble.type}
            onClose={() => setSpeechBubble(null)}
            autoClose={speechBubble.autoClose !== false}
          />
        )}

        {/* Action buttons */}
        {!showChat && (
          <div style={{
            position: 'absolute',
            top: '0',
            left: '-60px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSummarize();
              }}
              title="Summarize page"
              style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              📝
            </button>
            
            <select
              value={language}
              onChange={(e) => {
                e.stopPropagation();
                setLanguage(e.target.value);
                setSpeechBubble({ message: `Switched to ${e.target.value}!`, type: 'speech' });
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: 'white',
                border: '2px solid #667eea',
                fontSize: '20px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                textAlign: 'center'
              }}
              title="Select language"
            >
              <option value="English">🇬🇧</option>
              <option value="Spanish">🇪🇸</option>
              <option value="Russian">🇷🇺</option>
            </select>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      {showChat && (
        <div 
          className="chat-interface"
          style={{
            position: 'fixed',
            left: `${position.x - 370}px`,
            top: `${position.y}px`,
            zIndex: 999998
          }}
        >
          <ChatInterface
            onClose={() => setShowChat(false)}
            pageContent={pageContent}
            language={language}
          />
        </div>
      )}
    </>
  );
};

export default StudyBuddy;
