import React, { useState } from 'react';
import { sounds } from '../utils/soundEffects.js';

/**
 * DragDropZone - Accessible sorting/ordering/placement component
 * 
 * Includes DUAL-INTERACTION MODE:
 * 1. HTML5 Drag-and-Drop for mouse users.
 * 2. Tap-to-Select then Tap-to-Place fallback for elderly touch / tremor accessibility.
 */
export default function DragDropZone({
  items = [],
  zones = [],
  assignments = {}, // { [itemId]: zoneId }
  onAssign,
  unassignedTitle = 'Items to place (Tap or Drag):',
  disabled = false,
  language = 'en',
  className = ''
}) {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [dragOverZoneId, setDragOverZoneId] = useState(null);

  // Group items by assignment
  const unassignedItems = items.filter((item) => !assignments[item.id]);

  const getItemsInZone = (zoneId) => {
    return items.filter((item) => assignments[item.id] === zoneId);
  };

  // Tap-to-place workflow
  const handleItemClick = (item) => {
    if (disabled) return;
    sounds.playGentleTap();
    if (selectedItemId === item.id) {
      setSelectedItemId(null); // deselect
    } else {
      setSelectedItemId(item.id);
    }
  };

  const handleZoneClick = (zoneId) => {
    if (disabled) return;
    if (selectedItemId) {
      sounds.playMatchChime();
      if (onAssign) {
        onAssign(selectedItemId, zoneId);
      }
      setSelectedItemId(null);
    }
  };

  const handleUnassignClick = (itemId) => {
    if (disabled) return;
    sounds.playGentleTap();
    if (onAssign) {
      onAssign(itemId, null);
    }
    if (selectedItemId === itemId) setSelectedItemId(null);
  };

  // Native drag & drop
  const handleDragStart = (e, item) => {
    if (disabled) return;
    e.dataTransfer.setData('text/plain', item.id);
    setSelectedItemId(item.id);
  };

  const handleDragOver = (e, zoneId) => {
    e.preventDefault();
    if (dragOverZoneId !== zoneId) {
      setDragOverZoneId(zoneId);
    }
  };

  const handleDragLeave = (zoneId) => {
    if (dragOverZoneId === zoneId) {
      setDragOverZoneId(null);
    }
  };

  const handleDrop = (e, zoneId) => {
    e.preventDefault();
    setDragOverZoneId(null);
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId && onAssign) {
      sounds.playMatchChime();
      onAssign(itemId, zoneId);
      setSelectedItemId(null);
    }
  };

  return (
    <div className={`space-y-6 w-full ${className}`}>
      {/* Drop Zones (Targets) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {zones.map((zone) => {
          const zoneItems = getItemsInZone(zone.id);
          const isOver = dragOverZoneId === zone.id;
          const isTargeted = selectedItemId && !assignments[selectedItemId];

          return (
            <div
              key={zone.id}
              onClick={() => handleZoneClick(zone.id)}
              onDragOver={(e) => handleDragOver(e, zone.id)}
              onDragLeave={() => handleDragLeave(zone.id)}
              onDrop={(e) => handleDrop(e, zone.id)}
              className={`p-4 rounded-2xl border-2 transition-all min-h-[160px] flex flex-col ${
                isOver
                  ? 'border-teal-600 bg-teal-50 ring-4 ring-teal-500/20 shadow-md'
                  : isTargeted
                  ? 'border-dashed border-teal-500 bg-teal-50/40 cursor-pointer hover:bg-teal-50 animate-pulse'
                  : 'border-slate-300 bg-white shadow-sm'
              }`}
            >
              {/* Zone Header */}
              <div className="flex items-center space-x-3 mb-3 pb-2 border-b border-slate-100">
                <span className="text-3xl p-2 bg-teal-50 rounded-xl">{zone.icon}</span>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 leading-tight">
                    {zone.title}
                  </h4>
                  {zone.subtitle && (
                    <p className="text-sm text-slate-500 font-medium">{zone.subtitle}</p>
                  )}
                </div>
              </div>

              {/* Items placed in this zone */}
              <div className="flex-1 flex flex-wrap content-start gap-2 min-h-[70px]">
                {zoneItems.length === 0 ? (
                  <div className="w-full flex items-center justify-center text-slate-400 text-base italic py-4">
                    {isTargeted ? '👉 Tap here to place item' : 'Empty zone'}
                  </div>
                ) : (
                  zoneItems.map((item) => (
                    <div
                      key={item.id}
                      className="inline-flex items-center bg-teal-100 text-teal-950 border border-teal-300 px-3 py-2 rounded-xl text-lg font-semibold shadow-sm space-x-2"
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                      {!disabled && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnassignClick(item.id);
                          }}
                          className="ml-1 text-slate-500 hover:text-rose-600 p-1 rounded-full hover:bg-white/60 text-base"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unassigned Items Pool */}
      <div className="bg-teal-50/70 border-2 border-teal-200/80 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg sm:text-xl font-bold text-slate-800">
            {unassignedTitle}
          </h4>
          {selectedItemId && (
            <span className="text-sm font-semibold text-teal-800 bg-teal-100 px-3 py-1 rounded-full animate-bounce">
              Item selected! Tap a box above ⬆
            </span>
          )}
        </div>

        {unassignedItems.length === 0 ? (
          <div className="text-center py-4 text-emerald-800 font-semibold text-lg flex items-center justify-center space-x-2">
            <span>✨</span>
            <span>All items have been placed!</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {unassignedItems.map((item) => {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  draggable={!disabled}
                  onDragStart={(e) => handleDragStart(e, item)}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl border-2 font-bold text-lg cursor-pointer select-none transition-all duration-150 min-h-[52px] ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-700 shadow-md ring-4 ring-teal-500/30 scale-105'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-teal-500 hover:bg-teal-50/50 shadow-sm active:scale-95'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
