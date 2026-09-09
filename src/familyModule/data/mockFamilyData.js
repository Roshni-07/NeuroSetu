export const mockMembers = [
  {
    id: "m1",
    name: "Bhaben Kalita",
    photoUrl: "https://ui-avatars.com/api/?name=Bhaben+Kalita&background=0D9488&color=fff&size=200",
    relationship: "Self",
    category: "Immediate Family",
    bio: "Retired school teacher. Loves tending to his tea garden.",
    generation: 0,
    dateOfBirth: "1952-04-14"
  },
  {
    id: "m2",
    name: "Nandita Kalita",
    photoUrl: "https://ui-avatars.com/api/?name=Nandita+Kalita&background=C2410C&color=fff&size=200",
    relationship: "Wife",
    category: "Immediate Family",
    bio: "Makes the best pithas during Bihu. An excellent weaver.",
    generation: 0,
    dateOfBirth: "1955-08-22"
  },
  {
    id: "m3",
    name: "Arup Kalita",
    photoUrl: "https://ui-avatars.com/api/?name=Arup+Kalita&background=059669&color=fff&size=200",
    relationship: "Son",
    category: "Immediate Family",
    bio: "Works in Guwahati. Visits every Magh Bihu.",
    generation: 1,
    dateOfBirth: "1980-05-10"
  },
  {
    id: "m4",
    name: "Rumi Kalita",
    photoUrl: "https://ui-avatars.com/api/?name=Rumi+Kalita&background=E11D48&color=fff&size=200",
    relationship: "Daughter-in-law",
    category: "Immediate Family",
    bio: "Software engineer. Loves reading Assamese literature.",
    generation: 1,
    dateOfBirth: "1982-11-05"
  },
  {
    id: "m5",
    name: "Arnab Kalita",
    photoUrl: "https://ui-avatars.com/api/?name=Arnab+Kalita&background=0D9488&color=fff&size=200",
    relationship: "Grandson",
    category: "Immediate Family",
    bio: "In 5th grade. Learning to play the Dhol.",
    generation: 2,
    dateOfBirth: "2013-09-15"
  },
  {
    id: "m6",
    name: "Pradip Sarma",
    photoUrl: "https://ui-avatars.com/api/?name=Pradip+Sarma&background=475569&color=fff&size=200",
    relationship: "Older Brother",
    category: "Paternal Relatives",
    bio: "Lives in Tezpur. Always tells stories from childhood.",
    generation: 0,
    dateOfBirth: "1948-02-12"
  },
  {
    id: "m7",
    name: "Jyoti Barua",
    photoUrl: "https://ui-avatars.com/api/?name=Jyoti+Barua&background=D97706&color=fff&size=200",
    relationship: "Cousin",
    category: "Maternal Relatives",
    bio: "Famous for her vocal performances in local Bihu functions.",
    generation: 0,
    dateOfBirth: "1954-12-01"
  },
  {
    id: "m8",
    name: "Hemanta Das",
    photoUrl: "https://ui-avatars.com/api/?name=Hemanta+Das&background=0F172A&color=fff&size=200",
    relationship: "Friend",
    category: "School Friends",
    bio: "Childhood friend from village school. Used to play football together.",
    generation: 0,
    dateOfBirth: "1952-06-18"
  },
  {
    id: "m9",
    name: "Late Khagen Kalita",
    photoUrl: "https://ui-avatars.com/api/?name=Khagen+Kalita&background=64748B&color=fff&size=200",
    relationship: "Father",
    category: "Paternal Relatives",
    bio: "Was the village headman. Loved agriculture.",
    generation: -1,
    dateOfBirth: "1920-01-01"
  },
  {
    id: "m10",
    name: "Late Sabita Kalita",
    photoUrl: "https://ui-avatars.com/api/?name=Sabita+Kalita&background=64748B&color=fff&size=200",
    relationship: "Mother",
    category: "Paternal Relatives",
    bio: "Known for her kindness and traditional weaving skills.",
    generation: -1,
    dateOfBirth: "1925-05-15"
  }
];

export const mockCategories = [
  "Immediate Family",
  "Paternal Relatives",
  "Maternal Relatives",
  "School Friends"
];

export const mockTimelineEvents = [
  {
    id: "e1",
    title: "Birth in Sualkuchi",
    date: "1952",
    description: "Born in the silk village of Sualkuchi, Assam.",
    relatedMemberIds: ["m1", "m9", "m10"]
  },
  {
    id: "e2",
    title: "Started First Job as Teacher",
    date: "1975",
    description: "Joined the local high school as a mathematics teacher.",
    relatedMemberIds: ["m1"]
  },
  {
    id: "e3",
    title: "Wedding with Nandita",
    date: "1978",
    description: "A beautiful traditional Assamese wedding ceremony.",
    relatedMemberIds: ["m1", "m2", "m6"]
  },
  {
    id: "e4",
    title: "Birth of Son, Arup",
    date: "1980",
    description: "Welcomed their first child into the world.",
    relatedMemberIds: ["m1", "m2", "m3"]
  },
  {
    id: "e5",
    title: "Grandson Arnab was born",
    date: "2013",
    description: "Became a grandfather. A joyous occasion for the whole family.",
    relatedMemberIds: ["m1", "m2", "m3", "m4", "m5"]
  },
  {
    id: "e6",
    title: "Retirement and Tea Gardening",
    date: "2015",
    description: "Retired from teaching and started cultivating a small tea garden at home.",
    relatedMemberIds: ["m1", "m2"]
  }
];

// Simple grid slot mapping for Family Tree
export const mockFamilyTree = [
  { generation: -1, position: 0, memberId: "m9" },
  { generation: -1, position: 1, memberId: "m10" },
  { generation: 0, position: 0, memberId: "m6" },
  { generation: 0, position: 1, memberId: "m1" },
  { generation: 0, position: 2, memberId: "m2" },
  { generation: 1, position: 0, memberId: "m3" },
  { generation: 1, position: 1, memberId: "m4" },
  { generation: 2, position: 0, memberId: "m5" }
];

