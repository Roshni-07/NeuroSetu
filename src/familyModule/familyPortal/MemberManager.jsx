import React, { useState, useEffect } from 'react';
import { familyDataService } from '../data/familyDataService';

const GENERATION_OPTIONS = [
  { value: -1, label: 'Parents & Elders (Generation -1)' },
  { value: 0, label: 'Self, Spouse & Siblings (Generation 0)' },
  { value: 1, label: 'Children & Spouses (Generation 1)' },
  { value: 2, label: 'Grandchildren (Generation 2)' },
];

const INITIAL_FORM = {
  id: '',
  name: '',
  relationship: '',
  category: '',
  generation: 0,
  bio: '',
  photoUrl: '',
  dateOfBirth: '',
};

const MemberManager = ({ onDataUpdated }) => {
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [previewPhoto, setPreviewPhoto] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [mems, cats] = await Promise.all([
      familyDataService.getMembers(),
      familyDataService.getCategories(),
    ]);
    setMembers(mems);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      ...INITIAL_FORM,
      category: categories[0] || 'Immediate Family',
    });
    setPreviewPhoto('');
    setIsEditing(true);
    setStatusMessage('');
  };

  const handleOpenEdit = (member) => {
    setFormData({
      id: member.id,
      name: member.name || '',
      relationship: member.relationship || '',
      category: member.category || categories[0] || '',
      generation: member.generation ?? 0,
      bio: member.bio || '',
      photoUrl: member.photoUrl || '',
      dateOfBirth: member.dateOfBirth || '',
    });
    setPreviewPhoto(member.photoUrl || '');
    setIsEditing(true);
    setStatusMessage('');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPhoto(reader.result);
        setFormData((prev) => ({ ...prev, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a name for the family member.');
      return;
    }

    // Default avatar if no photo uploaded
    const photo =
      formData.photoUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=0D9488&color=fff&size=200`;

    const memberToSave = {
      ...formData,
      photoUrl: photo,
      generation: parseInt(formData.generation, 10),
    };

    await familyDataService.saveMember(memberToSave);
    setStatusMessage(`Saved "${memberToSave.name}" successfully.`);
    setIsEditing(false);
    await loadData();
    if (onDataUpdated) onDataUpdated();
  };

  const handleDelete = async (member) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove ${member.name} from family records?`
    );
    if (confirmDelete) {
      await familyDataService.deleteMember(member.id);
      setStatusMessage(`Removed ${member.name}.`);
      await loadData();
      if (onDataUpdated) onDataUpdated();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Family Members</h3>
          <p className="text-sm text-slate-500">
            Enter relatives, photos, and personal memories to power the cognitive games.
          </p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <span>+</span>
            <span>Add Family Member</span>
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

      {/* Form modal / inline form */}
      {isEditing ? (
        <form
          onSubmit={handleSave}
          className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6 max-w-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="font-bold text-slate-800 text-lg">
              {formData.id ? 'Edit Family Member' : 'Add New Family Member'}
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
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Bhaben Kalita"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Relationship *
              </label>
              <input
                type="text"
                required
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                placeholder="e.g. Son, Wife, Older Brother"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Social Group / Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Generation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Family Tree Row (Generation)
              </label>
              <select
                value={formData.generation}
                onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {GENERATION_OPTIONS.map((gen) => (
                  <option key={gen.value} value={gen.value}>
                    {gen.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date of Birth / Year (Optional)
              </label>
              <input
                type="text"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                placeholder="e.g. 1955-08-22 or 1955"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Photo (Upload from device)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Photo Preview */}
          {previewPhoto && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
              <img
                src={previewPhoto}
                alt="Preview"
                className="w-16 h-16 rounded-full object-cover border border-slate-300"
              />
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-700 block">Photo Preview</span>
                This photo will appear in the Identity Recall, Tree Builder, and Sorting games.
              </div>
            </div>
          )}

          {/* Bio / Clues */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Personal Bio / Memory Clues (1-2 sentences)
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="e.g. Retired teacher. Loves tending to his tea garden in Sualkuchi."
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Shown when the user correctly identifies this relative or asks for hints.
            </span>
          </div>

          {/* Submit buttons */}
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
              {formData.id ? 'Update Member' : 'Save Member'}
            </button>
          </div>
        </form>
      ) : (
        /* Member List Table */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No members found. Click "Add Family Member" above to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4">Relative</th>
                    <th className="py-3.5 px-4">Relationship</th>
                    <th className="py-3.5 px-4">Group / Category</th>
                    <th className="py-3.5 px-4">Generation</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {member.name}
                            </span>
                            {member.bio && (
                              <span className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                                {member.bio}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {member.relationship}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {member.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-600">
                        {member.generation === -1
                          ? 'Parents/Elders'
                          : member.generation === 0
                          ? 'Self/Siblings'
                          : member.generation === 1
                          ? 'Children'
                          : 'Grandchildren'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(member)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(member)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-lg text-xs transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberManager;

