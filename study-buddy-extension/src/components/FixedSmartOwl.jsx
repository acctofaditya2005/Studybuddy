import React, { useState, useEffect, useRef } from 'react';

/**
 * FIXED SMART INTERACTIVE OWL
 * 
 * FIXES:
 * ✅ Settings persist (saved to chrome.storage)
 * ✅ Actual owl design with wings
 * ✅ Wing menu stays on screen (checks bounds)
 * ✅ Wings flap on scroll
 * ✅ All heavily commented for easy customization
 */

const FixedSmartOwl = () => {
  // ============= STATE =============
  const [position, setPosition] = useState({ x: window.innerWidth - 150, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [showWing, setShowWing] = useState(false);
  const [wingPosition, setWingPosition] = useState('right');
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatPosition, setChatPosition] = useState({ x: 0, y: 0 });
  
  // Owl customization (loaded from storage)
  const [owlType, setOwlType] = useState('owl');
  const [bodyColor, setBodyColor] = useState('#8B4513');
  const [bellyColor, setBellyColor] = useState('#DEB887');
  
  // User's selected quick actions (loaded from storage)
  const [selectedActions, setSelectedActions] = useState(['dyslexic-font', 'summarize']);
  
  // Wing animation state
  const [wingAngle, setWingAngle] = useState(0); // -30 (up) to +30 (down)
  const [isFlapping, setIsFlapping] = useState(false);
  
  const dragOffset = useRef({ x: 0, y: 0 });
  const owlRef = useRef(null);
  const wingTimeout = useRef(null);
  const lastScrollY = useRef(window.scrollY);

  // ============= LOAD SETTINGS FROM STORAGE =============
  useEffect(() => {
    // Load saved settings on mount
    chrome.storage.sync.get(['owlSettings'], (result) => {
      if (result.owlSettings) {
        const settings = result.owlSettings;
        setOwlType(settings.owlType || 'owl');
        setBodyColor(settings.bodyColor || '#8B4513');
        setBellyColor(settings.bellyColor || '#DEB887');
        setSelectedActions(settings.selectedActions || ['dyslexic-font', 'summarize']);
      }
    });
  }, []);

  // ============= SAVE SETTINGS TO STORAGE =============
  const saveSettings = () => {
    const settings = {
      owlType,
      bodyColor,
      bellyColor,
      selectedActions
    };
    chrome.storage.sync.set({ owlSettings: settings }, () => {
      console.log('Settings saved!');
    });
  };

  // Save whenever settings change
  useEffect(() => {
    saveSettings();
  }, [owlType, bodyColor, bellyColor, selectedActions]);

  // ============= SCROLL DETECTION FOR WING FLAPPING =============
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;

      if (Math.abs(scrollDelta) > 10 && !isDragging) {
        setIsFlapping(true);
        
        if (scrollDelta > 0) {
          // Scrolling DOWN - wings go UP
          setWingAngle(-30);
        } else {
          // Scrolling UP - wings flap (animated)
          setWingAngle(30);
        }

        // Reset after animation
        setTimeout(() => {
          setWingAngle(0);
          setIsFlapping(false);
        }, 500);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDragging]);

  // ============= AVAILABLE QUICK ACTIONS =============
  const availableActions = [
    { id: 'dyslexic-font', name: 'Dyslexic Font', icon: '🔤', description: 'Dyslexia-friendly font' },
    { id: 'spanish', name: 'Spanish', icon: '🇪🇸', description: 'Translate to Spanish' },
    { id: 'russian', name: 'Russian', icon: '🇷🇺', description: 'Translate to Russian' },
    { id: 'text-to-speech', name: 'Read Aloud', icon: '🔊', description: 'Text-to-speech' },
    { id: 'summarize', name: 'Summarize', icon: '📝', description: 'Summarize page' },
    { id: 'focus-mode', name: 'Focus Mode', icon: '🔦', description: 'Blackout mode' },
    { id: 'grade-level', name: 'Grade Level', icon: '🎓', description: 'Adjust difficulty' }
  ];

  // ============= SMART POSITIONING WITH SCREEN BOUNDS =============
  const calculateWingPosition = () => {
    const screenWidth = window.innerWidth;
    const owlX = position.x;
    const WING_WIDTH = 200;
    const MARGIN = 20;

    // Check if wing would fit on right
    const fitsRight = owlX + 80 + WING_WIDTH + MARGIN < screenWidth;
    
    // Check if wing would fit on left
    const fitsLeft = owlX - WING_WIDTH - 80 > MARGIN;

    // Prefer side with more space, but ensure it fits
    if (owlX < screenWidth / 2) {
      return fitsRight ? 'right' : 'left';
    } else {
      return fitsLeft ? 'left' : 'right';
    }
  };

  const calculateChatPosition = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const owlX = position.x;
    const owlY = position.y;
    
    const CHAT_WIDTH = 350;
    const CHAT_HEIGHT = 500;
    const MARGIN = 20;
    
    let chatX, chatY;
    
    // Horizontal positioning
    if (owlX < screenWidth / 2) {
      chatX = owlX + 100;
    } else {
      chatX = owlX - CHAT_WIDTH - 20;
    }
    
    // Ensure horizontal bounds
    chatX = Math.max(MARGIN, Math.min(chatX, screenWidth - CHAT_WIDTH - MARGIN));
    
    // Vertical positioning
    if (owlY < screenHeight / 2) {
      chatY = owlY;
    } else {
      chatY = owlY - CHAT_HEIGHT + 80;
    }
    
    // Ensure vertical bounds
    chatY = Math.max(MARGIN, Math.min(chatY, screenHeight - CHAT_HEIGHT - MARGIN));
    
    return { x: chatX, y: chatY };
  };

  // ============= DRAGGING LOGIC =============
  const handleMouseDown = (e) => {
    if (e.target.closest('.wing-menu') || e.target.closest('.settings-panel')) return;
    
    setIsDragging(true);
    setShowWing(false);
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
    setIsDragging(false);
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

  // ============= HOVER DETECTION =============
  const handleOwlHover = () => {
    if (isDragging || showSettings || showChat) return;
    
    clearTimeout(wingTimeout.current);
    const newWingPos = calculateWingPosition();
    setWingPosition(newWingPos);
    setShowWing(true);
  };

  const handleOwlLeave = () => {
    wingTimeout.current = setTimeout(() => {
      if (!document.querySelector('.wing-menu:hover')) {
        setShowWing(false);
      }
    }, 200);
  };

  // ============= QUICK ACTION HANDLERS =============
  const handleQuickAction = (actionId) => {
    console.log('Quick action:', actionId);
    
    // TODO: Connect to your features
    switch(actionId) {
      case 'dyslexic-font':
        alert('Dyslexic font - Connect to your feature');
        break;
      case 'spanish':
        alert('Spanish - Connect to Gemini API');
        break;
      case 'russian':
        alert('Russian - Connect to Gemini API');
        break;
      case 'text-to-speech':
        alert('Text-to-speech - Use Web Speech API');
        break;
      case 'summarize':
        alert('Summarize - Connect to Gemini API');
        break;
      case 'focus-mode':
        alert('Focus mode - Import FocusMode component');
        break;
      case 'grade-level':
        alert('Grade level - Import GradeLevelSettings');
        break;
    }
  };

  const openChatbot = () => {
    const chatPos = calculateChatPosition();
    setChatPosition(chatPos);
    setShowChat(true);
    setShowWing(false);
  };

  // ============= RENDER OWL BODY WITH WINGS =============
  const renderOwl = () => {
    // ===== CUSTOMIZE OWL SIZE HERE =====
    const BODY_WIDTH = 70;      // Width of owl body
    const BODY_HEIGHT = 80;     // Height of owl body
    const WING_WIDTH = 25;      // Width of each wing
    const WING_HEIGHT = 40;     // Height of each wing
    // ===================================
    
    return (
      <div style={{
        width: `${BODY_WIDTH}px`,
        height: `${BODY_HEIGHT}px`,
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}>
        {/* ===== LEFT WING ===== */}
        {/* CUSTOMIZE: Change colors, shapes, add feather details */}
        <div style={{
          position: 'absolute',
          left: '-15px',
          top: '20px',
          width: `${WING_WIDTH}px`,
          height: `${WING_HEIGHT}px`,
          background: `linear-gradient(135deg, ${bodyColor} 0%, ${bodyColor}AA 100%)`,
          borderRadius: '50% 20% 30% 50%',
          transform: `rotate(${wingAngle}deg)`, // Flaps on scroll!
          transformOrigin: 'right center',
          transition: isFlapping ? 'transform 0.3s ease-out' : 'transform 0.5s ease-in-out',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 1
        }}>
          {/* Wing feather details (optional) */}
          <div style={{
            position: 'absolute',
            top: '5px',
            left: '3px',
            width: '3px',
            height: '15px',
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '2px'
          }} />
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '5px',
            width: '3px',
            height: '12px',
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '2px'
          }} />
        </div>

        {/* ===== RIGHT WING ===== */}
        {/* CUSTOMIZE: Mirror of left wing */}
        <div style={{
          position: 'absolute',
          right: '-15px',
          top: '20px',
          width: `${WING_WIDTH}px`,
          height: `${WING_HEIGHT}px`,
          background: `linear-gradient(135deg, ${bodyColor}AA 0%, ${bodyColor} 100%)`,
          borderRadius: '20% 50% 50% 30%',
          transform: `rotate(${-wingAngle}deg)`, // Flaps opposite direction!
          transformOrigin: 'left center',
          transition: isFlapping ? 'transform 0.3s ease-out' : 'transform 0.5s ease-in-out',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 1
        }}>
          {/* Wing feather details (optional) */}
          <div style={{
            position: 'absolute',
            top: '5px',
            right: '3px',
            width: '3px',
            height: '15px',
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '2px'
          }} />
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '5px',
            width: '3px',
            height: '12px',
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '2px'
          }} />
        </div>

        {/* ===== OWL BODY ===== */}
        {/* CUSTOMIZE: Change shape, add patterns */}
        <div style={{
          width: `${BODY_WIDTH}px`,
          height: `${BODY_HEIGHT}px`,
          background: `linear-gradient(135deg, ${bodyColor} 0%, ${bodyColor}DD 100%)`,
          borderRadius: '45% 45% 40% 40%', // More owl-like shape
          position: 'relative',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 2
        }}>
          {/* ===== EAR TUFTS ===== */}
          {/* CUSTOMIZE: Make pointier, add colors */}
          <div style={{
            position: 'absolute',
            top: '-5px',
            left: '12px',
            width: '12px',
            height: '20px',
            background: bodyColor,
            borderRadius: '50% 50% 0 0',
            transform: 'rotate(-15deg)'
          }} />
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '12px',
            width: '12px',
            height: '20px',
            background: bodyColor,
            borderRadius: '50% 50% 0 0',
            transform: 'rotate(15deg)'
          }} />

          {/* ===== EYES ===== */}
          {/* CUSTOMIZE: Change size, add animations */}
          <div style={{
            display: 'flex',
            gap: '10px',
            position: 'absolute',
            top: '22px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}>
            {/* Left Eye */}
            <div style={{
              width: '20px',
              height: '22px',
              background: 'white',
              borderRadius: '50%',
              border: '3px solid #333',
              position: 'relative',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                background: '#000',
                borderRadius: '50%',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}>
                {/* Eye shine */}
                <div style={{
                  width: '3px',
                  height: '3px',
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: '2px'
                }} />
              </div>
            </div>

            {/* Right Eye */}
            <div style={{
              width: '20px',
              height: '22px',
              background: 'white',
              borderRadius: '50%',
              border: '3px solid #333',
              position: 'relative',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                background: '#000',
                borderRadius: '50%',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}>
                {/* Eye shine */}
                <div style={{
                  width: '3px',
                  height: '3px',
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: '2px'
                }} />
              </div>
            </div>
          </div>

          {/* ===== BEAK ===== */}
          {/* CUSTOMIZE: Change size, color, shape */}
          <div style={{
            width: '0',
            height: '0',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '14px solid #FFA500',
            position: 'absolute',
            bottom: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
            zIndex: 3
          }} />

          {/* ===== BELLY ===== */}
          {/* CUSTOMIZE: Add patterns, change shape */}
          <div style={{
            width: '45px',
            height: '35px',
            background: `linear-gradient(135deg, ${bellyColor} 0%, ${bellyColor}DD 100%)`,
            borderRadius: '50%',
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.1)'
          }}>
            {/* Belly pattern (optional) */}
            <div style={{
              width: '30px',
              height: '2px',
              background: 'rgba(0,0,0,0.05)',
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderRadius: '2px'
            }} />
            <div style={{
              width: '25px',
              height: '2px',
              background: 'rgba(0,0,0,0.05)',
              position: 'absolute',
              top: '15px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderRadius: '2px'
            }} />
          </div>
        </div>

        {/* ===== FEET ===== */}
        {/* CUSTOMIZE: Change color, add claws */}
        <div style={{
          position: 'absolute',
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '15px',
          zIndex: 0
        }}>
          <div style={{
            width: '12px',
            height: '6px',
            background: '#FFA500',
            borderRadius: '3px 3px 0 0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }} />
          <div style={{
            width: '12px',
            height: '6px',
            background: '#FFA500',
            borderRadius: '3px 3px 0 0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }} />
        </div>
      </div>
    );
  };

  // ============= RENDER WING MENU (WITH BOUNDS CHECK) =============
  const renderWingMenu = () => {
    if (!showWing) return null;

    const WING_WIDTH = 200;
    const WING_HEIGHT = 250;
    const WING_OFFSET = 80;

    return (
      <div
        className="wing-menu"
        onMouseLeave={handleOwlLeave}
        style={{
          position: 'absolute',
          top: '-10px',
          [wingPosition]: `${WING_OFFSET}px`,
          width: `${WING_WIDTH}px`,
          height: `${WING_HEIGHT}px`,
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
          borderRadius: '20px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 999999,
          animation: `slideIn${wingPosition === 'right' ? 'Right' : 'Left'} 0.3s ease-out`,
          border: '3px solid #667eea'
        }}
      >
        <button
          onClick={() => {
            setShowSettings(true);
            setShowWing(false);
          }}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '20px' }}>⚙️</span>
          <span>Settings</span>
        </button>

        {selectedActions.slice(0, 2).map(actionId => {
          const action = availableActions.find(a => a.id === actionId);
          return (
            <button
              key={actionId}
              onClick={() => handleQuickAction(actionId)}
              style={{
                background: 'white',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#333'
              }}
            >
              <span style={{ fontSize: '20px' }}>{action.icon}</span>
              <span>{action.name}</span>
            </button>
          );
        })}

        <button
          onClick={openChatbot}
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '20px' }}>💬</span>
          <span>AI Chat</span>
        </button>

        <style>{`
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </div>
    );
  };

  // ============= RENDER SETTINGS PANEL =============
  const renderSettingsPanel = () => {
    if (!showSettings) return null;

    return (
      <>
        <div
          onClick={() => setShowSettings(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999998
          }}
        />
        <div className="settings-panel" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          maxHeight: '80vh',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 50px rgba(0,0,0,0.3)',
          zIndex: 9999999,
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>⚙️ Settings</h2>
            <button
              onClick={() => setShowSettings(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ padding: '20px', maxHeight: 'calc(80vh - 80px)', overflowY: 'auto' }}>
            {/* Bird Type */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>🦉 Character Type</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { id: 'owl', name: 'Owl', icon: '🦉' },
                  { id: 'cat', name: 'Cat', icon: '🐱' },
                  { id: 'fox', name: 'Fox', icon: '🦊' },
                  { id: 'bear', name: 'Bear', icon: '🐻' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setOwlType(type.id)}
                    style={{
                      padding: '15px',
                      background: owlType === type.id ? '#667eea' : '#f5f5f5',
                      color: owlType === type.id ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    <div style={{ fontSize: '30px', marginBottom: '5px' }}>{type.icon}</div>
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>🎨 Colors</h3>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>
                    Body Color
                  </label>
                  <input
                    type="color"
                    value={bodyColor}
                    onChange={(e) => setBodyColor(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>
                    Belly Color
                  </label>
                  <input
                    type="color"
                    value={bellyColor}
                    onChange={(e) => setBellyColor(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>⚡ Quick Actions</h3>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                Choose up to 2 actions for quick access
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {availableActions.map(action => {
                  const isSelected = selectedActions.includes(action.id);
                  const canSelect = selectedActions.length < 2 || isSelected;
                  
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedActions(selectedActions.filter(id => id !== action.id));
                        } else if (selectedActions.length < 2) {
                          setSelectedActions([...selectedActions, action.id]);
                        }
                      }}
                      disabled={!canSelect}
                      style={{
                        padding: '12px',
                        background: isSelected ? '#667eea' : 'white',
                        color: isSelected ? 'white' : '#333',
                        border: `2px solid ${isSelected ? '#667eea' : '#e0e0e0'}`,
                        borderRadius: '10px',
                        cursor: canSelect ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        opacity: canSelect ? 1 : 0.5,
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{action.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{action.name}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>{action.description}</div>
                      </div>
                      {isSelected && <span style={{ fontSize: '20px' }}>✓</span>}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '10px', textAlign: 'center' }}>
                Selected: {selectedActions.length}/2
              </p>
            </div>
          </div>
        </div>
      </>
    );
  };

  // ============= RENDER CHATBOT =============
  const renderChatbot = () => {
    if (!showChat) return null;

    return (
      <div style={{
        position: 'fixed',
        left: `${chatPosition.x}px`,
        top: `${chatPosition.y}px`,
        width: '350px',
        height: '500px',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 50px rgba(0,0,0,0.3)',
        zIndex: 9999999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>💬 AI Chat</h3>
          <button
            onClick={() => setShowChat(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          flex: 1,
          padding: '15px',
          overflowY: 'auto',
          background: '#f9f9f9'
        }}>
          <div style={{
            background: 'white',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '10px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
              👋 Hi! I can help with:
            </p>
            <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px', fontSize: '13px' }}>
              <li>Answer questions</li>
              <li>Create quizzes</li>
              <li>Explain concepts</li>
              <li>Summarize sections</li>
            </ul>
          </div>

          <div style={{
            background: '#fff',
            padding: '12px',
            borderRadius: '12px',
            fontSize: '14px',
            color: '#666',
            textAlign: 'center',
            marginTop: '20px'
          }}>
            🔌 Connect to Gemini API
            <br/>
            <small style={{ fontSize: '12px' }}>
              (See service-worker.js)
            </small>
          </div>
        </div>

        <div style={{
          padding: '15px',
          borderTop: '1px solid #e0e0e0',
          background: 'white'
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #e0e0e0',
                borderRadius: '20px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              fontSize: '18px'
            }}>
              ➤
            </button>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  };

  // ============= MAIN RENDER =============
  return (
    <>
      <div
        ref={owlRef}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleOwlHover}
        onMouseLeave={handleOwlLeave}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 999998,
          userSelect: 'none'
        }}
      >
        {renderOwl()}
        {renderWingMenu()}
      </div>

      {renderSettingsPanel()}
      {renderChatbot()}
    </>
  );
};

export default FixedSmartOwl;