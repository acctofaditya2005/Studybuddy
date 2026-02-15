import React, { useEffect, useState } from 'react';

const SpeechBubble = ({ message, type = 'speech', position = 'right', onClose, autoClose = true }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!isVisible) return null;

  const getBubbleStyle = () => {
    const baseStyle = {
      position: 'absolute',
      background: 'white',
      borderRadius: '15px',
      padding: '10px 15px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      border: '2px solid #333',
      maxWidth: '200px',
      fontSize: '14px',
      fontFamily: 'Comic Sans MS, cursive, sans-serif',
      zIndex: 10001,
      animation: 'popIn 0.3s ease-out'
    };

    if (type === 'thought') {
      baseStyle.border = '2px dashed #666';
      baseStyle.borderRadius = '20px';
    } else if (type === 'exclamation') {
      baseStyle.background = '#FFF9C4';
      baseStyle.border = '3px solid #FFA000';
    }

    if (position === 'right') {
      baseStyle.left = '100px';
      baseStyle.top = '10px';
    } else if (position === 'top') {
      baseStyle.bottom = '100px';
      baseStyle.left = '50%';
      baseStyle.transform = 'translateX(-50%)';
    }

    return baseStyle;
  };

  const getTailStyle = () => {
    if (type === 'thought') {
      return (
        <>
          <div style={{
            position: 'absolute',
            width: '12px',
            height: '12px',
            background: 'white',
            border: '2px dashed #666',
            borderRadius: '50%',
            left: position === 'right' ? '-20px' : '20px',
            bottom: '10px'
          }} />
          <div style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            background: 'white',
            border: '2px dashed #666',
            borderRadius: '50%',
            left: position === 'right' ? '-30px' : '30px',
            bottom: '5px'
          }} />
        </>
      );
    }

    return (
      <div style={{
        position: 'absolute',
        width: '0',
        height: '0',
        borderTop: '15px solid white',
        borderLeft: position === 'right' ? '15px solid transparent' : '0',
        borderRight: position === 'right' ? '0' : '15px solid transparent',
        left: position === 'right' ? '-13px' : 'auto',
        right: position === 'right' ? 'auto' : '-13px',
        bottom: '15px',
        filter: 'drop-shadow(-2px 0px 0px #333)'
      }} />
    );
  };

  return (
    <div style={getBubbleStyle()}>
      {getTailStyle()}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {message}
      </div>
      {!autoClose && (
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '0',
            width: '20px',
            height: '20px',
            lineHeight: '20px'
          }}
        >
          ×
        </button>
      )}
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SpeechBubble;
