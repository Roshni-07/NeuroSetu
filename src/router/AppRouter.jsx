import React, { useState, useEffect } from 'react';

/**
 * AppRouter - Zero-dependency hash-based router for NeuroSetu's dual surfaces
 * 
 * Routes:
 * - '#/' or '#/patient'    => Patient Experience Surface (WCAG 2.1 AA)
 * - '#/dashboard'          => ASHA Worker & Caregiver Clinical Dashboard
 * - '#/about' | '#/marketing' => Dark Mode Public Marketing & Overview
 */
export function useAppRoute() {
  const getRouteFromHash = () => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('dashboard')) return 'dashboard';
    if (hash.includes('marketing') || hash.includes('about')) return 'marketing';
    if (hash.includes('landing') || hash.includes('welcome')) return 'landing';
    return 'patient';
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
    else if (route === 'marketing') window.location.hash = '#/marketing';
    else if (route === 'landing') window.location.hash = '#/landing';
    else window.location.hash = '#/patient';
    setCurrentRoute(route);
  };

  return { currentRoute, navigateTo };
}
