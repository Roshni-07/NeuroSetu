import React, { useState, useEffect } from 'react';

/**
 * AppRouter - Zero-dependency hash-based router for NeuroSetu's portals
 * 
 * Routes:
 * - '#/' or '#/home'      => Home Surface (Default Entry View, formerly Marketing)
 * - '#/patient'           => Patient Experience Surface (WCAG 2.1 AA)
 * - '#/dashboard'         => ASHA Worker & Caregiver Clinical Dashboard
 */
export function useAppRoute() {
  const getRouteFromHash = () => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('dashboard')) return 'dashboard';
    if (hash.includes('patient') || hash.includes('games')) return 'patient';
    // Default route on first visit, refresh on '/', or '#/home'
    return 'home';
  };

  const [currentRoute, setCurrentRoute] = useState(getRouteFromHash());

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(getRouteFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route) => {
    if (route === 'dashboard') window.location.hash = '#/dashboard';
    else if (route === 'patient') window.location.hash = '#/patient';
    else window.location.hash = '#/home';
    setCurrentRoute(route);
  };

  return { currentRoute, navigateTo };
}
