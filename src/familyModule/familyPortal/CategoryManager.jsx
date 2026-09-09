import React, { useState, useEffect } from 'react';
import { familyDataService } from '../data/familyDataService';

const CategoryManager = ({ onDataUpdated }) => {
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit State
  const [newCatName, setNewCatName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null); // category string
  const [editCatName, setEditCatName] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [cats, mems] = await Promise.all([
      familyDataService.getCategories(),
      familyDataService.getMembers(),
    ]);
    setCategories(cats);
    setMembers(mems);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    if (categories.includes(trimmed)) {
      alert('This category already exists.');
      return;
    }

    await familyDataService.saveCategory(null, trimmed);
    setNewCatName('');
    setStatusMessage(`Added group "${trimmed}".`);
    await loadData();
    if (onDataUpdated) onDataUpdated();
  };

  const handleStartRename = (cat) => {
    setEditingCategory(cat);
    setEditCatName(cat);
  };

  const handleSaveRename = async (oldCat) => {
    const trimmed = editCatName.trim();
    if (!trimmed || trimmed === oldCat) {
      setEditingCategory(null);
      return;
    }

    await familyDataService.saveCategory(oldCat, trimmed);
    setEditingCategory(null);
    setStatusMessage(`Renamed "${oldCat}" to "${trimmed}".`);
    await loadData();
    if (onDataUpdated) onDataUpdated();
  };

  const handleDeleteCategory = async (cat) => {
    const count = members.filter((m) => m.category === cat).length;
    const confirmDelete = window.confirm(
      `Delete category "${cat}"? ${
        count > 0 ? `${count} members will be marked as 'Uncategorized'.` : ''
      }`
    );

    if (confirmDelete) {
      await familyDataService.deleteCategory(cat);
      setStatusMessage(`Deleted "${cat}".`);
      await loadData();
      if (onDataUpdated) onDataUpdated();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-xl font-bold text-slate-800">Social Circles & Categories</h3>
        <p className="text-sm text-slate-500">
          Manage the social groups used in the Category Sorting Game and relative profiles.
        </p>
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

      {/* Add New Category Form */}
      <form
        onSubmit={handleAddCategory}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 max-w-xl"
      >
        <input
          type="text"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          placeholder="New Category Name (e.g. Village Neighbours, College Friends)"
          className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={!newCatName.trim()}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-sm shrink-0"
        >
          Add Group
        </button>
      </form>

      {/* Category List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden max-w-2xl shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading categories...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categories.map((cat, idx) => {
              const memberCount = members.filter((m) => m.category === cat).length;
              const isRenaming = editingCategory === cat;

              return (
                <div
                  key={idx}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  {isRenaming ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(cat)}
                        className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">{cat}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {memberCount} {memberCount === 1 ? 'member' : 'members'} enrolled
                      </p>
                    </div>
                  )}

                  {!isRenaming && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleStartRename(cat)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-lg text-xs transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;

