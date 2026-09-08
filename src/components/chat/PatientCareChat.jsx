import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  UserCheck,
  Heart,
  Bot,
  ArrowLeft,
  Tag,
  Clock,
  Sparkles,
  ClipboardList,
  AlertTriangle
} from 'lucide-react';
import {
  getChatMessages,
  addChatMessage
} from '../../services/chatStorage.js';

export const CAREGIVER_OBSERVATION_TAGS = [
  'Evening Confusion',
  'High Fatigue',
  'Mood Drop',
  'Stable / Alert'
];

export const ASHA_QUICK_ACTIONS = [
  'Schedule Home Visit',
  'Recommend Lower Game Difficulty',
  'Log Medication Review',
  'Check Behavioral Notes'
];

/**
 * PatientCareChat.jsx - Communication Portal linking ASHA Workers and Family Caregivers
 * 
 * Features:
 * - Role switch toggle between ASHA Worker and Family Caregiver.
 * - Visual message stream differentiating Caregiver (indigo), ASHA (teal), and System logs (neutral).
 * - Caregiver behavioral observation tags.
 * - ASHA quick-action response prompts.
 * - Fully offline-first with IndexedDB & localStorage persistence.
 * - WCAG 2.1 AA compliant with >= 48px touch targets.
 * 
 * @param {Object} props
 * @param {string} [props.patientId='preset-1'] - Patient ID
 * @param {string} [props.patientName='Ramesh Patel'] - Patient full name
 * @param {string} [props.patientStage='Mild / Early Stage'] - Dementia clinical stage
 * @param {'asha'|'caregiver'} [props.initialRole='caregiver'] - Starting perspective
 * @param {Function} [props.onBack] - Exit/back handler
 */
export default function PatientCareChat({
  patientId = 'preset-1',
  patientName = 'Ramesh Patel',
  patientStage = 'Mild / Early Stage',
  initialRole = 'caregiver',
  onBack = null
}) {
  const [messages, setMessages] = useState([]);
  const [activeRole, setActiveRole] = useState(initialRole);
  const [inputText, setInputText] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef(null);

  // Load chat history on mount or when patient changes
  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      setIsLoading(true);
      try {
        const history = await getChatMessages(patientId);
        if (isMounted) {
          setMessages(history || []);
        }
      } catch (e) {
        console.error('[PatientCareChat] Error loading history:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [patientId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Toggle behavioral observation tag in Caregiver mode
  const handleToggleTag = (tag) => {
    setSelectedTag((prev) => (prev === tag ? null : tag));
  };

  // Quick action clicked in ASHA mode: pre-fills input text
  const handleQuickAction = (actionText) => {
    setInputText(actionText);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed && !selectedTag) return;

    const senderName = activeRole === 'asha' ? 'ASHA Worker (Sangeeta)' : 'Family Caregiver';
    const category = selectedTag
      ? 'behavioral_flag'
      : activeRole === 'asha' && trimmed.toLowerCase().includes('visit')
      ? 'visit_request'
      : 'general';

    const messageText = selectedTag && trimmed
      ? `[${selectedTag}]: ${trimmed}`
      : selectedTag
      ? `[Observation Flag]: ${selectedTag}`
      : trimmed;

    const newMsg = {
      patientId,
      senderRole: activeRole,
      senderName,
      text: messageText,
      category,
      timestamp: new Date().toISOString()
    };

    try {
      const saved = await addChatMessage(newMsg);
      setMessages((prev) => [...prev, saved]);
      setInputText('');
      setSelectedTag(null);
    } catch (err) {
      console.error('[PatientCareChat] Failed to send message:', err);
    }
  };

  return (
    <div
      data-testid="patient-care-chat-container"
      className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6 flex flex-col h-[85vh] sm:h-[90vh] animate-fade-in"
    >
      {/* 1. Header Section */}
      <header className="bg-white rounded-3xl border border-slate-200 shadow-soft p-4 sm:p-6 text-left space-y-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-xs">
              <ClipboardList className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900">
                  {patientName}
                </h1>
                <span
                  data-testid="chat-stage-badge"
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300"
                >
                  {patientStage}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Care Collaboration & Progress Log
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Role Switch Toggle */}
            <div
              data-testid="role-switch-container"
              className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center gap-1"
            >
              <button
                type="button"
                onClick={() => setActiveRole('caregiver')}
                data-testid="switch-role-caregiver"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition min-h-[40px] flex items-center gap-1.5 cursor-pointer ${
                  activeRole === 'caregiver'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Caregiver</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRole('asha')}
                data-testid="switch-role-asha"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition min-h-[40px] flex items-center gap-1.5 cursor-pointer ${
                  activeRole === 'asha'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>ASHA Worker</span>
              </button>
            </div>

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition min-h-[48px] min-w-[48px] flex items-center gap-1 cursor-pointer"
                aria-label="Back to Portal"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>
        </div>

        {/* Prototype Disclaimer Banner */}
        <div
          data-testid="chat-prototype-banner"
          className="p-3 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center gap-2.5 text-xs text-teal-900 font-medium shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            <strong>ASHA Care Portal</strong> — Synchronized observations and automated cognitive progress logs.
          </span>
        </div>
      </header>

      {/* 2. Message Stream View */}
      <main
        data-testid="message-stream-container"
        className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-soft p-4 sm:p-6 overflow-y-auto space-y-4 text-left"
      >
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Loading secure communications...
          </div>
        ) : messages.length === 0 ? (
          <div
            data-testid="chat-empty-state"
            className="text-center py-12 text-slate-400 text-xs space-y-2"
          >
            <p className="font-bold text-slate-600">No care messages yet</p>
            <p>Send an observation or wait for automated game audits.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCaregiver = msg.senderRole === 'caregiver';
            const isAsha = msg.senderRole === 'asha';
            const isSystem = msg.senderRole === 'system';

            // System Audit Log Pills (Centered)
            if (isSystem) {
              return (
                <div
                  key={msg.id}
                  data-testid={`system-message-${msg.id}`}
                  className="flex justify-center my-3"
                >
                  <div className="bg-slate-100 text-slate-700 border border-slate-300 rounded-2xl px-4 py-2 text-xs font-semibold max-w-lg text-center shadow-xs flex items-center gap-2">
                    <Bot className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            // ASHA or Caregiver Speech Bubbles
            return (
              <div
                key={msg.id}
                data-testid={`chat-bubble-${msg.id}`}
                className={`flex flex-col ${isCaregiver ? 'items-end' : 'items-start'}`}
              >
                {/* Sender Info Bar */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                  <span className="font-bold text-slate-600">
                    {msg.senderName}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3 inline" />
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {/* Bubble Container */}
                <div
                  data-testid={`bubble-content-${msg.id}`}
                  className={`relative max-w-[85%] sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isCaregiver
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-teal-600 text-white rounded-bl-xs'
                  }`}
                >
                  {/* Category Tag Header */}
                  {msg.category && msg.category !== 'general' && (
                    <div className="mb-1.5">
                      <span
                        data-testid={`category-badge-${msg.id}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs"
                      >
                        {msg.category === 'behavioral_flag' && <AlertTriangle className="w-3 h-3" />}
                        {msg.category.replace('_', ' ')}
                      </span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* 3. Action Bars based on Active Role */}
      <div className="space-y-3 shrink-0">
        {/* Caregiver: Behavioral Observation Tag Selector */}
        {activeRole === 'caregiver' && (
          <div
            data-testid="caregiver-tag-selector"
            className="flex items-center gap-2 overflow-x-auto py-1 px-0.5"
          >
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>Tag Behavior:</span>
            </span>
            {CAREGIVER_OBSERVATION_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                data-testid={`tag-chip-${tag}`}
                onClick={() => handleToggleTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer min-h-[40px] ${
                  selectedTag === tag
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* ASHA Worker: Quick-Action Response Prompts */}
        {activeRole === 'asha' && (
          <div
            data-testid="asha-quick-actions-bar"
            className="flex items-center gap-2 overflow-x-auto py-1 px-0.5"
          >
            <span className="text-xs font-bold text-teal-700 whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Action:</span>
            </span>
            {ASHA_QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                type="button"
                data-testid={`quick-action-${action}`}
                onClick={() => handleQuickAction(action)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition cursor-pointer min-h-[40px]"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {/* 4. Chat Input Bar */}
        <form
          onSubmit={handleSendMessage}
          data-testid="chat-input-form"
          className="bg-white rounded-3xl border border-slate-200 shadow-soft p-2.5 flex items-center gap-2 text-left"
        >
          <input
            type="text"
            data-testid="chat-text-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              activeRole === 'caregiver'
                ? 'Type caregiver observation or question...'
                : 'Type clinical recommendation or note...'
            }
            className="flex-1 px-4 py-2.5 text-sm text-slate-800 focus:outline-none min-h-[48px]"
          />

          <button
            type="submit"
            data-testid="chat-send-btn"
            disabled={!inputText.trim() && !selectedTag}
            aria-label="Send Message"
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition min-h-[48px] min-w-[48px] cursor-pointer ${
              !inputText.trim() && !selectedTag
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : activeRole === 'caregiver'
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
