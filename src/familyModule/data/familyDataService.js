import { mockMembers, mockCategories, mockTimelineEvents, mockFamilyTree } from './mockFamilyData';

// In-memory store
let members = [...mockMembers];
let categories = [...mockCategories];
let timelineEvents = [...mockTimelineEvents];
let familyTree = [...mockFamilyTree];

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const familyDataService = {
  // --- Members ---
  getMembers: async () => {
    await delay();
    return [...members];
  },
  saveMember: async (member) => {
    await delay();
    if (member.id) {
      members = members.map(m => m.id === member.id ? member : m);
    } else {
      const newMember = { ...member, id: `m${Date.now()}` };
      members.push(newMember);
    }
    return true;
  },
  deleteMember: async (id) => {
    await delay();
    members = members.filter(m => m.id !== id);
    // Cleanup references
    timelineEvents = timelineEvents.map(e => ({
      ...e,
      relatedMemberIds: e.relatedMemberIds.filter(mId => mId !== id)
    }));
    familyTree = familyTree.map(slot => slot.memberId === id ? { ...slot, memberId: null } : slot);
    return true;
  },

  // --- Categories ---
  getCategories: async () => {
    await delay();
    return [...categories];
  },
  saveCategory: async (oldCategory, newCategory) => {
    await delay();
    if (oldCategory) {
      categories = categories.map(c => c === oldCategory ? newCategory : c);
      members = members.map(m => m.category === oldCategory ? { ...m, category: newCategory } : m);
    } else {
      if (!categories.includes(newCategory)) {
        categories.push(newCategory);
      }
    }
    return true;
  },
  deleteCategory: async (category) => {
    await delay();
    categories = categories.filter(c => c !== category);
    members = members.map(m => m.category === category ? { ...m, category: 'Uncategorized' } : m);
    return true;
  },

  // --- Timeline Events ---
  getTimelineEvents: async () => {
    await delay();
    return [...timelineEvents].sort((a, b) => parseInt(a.date) - parseInt(b.date));
  },
  saveTimelineEvent: async (event) => {
    await delay();
    if (event.id) {
      timelineEvents = timelineEvents.map(e => e.id === event.id ? event : e);
    } else {
      const newEvent = { ...event, id: `e${Date.now()}` };
      timelineEvents.push(newEvent);
    }
    return true;
  },
  deleteTimelineEvent: async (id) => {
    await delay();
    timelineEvents = timelineEvents.filter(e => e.id !== id);
    return true;
  },

  // --- Family Tree ---
  getFamilyTree: async () => {
    await delay();
    return [...familyTree];
  },
  saveFamilyTree: async (newTreeSlots) => {
    await delay();
    familyTree = [...newTreeSlots];
    return true;
  }
};

