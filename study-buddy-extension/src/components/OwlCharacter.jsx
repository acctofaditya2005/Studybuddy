import React, { useState, useEffect } from 'react';

const OwlCharacter = ({ emotion = 'idle', onDragStart, onDragEnd, position }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [bobOffset, setBobOffset] = useState(0);

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Idle bobbing animation
  useEffect(() => {
    if (emotion === 'idle') {
      const bobInterval = setInterval(() => {
        setBobOffset(prev => (prev + 1) % 360);
      }, 50);
      return () => clearInterval(bobInterval);
    }
  }, [emotion]);

  const getEmotionStyles = () => {
    switch (emotion) {
      case 'excited':
        return { animation: 'bounce 0.5s ease-in-out infinite' };
      case 'thinking':
        return { animation: 'tilt 1s ease-in-out infinite' };
      case 'falling':
        return { animation: 'fall 0.5s ease-in' };
      case 'flying':
        return { animation: 'fly 0.5s ease-out' };
      case 'scared':
        return { animation: 'shake 0.3s ease-in-out infinite' };
      default:
        return { transform: `translateY(${Math.sin(bobOffset * 0.1) * 3}px)` };
    }
  };

  const getEyeStyle = () => {
    if (isBlinking) return { scaleY: 0.1 };
    
    switch (emotion) {
      case 'excited':
        return { transform: 'scale(1.3)' };
      case 'scared':
        return { transform: 'scale(1.4)' };
      case 'thinking':
        return { transform: 'translateX(-2px)' };
      default:
        return {};
    }
  };

  return (
    <div 
      style={{
        width: '80px',
        height: '80px',
        position: 'relative',
        ...getEmotionStyles()
      }}
    >
      {/* Owl Body */}
      <div style={{
        width: '60px',
        height: '70px',
        background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
        borderRadius: '50% 50% 45% 45%',
        position: 'absolute',
        top: '5px',
        left: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
      }}>
        {/* Wing Left */}
        <div style={{
          width: '20px',
          height: '35px',
          background: '#A0522D',
          borderRadius: '50% 20% 20% 50%',
          position: 'absolute',
          left: '-8px',
          top: '20px',
          transform: emotion === 'flying' ? 'rotate(-20deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s'
        }} />
        
        {/* Wing Right */}
        <div style={{
          width: '20px',
          height: '35px',
          background: '#A0522D',
          borderRadius: '20% 50% 50% 20%',
          position: 'absolute',
          right: '-8px',
          top: '20px',
          transform: emotion === 'flying' ? 'rotate(20deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s'
        }} />

        {/* Eyes Container */}
        <div style={{
          display: 'flex',
          gap: '8px',
          position: 'absolute',
          top: '15px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          {/* Left Eye */}
          <div style={{
            width: '16px',
            height: '16px',
            background: 'white',
            borderRadius: '50%',
            position: 'relative',
            border: '2px solid #333',
            ...getEyeStyle()
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#000',
              borderRadius: '50%',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }} />
          </div>

          {/* Right Eye */}
          <div style={{
            width: '16px',
            height: '16px',
            background: 'white',
            borderRadius: '50%',
            position: 'relative',
            border: '2px solid #333',
            ...getEyeStyle()
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#000',
              borderRadius: '50%',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }} />
          </div>
        </div>

        {/* Beak */}
        <div style={{
          width: '0',
          height: '0',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '12px solid #FFA500',
          position: 'absolute',
          bottom: '25px',
          left: '50%',
          transform: 'translateX(-50%)'
        }} />

        {/* Belly */}
        <div style={{
          width: '35px',
          height: '30px',
          background: 'linear-gradient(135deg, #DEB887 0%, #D2B48C 100%)',
          borderRadius: '50%',
          position: 'absolute',
          bottom: '5px',
          left: '50%',
          transform: 'translateX(-50%)'
        }} />
      </div>

      {/* Feet */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px'
      }}>
        <div style={{
          width: '8px',
          height: '4px',
          background: '#FFA500',
          borderRadius: '2px'
        }} />
        <div style={{
          width: '8px',
          height: '4px',
          background: '#FFA500',
          borderRadius: '2px'
        }} />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes tilt {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(20px) rotate(15deg); }
        }
        @keyframes fly {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-20px) rotate(-10deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
};

export default OwlCharacter;
