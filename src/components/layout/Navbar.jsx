import React, { useState } from 'react';
import { ROLES } from '../../services/authService.js';

/**
 * Navbar.jsx - Unified Session-Aware Navigation Bar & Route Guard
 * 
 * Enforces authenticated route access:
 * - When unauthenticated, displays "🔒 Locked / Logged Out" state and requires
 *   Password/PIN authentication before granting access to protected views.
 * - When authenticated, displays active role badge, profile name, and quick logout.
 */
export default function Navbar({
  currentRoute = 'home',
  onNavigate,
  session = null,
  pendingSyncCount = 0,
  onOpenRoleSelector,
  onOpenPinAuth,
  onOpenSetup,
  onLogout
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isStaffSession = Boolean(session && (session.role === ROLES.ASHA_WORKER || session.role === ROLES.CAREGIVER));
  const isPatientSession = Boolean(session && session.role === ROLES.PATIENT && session.patientId);

  const handleProtectedNavigate = (targetRoute, requiredRole) => {
    setIsMobileMenuOpen(false);

    if (targetRoute === 'dashboard') {
      if (isStaffSession) {
        onNavigate(targetRoute);
      } else {
        if (onOpenPinAuth) {
          onOpenPinAuth(ROLES.ASHA_WORKER);
        } else if (onOpenRoleSelector) {
          onOpenRoleSelector();
        }
      }
      return;
    }

    if (targetRoute === 'patient') {
      if (isPatientSession) {
        onNavigate(targetRoute);
      } else {
        if (onOpenPinAuth) {
          onOpenPinAuth(ROLES.PATIENT);
        } else if (onOpenRoleSelector) {
          onOpenRoleSelector();
        }
      }
      return;
    }

    if (session) {
      onNavigate(targetRoute);
    } else {
      if (onOpenPinAuth) {
        onOpenPinAuth(requiredRole);
      } else if (onOpenRoleSelector) {
        onOpenRoleSelector();
      }
    }
  };

  return (
    <header className="bg-white/95 border-b border-slate-200/80 shadow-soft text-slate-700 text-xs sticky top-0 z-40 backdrop-blur-md">
      {/* Top Bar Container */}
      <div className="py-2 px-4 max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Left Navigation Links */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => {
              onNavigate('home');
            }}
            className="flex items-center gap-2 hover:opacity-90 transition cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg p-0.5"
            aria-label="NeuroSetu Home"
          >
            <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-black text-xs shadow-inner">
              ন
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-sm">
              NeuroSetu <span className="text-[10px] text-teal-700 font-normal px-1.5 py-0.2 bg-teal-50 border border-teal-200 rounded">NER</span>
            </span>
          </button>

          <span className="text-slate-200 hidden md:inline">|</span>

          {/* Desktop Route Links */}
          <nav className="hidden sm:flex items-center gap-1.5" aria-label="Main Navigation">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                currentRoute === 'home'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'hover:bg-slate-100 hover:text-slate-900 text-slate-600'
              }`}
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => handleProtectedNavigate('patient', ROLES.PATIENT)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                currentRoute === 'patient'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'hover:bg-slate-100 hover:text-slate-900 text-slate-600'
              }`}
            >
              <span>Patient UI</span>
              {!isPatientSession && <span className="text-[10px] text-amber-500">🔒</span>}
            </button>

            <button
              type="button"
              onClick={() => handleProtectedNavigate('dashboard', ROLES.ASHA_WORKER)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                currentRoute === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'hover:bg-slate-100 hover:text-slate-900 text-slate-600'
              }`}
            >
              <span>ASHA / Caregiver Dashboard</span>
              {pendingSyncCount > 0 && (
                <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-1.5 rounded-full font-bold">
                  {pendingSyncCount}
                </span>
              )}
              {!isStaffSession && <span className="text-[10px] text-amber-500">🔒</span>}
            </button>

            <button
              type="button"
              onClick={() => onNavigate(isStaffSession ? 'familyPortal' : 'family')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                currentRoute === 'family'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'hover:bg-slate-100 hover:text-slate-900 text-slate-600'
              }`}
            >
              <span>Family Portal</span>
            </button>
          </nav>
        </div>

        {/* Desktop Session State & Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {session ? (
            /* Authenticated Session Badge & Logout */
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-slate-900">{session.profileName}</span>
                <span className="text-teal-700 uppercase text-[9px] font-bold tracking-wider px-1 bg-teal-50 border border-teal-200 rounded">
                  {session.role === ROLES.ASHA_WORKER ? 'ASHA' : session.role === ROLES.CAREGIVER ? 'Caregiver' : 'Patient'}
                </span>
              </span>

              {onOpenSetup && (
                <button
                  type="button"
                  onClick={onOpenSetup}
                  className="text-teal-600 hover:text-teal-700 font-semibold transition cursor-pointer"
                >
                  👤 Setup / Edit Profile
                </button>
              )}

              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-1 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1"
                aria-label={`Lock / Logout (${session.profileName} - ${session.role || 'patient'})`}
              >
                <span>🚪</span>
                <span>Lock / Logout ({session.profileName} - {session.role || 'patient'})</span>
              </button>
            </div>
          ) : (
            /* Unauthenticated Session State */
            <div className="flex items-center gap-2">
              <span
                data-testid="locked-status-badge"
                className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold flex items-center gap-1 shadow-xs"
              >
                <span>🔒</span>
                <span>Locked / Logged Out</span>
              </span>

              {onOpenSetup && (
                <button
                  type="button"
                  onClick={onOpenSetup}
                  className="text-teal-600 hover:text-teal-700 font-semibold transition cursor-pointer px-2"
                >
                  👤 Setup / Edit Profile
                </button>
              )}

              {onOpenRoleSelector && (
                <button
                  type="button"
                  onClick={onOpenRoleSelector}
                  className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <span>👥</span>
                  <span>Select Role</span>
                </button>
              )}

              {onOpenPinAuth && (
                <button
                  type="button"
                  onClick={() => onOpenPinAuth(ROLES.PATIENT)}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs transition cursor-pointer flex items-center gap-1"
                >
                  <span>🔑</span>
                  <span>Enter Profile PIN</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle (< sm) */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          className="sm:hidden min-h-touch min-w-touch px-3 py-1.5 text-slate-700 hover:bg-slate-50 bg-white border border-slate-200 rounded-xl flex items-center gap-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
        >
          <span className="text-base leading-none" aria-hidden="true">{isMobileMenuOpen ? '✕' : '☰'}</span>
          <span>{isMobileMenuOpen ? 'Close' : 'Menu'}</span>
        </button>
      </div>

      {/* Mobile Collapsed Drawer Menu (< sm) */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200/80 bg-white px-4 py-3 space-y-2 animate-fade-in">
          {/* Locked Status Notice on Mobile */}
          {!session && (
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>🔒</span>
                <span>Session Locked</span>
              </span>
              <span className="text-[10px] text-amber-600 font-normal">Auth Required</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => {
                onNavigate('home');
                setIsMobileMenuOpen(false);
              }}
              className={`min-h-touch w-full text-left px-3 py-2 rounded-xl font-semibold transition ${
                currentRoute === 'home' ? 'bg-teal-600 text-white' : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              🏠 Home
            </button>

            <button
              type="button"
              onClick={() => handleProtectedNavigate('patient', ROLES.PATIENT)}
              className={`min-h-touch w-full text-left px-3 py-2 rounded-xl font-semibold transition flex items-center justify-between ${
                currentRoute === 'patient' ? 'bg-teal-600 text-white' : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <span>🎮 Patient UI</span>
              {!isPatientSession && <span className="text-xs text-amber-500">🔒 Locked</span>}
            </button>

            <button
              type="button"
              onClick={() => handleProtectedNavigate('dashboard', ROLES.ASHA_WORKER)}
              className={`min-h-touch w-full text-left px-3 py-2 rounded-xl font-semibold transition flex items-center justify-between ${
                currentRoute === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <span>📊 ASHA / Caregiver Dashboard</span>
              <div className="flex items-center gap-1.5">
                {pendingSyncCount > 0 && (
                  <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-1.5 rounded-full font-bold">
                    {pendingSyncCount}
                  </span>
                )}
                {!isStaffSession && <span className="text-xs text-amber-500">🔒 Locked</span>}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate(isStaffSession ? 'familyPortal' : 'family');
              }}
              className={`min-h-touch w-full text-left px-3 py-2 rounded-xl font-semibold transition flex items-center justify-between ${
                currentRoute === 'family' ? 'bg-amber-600 text-white' : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <span>👨‍👩‍👧 Family Portal</span>
            </button>

            {onOpenSetup && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSetup();
                }}
                className="min-h-touch w-full text-left px-3 py-2 rounded-xl text-teal-600 hover:bg-slate-50 font-semibold transition cursor-pointer"
              >
                👤 Setup / Edit Profile
              </button>
            )}

            {session ? (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="min-h-touch w-full text-left px-3 py-2 rounded-xl text-rose-500 hover:bg-slate-50 font-semibold transition cursor-pointer flex items-center gap-1.5"
                aria-label={`Lock / Logout (${session.profileName} - ${session.role || 'patient'})`}
              >
                <span>🚪</span>
                <span>Lock / Logout ({session.profileName} - {session.role || 'patient'})</span>
              </button>
            ) : (
              <>
                {onOpenRoleSelector && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenRoleSelector();
                    }}
                    className="min-h-touch w-full text-left px-3 py-2 rounded-xl text-teal-600 hover:bg-slate-50 font-semibold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>👥</span>
                    <span>Select Role</span>
                  </button>
                )}

                {onOpenPinAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenPinAuth(ROLES.PATIENT);
                    }}
                    className="min-h-touch w-full text-left px-3 py-2 rounded-xl text-teal-600 hover:bg-slate-50 font-semibold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🔑</span>
                    <span>Enter Profile PIN</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
