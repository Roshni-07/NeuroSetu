import React, { useState, useEffect } from 'react';
import { familyDataService } from '../data/familyDataService';

const TIERS = [
  { generation: -1, title: 'Grandparents & Parents', icon: '👴👵', desc: 'Elders, mother, father' },
  { generation: 0, title: 'Self, Spouse & Siblings', icon: '👨👩', desc: 'Elder patient, wife/husband, brothers, sisters' },
  { generation: 1, title: 'Children & In-Laws', icon: '🧑👧', desc: 'Sons, daughters, daughters-in-law' },
  { generation: 2, title: 'Grandchildren', icon: '👶', desc: 'Grandsons, granddaughters' },
];

const FamilyTreeSetup = ({ onDataUpdated }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    const mems = await familyDataService.getMembers();
    setMembers(mems);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChangeGeneration = async (member, newGen) => {
    const updated = { ...member, generation: parseInt(newGen, 10) };
    await familyDataService.saveMember(updated);
    setStatusMessage(`Moved ${member.name} to ${TIERS.find((t) => t.generation === parseInt(newGen, 10))?.title}.`);
    await loadData();
    if (onDataUpdated) onDataUpdated();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-xl font-bold text-slate-800">Family Tree Generations Setup</h3>
        <p className="text-sm text-slate-500">
          Organize which generation tier each family member belongs to in the Family Tree Builder game.
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

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading family tiers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TIERS.map((tier) => {
            const tierMembers = members.filter((m) => m.generation === tier.generation);

            return (
              <div
                key={tier.generation}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tier.icon}</span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{tier.title}</h4>
                        <span className="text-xs text-slate-400">{tier.desc}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                      {tierMembers.length} {tierMembers.length === 1 ? 'person' : 'people'}
                    </span>
                  </div>

                  {/* List of members in this tier */}
                  <div className="space-y-2 mt-4">
                    {tierMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0"
                          />
                          <div className="truncate">
                            <span className="font-bold text-slate-800 block truncate">
                              {member.name}
                            </span>
                            <span className="text-xs text-teal-700 font-medium">
                              {member.relationship}
                            </span>
                          </div>
                        </div>

                        {/* Quick switch generation dropdown */}
                        <select
                          value={member.generation}
                          onChange={(e) => handleChangeGeneration(member, e.target.value)}
                          className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-700 focus:ring-1 focus:ring-teal-500 shrink-0 ml-2"
                        >
                          {TIERS.map((t) => (
                            <option key={t.generation} value={t.generation}>
                              Move to: {t.title.split(' ')[0]}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}

                    {tierMembers.length === 0 && (
                      <div className="py-6 text-center text-xs text-slate-400 italic">
                        No family members currently assigned to this tier.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FamilyTreeSetup;

