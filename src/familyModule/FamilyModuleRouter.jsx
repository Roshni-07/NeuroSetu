import React, { useState, useEffect } from 'react';
import FamilyGamingPortal from './FamilyGamingPortal';
import FamilyPortalHome from './familyPortal/FamilyPortalHome';

/**
 * FamilyModuleRouter
 * Top-level switcher connecting the Patient Gaming Portal and the Caregiver Family Data Portal.
 */
const FamilyModuleRouter = ({
  initialView = 'gaming', // 'gaming' | 'portal'
  onReturnToMainApp = null,
  initialGame = 'menu',
}) => {
  const [currentView, setCurrentView] = useState(initialView);

  // Sync with window hash if available
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes('family-portal') || hash.includes('family-admin')) {
        setCurrentView('portal');
      } else if (hash.includes('family-games') || hash.includes('family')) {
        setCurrentView('gaming');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (currentView === 'portal') {
    return (
      <FamilyPortalHome
        onLaunchGamingPortal={() => {
          window.location.hash = '#/family-games';
          setCurrentView('gaming');
        }}
        onReturnToHome={onReturnToMainApp}
      />
    );
  }

  return (
    <FamilyGamingPortal
      onBackToMainApp={onReturnToMainApp}
      initialGame={initialGame}
      onOpenFamilyAdmin={() => {
        window.location.hash = '#/family-portal';
        setCurrentView('portal');
      }}
    />
  );
};

export default FamilyModuleRouter;

