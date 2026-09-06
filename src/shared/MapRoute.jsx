import React, { useState, useCallback } from 'react';
import { sounds } from '../utils/soundEffects.js';
import SpeakButton from '../components2/SpeakButton.jsx';

/**
 * MapRoute - Interactive node-based map path renderer.
 * 
 * Props:
 *   nodes: [{ id, label, icon, x, y }]  — positions are 0–100 percentage
 *   connections: [[fromId, toId], …]     — lines drawn between nodes
 *   mode: 'show' | 'select'
 *   correctSequence: [id, id, …]         — sequence player must tap
 *   onSequenceComplete: ({correct, total}) => void
 *   highlightSequence: [id, …]           — nodes lit during 'show' animation
 *   onShowDone: () => void               — called when animation finishes
 *   showDuration: ms per node during animation
 *   mapTitle: string
 */
export default function MapRoute({
  nodes = [],
  connections = [],
  mode = 'show', // 'show' | 'select'
  correctSequence = [],
  onSequenceComplete,
  highlightSequence = [],
  onShowDone,
  showDuration = 900,
  mapTitle = 'Village Path',
  language = 'en',
  className = ''
}) {
  const [activeNode, setActiveNode] = useState(null); // for 'show' animation driven externally
  const [playerSequence, setPlayerSequence] = useState([]);
  const [lastCorrect, setLastCorrect] = useState(null);
  const [lastWrong, setLastWrong] = useState(null);

  // Expose highlight animation for parent via animateRoute helper — parent controls timing
  // Parent can pass highlightIndex to show current node in sequence
  const [highlightIndex, setHighlightIndex] = useState(-1);

  // Animate highlight sequence (show mode)
  React.useEffect(() => {
    if (mode !== 'show' || highlightSequence.length === 0) return;
    let i = 0;
    setHighlightIndex(0);
    const interval = setInterval(() => {
      sounds.playEncouragingSoft();
      i++;
      if (i >= highlightSequence.length) {
        clearInterval(interval);
        setHighlightIndex(-1);
        if (onShowDone) onShowDone();
      } else {
        setHighlightIndex(i);
      }
    }, showDuration);
    return () => clearInterval(interval);
  }, [mode, highlightSequence.join(','), showDuration]);

  const handleNodeTap = useCallback((nodeId) => {
    if (mode !== 'select') return;

    const expectedNext = correctSequence[playerSequence.length];
    if (nodeId === expectedNext) {
      setLastCorrect(nodeId);
      setLastWrong(null);
      sounds.playMatchChime();
      const newSeq = [...playerSequence, nodeId];
      setPlayerSequence(newSeq);
      setTimeout(() => setLastCorrect(null), 600);

      if (newSeq.length === correctSequence.length) {
        if (onSequenceComplete) {
          onSequenceComplete({ correct: newSeq.length, total: correctSequence.length });
        }
      }
    } else {
      setLastWrong(nodeId);
      sounds.playEncouragingSoft();
      setTimeout(() => setLastWrong(null), 700);
    }
  }, [mode, playerSequence, correctSequence, onSequenceComplete]);

  const getNodeState = (node) => {
    const id = node.id;
    if (mode === 'show') {
      const isActive = highlightSequence[highlightIndex] === id;
      const isPast = highlightIndex > 0 && highlightSequence.slice(0, highlightIndex).includes(id);
      return isActive ? 'active' : isPast ? 'past' : 'idle';
    } else {
      if (id === lastCorrect) return 'correct';
      if (id === lastWrong) return 'wrong';
      if (playerSequence.includes(id)) return 'visited';
      return 'idle';
    }
  };

  const nodeStyle = (state) => {
    const base = 'flex flex-col items-center justify-center rounded-full border-4 cursor-pointer transition-all duration-300 select-none shadow-lg';
    const size = 'w-16 h-16 sm:w-20 sm:h-20';
    const states = {
      idle: 'bg-teal-100 border-teal-400 text-teal-900 hover:bg-teal-200 hover:scale-110',
      active: 'bg-yellow-300 border-yellow-600 text-yellow-900 scale-125 ring-4 ring-yellow-400',
      past: 'bg-emerald-200 border-emerald-500 text-emerald-800',
      visited: 'bg-emerald-300 border-emerald-600 text-emerald-900',
      correct: 'bg-emerald-400 border-emerald-700 text-white scale-125 ring-4 ring-emerald-300',
      wrong: 'bg-orange-200 border-orange-500 text-orange-900 scale-90'
    };
    return `${base} ${size} ${states[state] || states.idle}`;
  };

  return (
    <div className={`w-full ${className}`}>
      {mapTitle && (
        <div className="flex items-center justify-center gap-2 mb-2">
          <p className="text-center text-base font-bold text-slate-700">{mapTitle}</p>
          <SpeakButton text={mapTitle} language={language} label={`Read ${mapTitle} aloud`} />
        </div>
      )}

      <div
        className="relative w-full rounded-3xl overflow-hidden border-3 border-teal-300 shadow-md"
        style={{ paddingBottom: '75%', background: 'linear-gradient(160deg, #f0fdf4, #fef9c3, #dcfce7)' }}
      >
        {/* SVG connections layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {connections.map(([fromId, toId], i) => {
            const from = nodes.find(n => n.id === fromId);
            const to = nodes.find(n => n.id === toId);
            if (!from || !to) return null;
            return (
              <line
                key={i}
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke="#a8a29e"
                strokeWidth="1.5"
                strokeDasharray="4,3"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map(node => {
          const state = getNodeState(node);
          return (
            <button
              key={node.id}
              type="button"
              className={`${nodeStyle(state)} absolute -translate-x-1/2 -translate-y-1/2`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={() => handleNodeTap(node.id)}
              aria-label={node.label}
            >
              <span className="text-2xl sm:text-3xl">{node.icon}</span>
              <span className="text-xs font-bold mt-0.5 leading-tight text-center max-w-[56px] truncate">
                {node.label}
              </span>
            </button>
          );
        })}

        {/* Mode indicator */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-center">
          {mode === 'show' && (
            <span className="bg-yellow-100 border border-yellow-400 text-yellow-800 text-sm font-bold px-3 py-1 rounded-full">
              Watch the path… 👀
            </span>
          )}
          {mode === 'select' && (
            <span className="bg-teal-50 border border-teal-400 text-teal-800 text-sm font-bold px-3 py-1 rounded-full">
              Tap in order: {playerSequence.length}/{correctSequence.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
