import React, { useState } from 'react';
import MemberManager from './MemberManager';
import CategoryManager from './CategoryManager';
import TimelineManager from './TimelineManager';
import FamilyTreeSetup from './FamilyTreeSetup';

/**
 * FamilyPortalHome
 * Dedicated administrative interface for family caregivers to input and manage
 * real photos, relationships, categories, and life milestones.
 */
const FamilyPortalHome = ({ onLaunchGamingPortal, onReturnToHome }) => {
  // Active Tab: 'members' | 'categories' | 'timeline' | 'tree'
  const [activeTab, setActiveTab] = useState('members');

  const tabs = [
    { id: 'members', label: 'Family Members', icon: '👤', desc: 'Photos & Relations' },
    { id: 'categories', label: 'Social Circles', icon: '📁', desc: 'Sorting Groups' },
    { id: 'timeline', label: 'Life Story Milestones', icon: '📅', desc: 'Chronological Events' },
    { id: 'tree', label: 'Family Tree Generations', icon: '🌳', desc: 'Generational Tiers' },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800">
      {/* Top Admin Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              🏡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                  NeuroSetu Family Data Portal
                </h1>
                <span className="bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">
                  Admin Setup
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Personal Memory Care Setup • Real family data powering patient cognitive exercises
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onReturnToHome && (
              <button
                type="button"
                onClick={onReturnToHome}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                ← NeuroSetu Home
              </button>
            )}
            {onLaunchGamingPortal && (
              <button
                type="button"
                onClick={onLaunchGamingPortal}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 active:scale-95"
              >
                <span>🎮</span>
                <span>Test in Gaming Portal →</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-2 border-t border-slate-100 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-3.5 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all
                  ${
                    isActive
                      ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Form Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft">
          {activeTab === 'members' && <MemberManager />}
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'timeline' && <TimelineManager />}
          {activeTab === 'tree' && <FamilyTreeSetup />}
        </div>
      </main>
    </div>
  );
};

export default FamilyPortalHome;

