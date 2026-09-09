import React, { useState, useEffect } from 'react';

const DynamicHintDrawer = ({ hintContent, inactivitySeconds = 15, onHintOpened }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPing, setShowPing] = useState(false);

  // Inactivity timer logic
  useEffect(() => {
    if (!inactivitySeconds || !hintContent) return;

    let timer;
    const resetTimer = () => {
      setShowPing(false);
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!isOpen && hintContent) {
          setShowPing(true);
        }
      }, inactivitySeconds * 1000);
    };

    // Listen for activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer(); // Start initially

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [inactivitySeconds, isOpen, hintContent]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowPing(false);
    if (onHintOpened) onHintOpened();
  };

  if (!hintContent) return null;

  return (
    <>
      {/* Floating Hint Button */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className="fixed bottom-6 right-6 z-40 bg-patient-accent text-white p-4 rounded-full shadow-soft-lg flex items-center justify-center min-w-touch min-h-touch hover:bg-patient-accent-hover transition-colors"
        aria-label="Need a hint?"
      >
        <span className="text-xl mr-2">💡</span>
        <span className="font-medium pr-1">Hint</span>
        {showPing && !isOpen && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-patient-teal opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-patient-teal"></span>
          </span>
        )}
      </button>

      {/* Overlay Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/20 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-soft-xl overflow-hidden animate-slide-up">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-patient-primary flex items-center gap-2">
                  <span>💡</span> A little help
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-patient-canvas text-patient-muted"
                  aria-label="Close hint"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="text-patient-body text-patient-secondary mb-6">
                {hintContent}
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-patient-canvas text-patient-primary font-semibold rounded-xl hover:bg-patient-border-subtle transition-colors min-h-touch"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
};

export default DynamicHintDrawer;

