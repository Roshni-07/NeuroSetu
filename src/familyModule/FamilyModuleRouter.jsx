import React, { useState, useEffect } from 'react';
import FamilyGamingPortal from './FamilyGamingPortal';
import FamilyPortalHome from './familyPortal/FamilyPortalHome';

/**
 * FamilyModuleRouter
 * Top-level switcher connecting the Patient Gaming Portal and the Caregiver Family Data Portal.
 */
const FamilyModuleRouter = ({
  initialView = null, // 'gaming' | 'portal' | null
  onReturnToMainApp = null,
  initialGame = 'menu',
  role = null,
  patientId = null,
  patientProfile = null
}) => {
  const isStaffRole = role === 'caregiver' || role === 'asha_worker';

  const computeInitialView = () => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      if (hash.includes('family-portal') || hash.includes('family-admin')) {
        return 'portal';
      }
      if (hash.includes('family-games')) {
        return 'gaming';
      }
    }
    if (initialView) {
      return initialView;
    }
    return isStaffRole ? 'portal' : 'gaming';
  };

  const [currentView, setCurrentView] = useState(computeInitialView);

  // Sync with window hash if available
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes('family-portal') || hash.includes('family-admin')) {
        setCurrentView('portal');
      } else if (hash.includes('family-games')) {
        setCurrentView('gaming');
      } else if (hash.includes('family')) {
        // Bare #/family hash: use role-derived default
        setCurrentView(isStaffRole ? 'portal' : 'gaming');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [isStaffRole]);

  if (currentView === 'portal') {
    return (
      <FamilyPortalHome
        onLaunchGamingPortal={() => {
          window.location.hash = '#/family-games';
          setCurrentView('gaming');
        }}
        onReturnToHome={onReturnToMainApp}
        patientId={patientId}
        patientProfile={patientProfile}
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

