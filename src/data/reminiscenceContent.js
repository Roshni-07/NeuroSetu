/**
 * reminiscenceContent.js - North Eastern Region (NER) Cultural Content Catalog
 * 
 * Curated cultural assets, folklore prompts, textile motifs, and culinary sequences
 * specifically designed for reminiscence therapy in elderly NER dementia patients.
 * Fully localized in Assamese ('as') with English context metadata.
 */

export const CULTURAL_CATEGORIES = {
  MUSIC_FESTIVALS: 'music_festivals',
  TEXTILES_WEAVES: 'textiles_weaves',
  DAILY_ROUTINE: 'daily_routine'
};

/**
 * 1. Memory Recall Tasks (Bihu Festivals, Instruments, and Cultural Symbols)
 */
export const MEMORY_RECALL_TASKS = [
  {
    id: 'mem_bihu_dhol',
    category: CULTURAL_CATEGORIES.MUSIC_FESTIVALS,
    title: 'বিহুৰ বাদ্য (Bihu Instrument)',
    promptAs: 'ছবিখন চাই কওক, এই বাদ্যবিধৰ নাম কি?',
    promptEn: 'Looking at this picture, what is the name of this instrument?',
    correctAnswer: 'dhol',
    acceptedAliases: ['ঢোল', 'dhol', 'drum', 'বিহু ঢোল'],
    icon: '🥁',
    visualDescription: 'কাঠ আৰু ছাগলীৰ চামৰাৰে তৈয়াৰী পৰম্পৰাগত বিহু ঢোল (Traditional wooden Bihu drum)',
    options: [
      { id: 'dhol', labelAs: 'ঢোল (Dhol)', labelEn: 'Bihu Drum', icon: '🥁' },
      { id: 'pepa', labelAs: 'পেঁপা (Pepa)', labelEn: 'Buffalo Horn Flute', icon: '📯' },
      { id: 'gogona', labelAs: 'গগনা (Gogona)', labelEn: 'Bamboo Jaw Harp', icon: '🎋' }
    ],
    hint: 'ই গছৰ কাঠ আৰু চামৰাৰে তৈয়াৰী, বিহু নৃত্যৰ মূল বাদ্য। (Made of wood and leather, the heartbeat of Bihu dance.)',
    gentlePrompt: 'মনত পেলাওকচোন, ৰঙালী বিহুত ঢুলীয়াই কি বজায়?'
  },
  {
    id: 'mem_bihu_pepa',
    category: CULTURAL_CATEGORIES.MUSIC_FESTIVALS,
    title: 'ম’হৰ শিংৰ পেঁপা (Buffalo Horn Pipe)',
    promptAs: 'ম’হৰ শিঙেৰে বনোৱা এই সুৰীয়া বাদ্যবিধ কি বাৰু?',
    promptEn: 'Which melodious instrument is crafted from buffalo horn?',
    correctAnswer: 'pepa',
    acceptedAliases: ['পেঁপা', 'pepa', 'শিং পেঁপা'],
    icon: '📯',
    visualDescription: 'ম’হৰ শিং আৰু বাঁহেৰে নিৰ্মিত পেঁপা (Traditional buffalo horn pipe)',
    options: [
      { id: 'pepa', labelAs: 'পেঁপা (Pepa)', labelEn: 'Pepa Horn', icon: '📯' },
      { id: 'dhol', labelAs: 'ঢোল (Dhol)', labelEn: 'Dhol', icon: '🥁' },
      { id: 'taal', labelAs: 'তাল (Taal)', labelEn: 'Bronze Cymbals', icon: '🔔' }
    ],
    hint: 'ম’হৰ শিঙৰ আগত এটা চোঙা লগাই ফুঁ দি বজোৱা হয়। (Blown using a horn tip to produce a piercing note.)',
    gentlePrompt: 'আহক আমি আকৌ এবাৰ চেষ্টা কৰোঁ। পেঁপাটো কেনেকুৱা দেখিবলৈ?'
  },
  {
    id: 'mem_bihu_kopou',
    category: CULTURAL_CATEGORIES.MUSIC_FESTIVALS,
    title: 'কপৌ ফুল (Foxtail Orchid)',
    promptAs: 'বিহু নাচনীয়ে খোপাত পিন্ধা এই ধুনীয়া ফুলপাহ কি?',
    promptEn: 'What is this beautiful orchid worn in the hair of Bihu dancers?',
    correctAnswer: 'kopou',
    acceptedAliases: ['কপৌ', 'kopou', 'kopou phool', 'orchid'],
    icon: '🌸',
    visualDescription: 'বেঙুনীয়া-বগা ৰঙৰ কপৌ ফুল (Purple and white Foxtail Orchid)',
    options: [
      { id: 'kopou', labelAs: 'কপৌ ফুল (Kopou Phool)', labelEn: 'Foxtail Orchid', icon: '🌸' },
      { id: 'tagar', labelAs: 'তগৰ ফুল (Tagar)', labelEn: 'Crepe Jasmine', icon: '🌼' },
      { id: 'golap', labelAs: 'গোলাপ (Golap)', labelEn: 'Rose', icon: '🌹' }
    ],
    hint: 'গছৰ ডালত ওলমি থকা বেঙুনীয়া বিহুৰ প্ৰতীক ফুল। (Hanging purple orchid, the symbol of spring in Assam.)',
    gentlePrompt: 'নাচনীয়ে বসন্ত কালত খোপাত কি সুগন্ধি ফুল গুজি লয়?'
  }
];

/**
 * 2. Pattern Recognition & Textile Matching Tasks (NER Silks & Weaves)
 */
export const TEXTILE_PATTERN_TASKS = [
  {
    id: 'pat_muga_silk',
    category: CULTURAL_CATEGORIES.TEXTILES_WEAVES,
    title: 'সোণালী মুগা বস্ত্ৰ (Assamese Golden Muga Silk)',
    promptAs: 'অসমৰ গৌৰৱ এই উজ্জ্বল সোণালী ৰঙৰ ৰেচমী কাপোৰবিধ কি?',
    promptEn: 'Identify Assam’s pride: this naturally golden shimmering silk.',
    correctAnswer: 'muga',
    acceptedAliases: ['মুগা', 'muga', 'সোণালী মুগা'],
    patternColor: '#D4AF37', // Golden amber
    motifName: 'কিংখাপ আৰু মকৰা বুটা (Kingkhap Motif)',
    options: [
      { id: 'muga', labelAs: 'মুগা পাট (Golden Muga Silk)', region: 'Assam', colorHex: '#D4AF37' },
      { id: 'puan', labelAs: 'মিজো পুয়ান (Mizo Puan)', region: 'Mizoram', colorHex: '#1F2937' },
      { id: 'naga_shawl', labelAs: 'নাগা শাল (Naga Shawl)', region: 'Nagaland', colorHex: '#991B1B' }
    ],
    hint: 'সোণৰ দৰে উজ্বলি থকা এই কাপোৰ কেৱল অসমতেই পোৱা যায়। (Golden silk unique only to the Brahmaputra valley.)',
    gentlePrompt: 'আমাৰ শালত বোৱা সোণালী সুতাৰ কাপোৰখন চিনাকি পাওঁকচোন।'
  },
  {
    id: 'pat_mizo_puan',
    category: CULTURAL_CATEGORIES.TEXTILES_WEAVES,
    title: 'মিজো পুয়ান বস্ত্ৰ (Mizo Puanchei)',
    promptAs: 'মিজোৰামৰ পৰম্পৰাগত ক’লা, বগা আৰু ৰঙা আঁচ থকা কাপোৰবিধ বাচক।',
    promptEn: 'Select the traditional Mizo handloom featuring striking red, black and white stripes.',
    correctAnswer: 'puan',
    acceptedAliases: ['পুয়ান', 'puan', 'mizo puan'],
    patternColor: '#B91C1C',
    motifName: 'পৰম্পৰাগত পুয়ানচেই আঁচ (Puanchei Geometric Weave)',
    options: [
      { id: 'puan', labelAs: 'মিজো পুয়ান (Puanchei)', region: 'Mizoram', colorHex: '#B91C1C' },
      { id: 'muga', labelAs: 'মুগা কাপোৰ (Muga Silk)', region: 'Assam', colorHex: '#D4AF37' },
      { id: 'eri', labelAs: 'এৰী চাদৰ (Eri Silk)', region: 'Meghalaya/Assam', colorHex: '#E5E7EB' }
    ],
    hint: 'মিজো মহিলাসকলে চাপচাৰ কুট উৎসৱত পিন্ধা বিশেষ সাজ। (Worn by Mizo women during Chapchar Kut celebrations.)',
    gentlePrompt: 'আহক আমি ৰংবোৰ চাওঁ: ক’লা, ৰঙা আৰু বগা আঁচবোৰ মন কৰক।'
  }
];

/**
 * 3. Daily Routine & Culinary Sequencing Tasks (Assam Chai & Daily Habits)
 */
export const CULINARY_SEQUENCING_TASKS = [
  {
    id: 'seq_assam_tea',
    category: CULTURAL_CATEGORIES.DAILY_ROUTINE,
    title: 'সোৱাদভৰা অসমীয়া চাহ (Preparing Assam Tea)',
    promptAs: 'সোৱাদভৰা ৰঙা বা গাখীৰ চাহ তৈয়াৰ কৰাৰ সঠিক ক্ৰমটো সজাওক:',
    promptEn: 'Arrange the correct steps for preparing a warm cup of Assam tea:',
    steps: [
      { id: 'step_1', order: 1, textAs: '১. চচপেনত পানী লৈ ভালদৰে উতলাওক', textEn: '1. Boil fresh water in the kettle', icon: '🫖' },
      { id: 'step_2', order: 2, textAs: '২. সুগন্ধি অসম চাহপাত আৰু আদা দিয়ক', textEn: '2. Add Assam tea leaves and ginger', icon: '🍃' },
      { id: 'step_3', order: 3, textAs: '৩. সোৱাদ অনুসৰি গাখীৰ আৰু চেনি দিয়ক', textEn: '3. Add milk and sugar to taste', icon: '🥛' },
      { id: 'step_4', order: 4, textAs: '৪. ফিল্টাৰেৰে চালি গৰমে গৰমে কাপত পৰিৱেশন কৰক', textEn: '4. Strain into cup and enjoy warm', icon: '☕' }
    ],
    hint: 'প্ৰথমে সদায় পানী উতলাব লাগে, তাৰ পিছতহে চাহপাত দিব লাগে। (Always boil the water first before adding tea leaves.)',
    gentlePrompt: 'ৰাতিপুৱা আমি চাহ বনাওঁতে প্ৰথমে কি কৰোঁ?'
  }
];
