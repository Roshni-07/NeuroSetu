import React, { useState, useEffect } from 'react';
import { familyDataService } from '../data/familyDataService';

const INITIAL_EVENT_FORM = {
  id: '',
  title: '',
  date: '',
  description: '',
  relatedMemberIds: [],
};

const TimelineManager = ({ onDataUpdated }) => {
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(INITIAL_EVENT_FORM);
  const [statusMessage, setStatusMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [evs, mems] = await Promise.all([
      familyDataService.getTimelineEvents(),
      familyDataService.getMembers(),
    ]);
    setEvents(evs);
    setMembers(mems);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData(INITIAL_EVENT_FORM);
    setIsEditing(true);
    setStatusMessage('');
  };

  const handleOpenEdit = (event) => {
    setFormData({
      id: event.id,
      title: event.title || '',
      date: event.date || '',
      description: event.description || '',
      relatedMemberIds: event.relatedMemberIds || [],
    });
    setIsEditing(true);
    setStatusMessage('');
  };

  const toggleRelatedMember = (memberId) => {
    setFormData((prev) => {
      const exists = prev.relatedMemberIds.includes(memberId);
      return {
        ...prev,
        relatedMemberIds: exists
          ? prev.relatedMemberIds.filter((id) => id !== memberId)
          : [...prev.relatedMemberIds, memberId],
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a title for the life milestone.');
      return;
    }
    if (!formData.date) {
      alert('Please specify the approximate year or date.');
      return;
    }

    await familyDataService.saveTimelineEvent(formData);
    setStatusMessage(`Saved "${formData.title}".`);
    setIsEditing(false);
    await loadData();
    if (onDataUpdated) onDataUpdated();
  };

  const handleDelete = async (event) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the event "${event.title}"?`
    );
    if (confirmDelete) {
      await familyDataService.deleteTimelineEvent(event.id);
      setStatusMessage(`Deleted "${event.title}".`);
      await loadData();
      if (onDataUpdated) onDataUpdated();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Life Story Milestones</h3>
          <p className="text-sm text-slate-500">
            Record memorable chapters, weddings, achievements, and celebrations to power the Life Story Timeline Game.
          </p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <span>+</span>
            <span>Add Life Milestone</span>
          </button>
        )}
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center justify-between">
          <span>✓ {statusMessage}</span>
          <button
            onClick={() => setStatusMessage('')}
            className="text-emerald-600 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {isEditing ? (
        /* Event Form */
        <form
          onSubmit={handleSave}
          className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-5 max-w-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="font-bold text-slate-800 text-lg">
              {formData.id ? 'Edit Milestone' : 'Add New Life Milestone'}
            </h4>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-600 font-bold text-sm"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Wedding with Nandita"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Year / Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Approximate Year / Date *
              </label>
              <input
                type="text"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="e.g. 1978 or 1978-11-20"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Short Description / Memory Narrative
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. A joyous wedding ceremony in Sualkuchi with traditional muga silk and family feasting."
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Related Family Members Multi-Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Associated Family Members
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-300 rounded-xl max-h-40 overflow-y-auto">
              {members.map((member) => {
                const isSelected = formData.relatedMemberIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleRelatedMember(member.id)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all
                      ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }
                    `}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{member.name}</span>
                    <span className="opacity-75 text-[10px]">({member.relationship})</span>
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Tagging relatives connects their profiles to this memory in game hints.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-sm transition"
            >
              {formData.id ? 'Update Milestone' : 'Save Milestone'}
            </button>
          </div>
        </form>
      ) : (
        /* Event Cards List */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading life events...</div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No milestones recorded yet. Click "Add Life Milestone" above to record one.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        📅 {ev.date}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">{ev.title}</h4>
                    </div>
                    <p className="text-sm text-slate-600 max-w-xl">{ev.description}</p>
                    {ev.relatedMemberIds?.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1 text-xs text-slate-500">
                        <span className="font-semibold text-slate-400">With:</span>
                        {ev.relatedMemberIds.map((mId) => {
                          const m = members.find((mem) => mem.id === mId);
                          return m ? (
                            <span
                              key={mId}
                              className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700"
                            >
                              {m.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(ev)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ev)}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-lg text-xs transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimelineManager;

