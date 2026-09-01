/**
 * reminiscenceContent.js - Deep North Eastern Region (NER) Multi-State Cultural Catalog
 * 
 * Authentic regional cultural assets, folklore prompts, traditional handlooms, and 
 * occupational sequencing routines tailored for all 8 North Eastern Indian states:
 * Assam, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Arunachal Pradesh, Sikkim.
 */

export const NER_STATES = {
  ASSAM: 'Assam',
  MEGHALAYA: 'Meghalaya',
  MANIPUR: 'Manipur',
  MIZORAM: 'Mizoram',
  NAGALAND: 'Nagaland',
  TRIPURA: 'Tripura',
  ARUNACHAL: 'Arunachal Pradesh',
  SIKKIM: 'Sikkim'
};

export const CULTURAL_CATEGORIES = {
  MUSIC_FESTIVALS: 'music_festivals',
  TEXTILES_WEAVES: 'textiles_weaves',
  DAILY_ROUTINE: 'daily_routine'
};

/**
 * 1. State-by-State Memory Recall Tasks (Instruments & Cultural Stimuli)
 */
export const STATE_MEMORY_TASKS = {
  [NER_STATES.ASSAM]: [
    {
      id: 'mem_bihu_dhol',
      state: NER_STATES.ASSAM,
      title: 'বিহুৰ বাদ্য (Bihu Dhol)',
      promptAs: 'ছবিখন চাই কওক, এই বাদ্যবিধৰ নাম কি?',
      promptEn: 'Looking at this picture, what is the name of this instrument?',
      personalPromptAs: '{name}ৰ লগত {village}ত বিহুৰ সময়ত বজোৱা এই বাদ্যবিধৰ কথা মনত আছেনে?',
      personalPromptEn: 'Do you remember celebrations in {village} with {name} hearing this instrument?',
      correctAnswer: 'dhol',
      acceptedAliases: ['ঢোল', 'dhol', 'drum', 'বিহু ঢোল'],
      icon: '🥁',
      visualDescription: 'কাঠ আৰু চামৰাৰে তৈয়াৰী পৰম্পৰাগত বিহু ঢোল (Traditional wooden Bihu drum)',
      options: [
        { id: 'dhol', labelAs: 'ঢোল (Dhol)', labelEn: 'Bihu Drum', icon: '🥁' },
        { id: 'pepa', labelAs: 'পেঁপা (Pepa)', labelEn: 'Buffalo Horn Flute', icon: '📯' },
        { id: 'gogona', labelAs: 'গগনা (Gogona)', labelEn: 'Bamboo Jaw Harp', icon: '🎋' }
      ],
      hint: 'ই কাঠ আৰু চামৰাৰে তৈয়াৰী, বিহু নৃত্যৰ মূল বাদ্য। (Made of wood and leather, the heartbeat of Bihu.)',
      gentlePrompt: 'মনত পেলাওকচোন, ৰঙালী বিহুত ঢুলীয়াই কি বজায়?'
    },
    {
      id: 'mem_bihu_pepa',
      state: NER_STATES.ASSAM,
      title: 'ম’হৰ শিংৰ পেঁপা (Buffalo Horn Pepa)',
      promptAs: 'ম’হৰ শিঙেৰে বনোৱা এই সুৰীয়া বাদ্যবিধ কি বাৰু?',
      promptEn: 'Which melodious instrument is crafted from buffalo horn?',
      personalPromptAs: '{village}ত থাকোঁতে {name}ৰ লগত পেঁপাৰ সুৰ শুনা মনত পৰে নেকি?',
      personalPromptEn: 'Do you recall the piercing tune of this horn with {name} in {village}?',
      correctAnswer: 'pepa',
      acceptedAliases: ['পেঁপা', 'pepa', 'শিং পেঁপা'],
      icon: '📯',
      visualDescription: 'ম’হৰ শিং আৰু বাঁহেৰে নিৰ্মিত পেঁপা (Traditional horn pipe)',
      options: [
        { id: 'pepa', labelAs: 'পেঁপা (Pepa)', labelEn: 'Pepa Horn', icon: '📯' },
        { id: 'dhol', labelAs: 'ঢোল (Dhol)', labelEn: 'Dhol Drum', icon: '🥁' },
        { id: 'taal', labelAs: 'তাল (Taal)', labelEn: 'Cymbals', icon: '🔔' }
      ],
      hint: 'ম’হৰ শিঙৰ চোঙাৰে ফুঁ দি সুৰ ওলোৱা বাদ্য। (Blown horn pipe.)',
      gentlePrompt: 'আহক আমি আকৌ এবাৰ চেষ্টা কৰোঁ।'
    }
  ],

  [NER_STATES.MEGHALAYA]: [
    {
      id: 'mem_megh_dama',
      state: NER_STATES.MEGHALAYA,
      title: 'ৱাংগালাৰ দামা ঢোল (Garo Dama Drum)',
      promptAs: 'ৱাংগালা উৎসৱত বজোৱা এই দীঘলীয়া কাঠেৰে সজা ঢোলটোৰ নাম কি?',
      promptEn: 'What is the long wooden drum played during the harvest Wangala festival?',
      personalPromptAs: '{village}ত {name}ৰ সৈতে শৰৎ কালৰ আনন্দ মনত পেলাওকচোন।',
      personalPromptEn: 'Remember harvest festivities with {name} in {village}?',
      correctAnswer: 'dama',
      acceptedAliases: ['দামা', 'dama', 'dama drum', 'garo drum'],
      icon: '🥁',
      visualDescription: 'দীঘল কাঠৰ গাৰে সজা গাৰো জনগোষ্ঠীৰ পৰম্পৰাগত দামা ঢোল',
      options: [
        { id: 'dama', labelAs: 'দামা ঢোল (Dama)', labelEn: 'Long Harvest Drum', icon: '🥁' },
        { id: 'ksing', labelAs: 'ক্সিং (Ksing)', labelEn: 'Khasi Drum', icon: '🪘' },
        { id: 'tangmuri', labelAs: 'তাংমুৰি (Tangmuri)', labelEn: 'Flute', icon: '🎺' }
      ],
      hint: 'ই ৱাংগালাৰ এশ ঢোল উৎসৱৰ মূল বাদ্য। (The primary instrument of the 100 Drums Festival.)',
      gentlePrompt: 'গাৰো পাহাৰৰ শস্য চপোৱা উৎসৱটো মনত পেলাওক।'
    }
  ],

  [NER_STATES.MANIPUR]: [
    {
      id: 'mem_mani_pena',
      state: NER_STATES.MANIPUR,
      title: 'মণিপুৰৰ পেনা (Manipuri Pena)',
      promptAs: 'মৈতৈসকলৰ এই পৰম্পৰাগত এডাল তাঁৰ থকা সুৰীয়া বাদ্যবিধ কি?',
      promptEn: 'What is this traditional ancient single-string bowed instrument of Manipur?',
      personalPromptAs: '{name}ৰ সৈতে {village}ত লাই হাৰাওবা উৎসৱ মনত পৰে নে?',
      personalPromptEn: 'Do you remember the sacred Pena music with {name} in {village}?',
      correctAnswer: 'pena',
      acceptedAliases: ['পেনা', 'pena', 'manipuri pena'],
      icon: '🎻',
      visualDescription: 'নাৰিকলৰ খোলা আৰু এডাল তাঁৰেৰে নিৰ্মিত সুৰীয়া পেনা',
      options: [
        { id: 'pena', labelAs: 'পেনা (Pena)', labelEn: 'Bowed Pena', icon: '🎻' },
        { id: 'pung', labelAs: 'পুং ঢোল (Pung)', labelEn: 'Pung Drum', icon: '🥁' },
        { id: 'flute', labelAs: 'বাঁহী (Flute)', labelEn: 'Bamboo Flute', icon: '🪈' }
      ],
      hint: 'নাৰিকল আৰু ধনুৰে বজোৱা মণিপুৰৰ প্ৰাচীন বাদ্য। (Ancient bowed lute made with coconut shell.)',
      gentlePrompt: 'লাই হাৰাওবা নৃত্যৰ সুৰটো মনত পেলাওক।'
    }
  ],

  [NER_STATES.MIZORAM]: [
    {
      id: 'mem_mizo_khuang',
      state: NER_STATES.MIZORAM,
      title: 'মিজো খুৱাং ঢোল (Mizo Khuang)',
      promptAs: 'চাপচাৰ কুট উৎসৱত আৰু চেৰাও নৃত্যত বজোৱা এই ঢোলবিধ কি?',
      promptEn: 'What is the traditional indigenous drum integral to Cheraw bamboo dances?',
      personalPromptAs: '{name}ৰ সৈতে {village}ত চাপচাৰ কুটৰ আনন্দ মনত আছেনে?',
      personalPromptEn: 'Do you remember celebrating Chapchar Kut with {name} in {village}?',
      correctAnswer: 'khuang',
      acceptedAliases: ['খুৱাং', 'khuang', 'mizo khuang'],
      icon: '🥁',
      visualDescription: 'কাঠৰ চুঙা আৰু চামৰাৰে তৈয়াৰী পৰম্পৰাগত মিজো খুৱাং ঢোল',
      options: [
        { id: 'khuang', labelAs: 'খুৱাং (Khuang)', labelEn: 'Mizo Drum', icon: '🥁' },
        { id: 'rawchhem', labelAs: 'ৰ’চেম (Rawchhem)', labelEn: 'Bamboo Pipe', icon: '🎍' },
        { id: 'dar', labelAs: 'দাৰ গং (Dar)', labelEn: 'Bronze Gong', icon: '🔔' }
      ],
      hint: 'মিজো সমাজত আনন্দৰ সকলো উৎসৱত ইয়াৰ তাল অপৰিহাৰ্য। (Essential rhythm in all Mizo community festivals.)',
      gentlePrompt: 'বাঁহৰ নৃত্য চেৰাওৰ তালখন মনত পেলাওকচোন।'
    }
  ],

  [NER_STATES.NAGALAND]: [
    {
      id: 'mem_naga_logdrum',
      state: NER_STATES.NAGALAND,
      title: 'নগা জনগোষ্ঠীৰ কাঠৰ ড্ৰাম (Naga Log Drum)',
      promptAs: 'গছৰ ডাঙৰ কাণ্ড খুলি নিৰ্মাণ কৰা এই ঐতিহাসিক বাদ্যবিধ কি?',
      promptEn: 'What is this massive ceremonial drum carved out of a single huge tree trunk?',
      personalPromptAs: '{village}ত {name}ৰ সৈতে মৰুং ঘৰৰ কথা মনত পৰে নেকি?',
      personalPromptEn: 'Do you remember the village Morung with {name} in {village}?',
      correctAnswer: 'logdrum',
      acceptedAliases: ['লগ ড্ৰাম', 'logdrum', 'naga log drum', 'কাঠেৰে সজা ড্ৰাম'],
      icon: '🪵',
      visualDescription: 'সম্পূৰ্ণ এটা গছৰ কাণ্ড খোদাই কৰি সজা বিশাল লগ ড্ৰাম',
      options: [
        { id: 'logdrum', labelAs: 'লগ ড্ৰাম (Log Drum)', labelEn: 'Carved Log Drum', icon: '🪵' },
        { id: 'petu', labelAs: 'পেটু (Petu)', labelEn: 'Folk Violin', icon: '🎻' },
        { id: 'horn', labelAs: 'বাঁহৰ শৃংগ (Horn)', labelEn: 'Trumpet', icon: '📯' }
      ],
      hint: 'নগা গাঁৱৰ মৰুং ঘৰত থকা গছৰ কাণ্ডৰ বিশাল বাদ্য। (Located in the Morung community hall.)',
      gentlePrompt: 'গাঁওখনৰ ঐক্য আৰু উৎসৱৰ বাৰ্তা দিয়া কাঠৰ বাদ্যটো মনত পেলাওক।'
    }
  ],

  [NER_STATES.TRIPURA]: [
    {
      id: 'mem_trip_kham',
      state: NER_STATES.TRIPURA,
      title: 'ত্ৰিপুৰাৰ খাম ঢোল (Tripuri Kham Drum)',
      promptAs: 'গৰীয়া পূজা আৰু লেবাং বমানি নৃত্যত বজোৱা এই ঢোলবিধ কি?',
      promptEn: 'Identify the traditional earthen/wooden drum played during Garia Puja celebrations:',
      personalPromptAs: '{name}ৰ সৈতে {village}ত গৰীয়া পূজাৰ দিন মনত আছেনে?',
      personalPromptEn: 'Do you remember Garia festivities with {name} in {village}?',
      correctAnswer: 'kham',
      acceptedAliases: ['খাম', 'kham', 'tripura kham'],
      icon: '🥁',
      visualDescription: 'ত্ৰিপুৰী লোকসংস্কৃতিৰ মাটি বা কাঠৰ খাম ঢোল',
      options: [
        { id: 'kham', labelAs: 'খাম (Kham)', labelEn: 'Kham Drum', icon: '🥁' },
        { id: 'sarinda', labelAs: 'চাৰিণ্ডা (Sarinda)', labelEn: 'Sarinda', icon: '🎻' },
        { id: 'sumui', labelAs: 'চুমুই বাঁহী (Sumui)', labelEn: 'Flute', icon: '🪈' }
      ],
      hint: 'গৰীয়া পূজাত কৃষকসকলে বজোৱা পৰম্পৰাগত বাদ্য। (Sacred rhythm for agricultural prosperity.)',
      gentlePrompt: 'বসন্ত কালৰ গৰীয়া পূজাত বজোৱা ঢোলটো মনত পেলাওক।'
    }
  ],

  [NER_STATES.ARUNACHAL]: [
    {
      id: 'mem_arun_punu',
      state: NER_STATES.ARUNACHAL,
      title: 'অৰুণাচলৰ পুনু বাদ্য (Punu Bells & Emong)',
      promptAs: 'মপিন আৰু চ’লুং উৎসৱত নৃত্যৰ তাল দিয়া ঘণ্টা বাদ্যবিধ কি?',
      promptEn: 'What is the ceremonial percussion instrument played during Solung celebrations?',
      personalPromptAs: '{village}ত {name}ৰ সৈতে উৎসৱৰ মধুৰ স্মৃতি মনত পেলাওক।',
      personalPromptEn: 'Remember the Solung community dances with {name} in {village}?',
      correctAnswer: 'punu',
      acceptedAliases: ['পুনু', 'punu', 'emong', 'ঘণ্টা'],
      icon: '🔔',
      visualDescription: 'ধাতুৰে তৈয়াৰী পুনু ঘণ্টা আৰু কাঁহৰ বাদ্য',
      options: [
        { id: 'punu', labelAs: 'পুনু ঘণ্টা (Punu Bells)', labelEn: 'Ceremonial Bells', icon: '🔔' },
        { id: 'gong', labelAs: 'এমং কাঁহ (Emong)', labelEn: 'Bronze Gong', icon: '🛎️' },
        { id: 'drum', labelAs: 'কাঠৰ ঢোল (Drum)', labelEn: 'Tribal Drum', icon: '🥁' }
      ],
      hint: 'উৎসৱত হাতত লৈ তাল বজোৱা সুৰীয়া ধাতুৰ বাদ্য। (Resonant percussion played during Solung dance.)',
      gentlePrompt: 'নৃত্যৰ তালত বাজি উঠা জুনুকা বা ঘণ্টাবোৰ মনত পেলাওক।'
    }
  ],

  [NER_STATES.SIKKIM]: [
    {
      id: 'mem_sik_damphu',
      state: NER_STATES.SIKKIM,
      title: 'চিকিমৰ ডাম্ফু বাদ্য (Sikkimese Damphu)',
      promptAs: 'হিমালয়ৰ তামাঙ্গ আৰু নেপালী নৃত্যত বজোৱা ঘূৰণীয়া বাদ্যবিধ কি?',
      promptEn: 'What is this circular single-headed frame drum native to Sikkimese folk traditions?',
      personalPromptAs: '{name}ৰ সৈতে {village}ৰ পাহাৰৰ বুকুত শুনা সুৰ মনত পেলাওক।',
      personalPromptEn: 'Recall the cheerful beats in the hills of {village} with {name}?',
      correctAnswer: 'damphu',
      acceptedAliases: ['ডাম্ফু', 'damphu', 'damphu drum'],
      icon: '🪘',
      visualDescription: 'ঘূৰণীয়া কাঠ আৰু চামৰাৰে সজা ডাম্ফু বাদ্য',
      options: [
        { id: 'damphu', labelAs: 'ডাম্ফু (Damphu)', labelEn: 'Damphu Drum', icon: '🪘' },
        { id: 'gyaling', labelAs: 'জ্ঞালিং (Gyaling)', labelEn: 'Temple Horn', icon: '🎺' },
        { id: 'cymbals', labelAs: 'তাল (Cymbals)', labelEn: 'Bronze Cymbals', icon: '🔔' }
      ],
      hint: 'হাতত লৈ আঙুলিৰে আঘাত কৰি বজোৱা ঘূৰণীয়া খঞ্জৰী। (Circular hand drum played with fingers.)',
      gentlePrompt: 'পাহাৰীয়া লোকনৃত্যত হাতত লৈ বজোৱা ঘূৰণীয়া বাদ্যটো মনত পেলাওক।'
    }
  ]
};

/**
 * 2. State-by-State Traditional Textiles & Weaves
 */
export const STATE_TEXTILE_TASKS = {
  [NER_STATES.ASSAM]: [
    {
      id: 'pat_muga_silk',
      state: NER_STATES.ASSAM,
      title: 'সোণালী মুগা বস্ত্ৰ (Assamese Golden Muga)',
      promptAs: 'অসমৰ গৌৰৱ এই উজ্জ্বল সোণালী ৰঙৰ ৰেচমী কাপোৰবিধ কি?',
      promptEn: 'Identify Assam’s pride: this naturally golden shimmering silk.',
      correctAnswer: 'muga',
      acceptedAliases: ['মুগা', 'muga', 'সোণালী মুগা'],
      patternColor: '#D4AF37',
      motifName: 'কিংখাপ বুটা (Kingkhap Motif)',
      options: [
        { id: 'muga', labelAs: 'মুগা পাট (Golden Muga Silk)', region: 'Assam', colorHex: '#D4AF37' },
        { id: 'eri', labelAs: 'এৰী চাদৰ (Eri Silk)', region: 'Assam', colorHex: '#E5E7EB' },
        { id: 'gamusa', labelAs: 'ফুলাম গামোচা (Gamusa)', region: 'Assam', colorHex: '#DC2626' }
      ],
      hint: 'সোণৰ দৰে উজ্বলি থকা এই কাপোৰ কেৱল অসমতেই পোৱা যায়।',
      gentlePrompt: 'আমাৰ শালত বোৱা সোণালী সুতাৰ কাপোৰখন চিনাকি পাওঁকচোন।'
    }
  ],

  [NER_STATES.MEGHALAYA]: [
    {
      id: 'pat_garo_dakmanda',
      state: NER_STATES.MEGHALAYA,
      title: 'গাৰো ডাকমাণ্ডা বস্ত্ৰ (Garo Dakmanda Handloom)',
      promptAs: 'গাৰো মহিলাসকলে কঁকালত মেৰিয়াই পিন্ধা এই হাতৰ তাঁতৰ বস্ত্ৰবিধ কি?',
      promptEn: 'Identify the traditional handloom wrap skirt woven with colorful floral borders by Garo artisans:',
      correctAnswer: 'dakmanda',
      acceptedAliases: ['ডাকমাণ্ডা', 'dakmanda', 'garo dakmanda'],
      patternColor: '#7C2D12',
      motifName: 'পৰম্পৰাগত ডাকমাণ্ডা বুটা (Floral Diamond Motif)',
      options: [
        { id: 'dakmanda', labelAs: 'ডাকমাণ্ডা (Dakmanda)', region: 'Meghalaya (Garo)', colorHex: '#7C2D12' },
        { id: 'ryndia', labelAs: 'ৰাইন্দিয়া ৰেচম (Ryndia)', region: 'Meghalaya (Khasi)', colorHex: '#FDE68A' },
        { id: 'muga', labelAs: 'মুগা বস্ত্ৰ (Muga Silk)', region: 'Assam', colorHex: '#D4AF37' }
      ],
      hint: 'গাৰো পাহাৰৰ মহিলাসকলে বোৱা উজ্জ্বল ফুলৰ পাৰি থকা সাজ।',
      gentlePrompt: 'ৰঙীন সূতাৰে বোৱা পাৰিটোলৈ মন কৰক।'
    }
  ],

  [NER_STATES.MANIPUR]: [
    {
      id: 'pat_mani_phanek',
      state: NER_STATES.MANIPUR,
      title: 'মণিপুৰৰ ফানেক বস্ত্ৰ (Manipuri Phanek & Mayek Naibi)',
      promptAs: 'মণিপুৰৰ মহিলাসকলে পিন্ধা পথালি আঁচ থকা এই পৰম্পৰাগত সাজবিধ বাচক।',
      promptEn: 'Identify the iconic handloom sarong woven with horizontal stripes and embroidered borders:',
      correctAnswer: 'phanek',
      acceptedAliases: ['ফানেক', 'phanek', 'mayek naibi'],
      patternColor: '#991B1B',
      motifName: 'মায়েক নাইবি আঁচ (Mayek Naibi Stripes)',
      options: [
        { id: 'phanek', labelAs: 'ফানেক (Phanek)', region: 'Manipur', colorHex: '#991B1B' },
        { id: 'innaphi', labelAs: 'ইন্নাফি (Innaphi)', region: 'Manipur', colorHex: '#DDD6FE' },
        { id: 'puan', labelAs: 'মিজো পুয়ান (Puan)', region: 'Mizoram', colorHex: '#B91C1C' }
      ],
      hint: 'মৈতৈ সমাজত সকলো পবিত্ৰ অনুষ্ঠানত পিন্ধা আঁচু সূতাৰ সাজ।',
      gentlePrompt: 'সুন্দৰ পথালি আঁচবোৰ আৰু ফুলৰ কামবোৰ মনত পেলাওক।'
    }
  ],

  [NER_STATES.MIZORAM]: [
    {
      id: 'pat_mizo_puanchei',
      state: NER_STATES.MIZORAM,
      title: 'মিজো পুয়ানচেই বস্ত্ৰ (Mizo Puanchei)',
      promptAs: 'মিজোৰামৰ পৰম্পৰাগত ক’লা, বগা আৰু ৰঙা আঁচ থকা কাপোৰবিধ বাচক।',
      promptEn: 'Select the traditional Mizo handloom featuring striking red, black and white stripes.',
      correctAnswer: 'puanchei',
      acceptedAliases: ['পুয়ান', 'puan', 'puanchei', 'mizo puan'],
      patternColor: '#B91C1C',
      motifName: 'পুয়ানচেই আঁচ (Puanchei Geometric Weave)',
      options: [
        { id: 'puanchei', labelAs: 'মিজো পুয়ানচেই (Puanchei)', region: 'Mizoram', colorHex: '#B91C1C' },
        { id: 'ngotekherh', labelAs: 'নগোতেখেৰ (Ngotekherh)', region: 'Mizoram', colorHex: '#1F2937' },
        { id: 'muga', labelAs: 'মুগা কাপোৰ (Muga Silk)', region: 'Assam', colorHex: '#D4AF37' }
      ],
      hint: 'মিজো মহিলাসকলে চাপচাৰ কুট উৎসৱত পিন্ধা বিশেষ সাজ।',
      gentlePrompt: 'আহক আমি ৰংবোৰ চাওঁ: ক’লা, ৰঙা আৰু বগা আঁচবোৰ মন কৰক।'
    }
  ],

  [NER_STATES.NAGALAND]: [
    {
      id: 'pat_naga_shawl',
      state: NER_STATES.NAGALAND,
      title: 'চুংক’তেপ্চু নগা শাল (Ao Naga Tsüngkotepsü)',
      promptAs: 'বীৰত্ব আৰু সন্মানৰ প্ৰতীক এই বিশেষ নগা শালখনৰ নাম কি?',
      promptEn: 'Identify this renowned warrior shawl featuring stylized animal motifs and warrior insignias:',
      correctAnswer: 'tsungkotepsu',
      acceptedAliases: ['নগা শাল', 'naga shawl', 'tsungkotepsu', 'ao shawl'],
      patternColor: '#991B1B',
      motifName: 'নগা বীৰৰ প্ৰতীক বুটা (Warrior Insignia Stripes)',
      options: [
        { id: 'tsungkotepsu', labelAs: 'চুংক’তেপ্চু শাল (Tsüngkotepsü)', region: 'Nagaland (Ao)', colorHex: '#991B1B' },
        { id: 'loramhoushu', labelAs: 'লোৰামহৌচু (Loramhoushü)', region: 'Nagaland (Angami)', colorHex: '#18181B' },
        { id: 'muga', labelAs: 'মুগা বস্ত্ৰ (Muga)', region: 'Assam', colorHex: '#D4AF37' }
      ],
      hint: 'ক’লা, ৰঙা আৰু বগা ৰঙৰ আঁচত বাঘ, হাতী আৰু সূৰ্য্যৰ প্ৰতীক থকা শাল।',
      gentlePrompt: 'সাহসী নগা ঐতিহ্যৰ প্ৰতীক শালখন মনত পেলাওক।'
    }
  ],

  [NER_STATES.TRIPURA]: [
    {
      id: 'pat_trip_rignai',
      state: NER_STATES.TRIPURA,
      title: 'ত্ৰিপুৰাৰ ৰিগনাই বস্ত্ৰ (Tripuri Rignai Handloom)',
      promptAs: 'ত্ৰিপুৰী মহিলাসকলে তাঁতত বোৱা এই পৰম্পৰাগত ৰঙীন সাজবিধ বাচক।',
      promptEn: 'Identify the traditional hand-woven wrap with vibrant indigenous patterns:',
      correctAnswer: 'rignai',
      acceptedAliases: ['ৰিগনাই', 'rignai', 'rikutu', 'tripura rignai'],
      patternColor: '#4C1D95',
      motifName: 'পৰম্পৰাগত ফুলৰ বুটা (Tripuri Floral Weave)',
      options: [
        { id: 'rignai', labelAs: 'ৰিগনাই (Rignai)', region: 'Tripura', colorHex: '#4C1D95' },
        { id: 'rikutu', labelAs: 'ৰিকুতু (Rikutu)', region: 'Tripura', colorHex: '#047857' },
        { id: 'phanek', labelAs: 'ফানেক (Phanek)', region: 'Manipur', colorHex: '#991B1B' }
      ],
      hint: 'ঘৰৰ শালত বোৱা সুন্দৰ গাঢ় ৰঙৰ ত্ৰিপুৰী সাজ।',
      gentlePrompt: 'ৰঙীন সূতাৰে সজোৱা ৰিগনাইখন মনত পেলাওক।'
    }
  ],

  [NER_STATES.ARUNACHAL]: [
    {
      id: 'pat_arun_apatani',
      state: NER_STATES.ARUNACHAL,
      title: 'আপাটানি জ্যামিতিক বস্ত্ৰ (Apatani Geometric Weave)',
      promptAs: 'জিৰ’ উপত্যকাৰ আপাটানিসকলে বোৱা এই জ্যামিতিক নক্সাৰ কাপোৰবিধ কি?',
      promptEn: 'Identify this striking handloom featuring zigzag and diamond patterns from Ziro Valley:',
      correctAnswer: 'apatani',
      acceptedAliases: ['আপাটানি', 'apatani', 'apatani weave'],
      patternColor: '#065F46',
      motifName: 'জ্যামিতিক জিগ-জেগ বুটা (Zigzag Diamond Pattern)',
      options: [
        { id: 'apatani', labelAs: 'আপাটানি শাল (Apatani)', region: 'Arunachal Pradesh', colorHex: '#065F46' },
        { id: 'monpa', labelAs: 'মোনপা দলিচা (Monpa Carpet)', region: 'Arunachal Pradesh', colorHex: '#B45309' },
        { id: 'muga', labelAs: 'মুগা বস্ত্ৰ (Muga)', region: 'Assam', colorHex: '#D4AF37' }
      ],
      hint: 'প্ৰাকৃতিক সেউজীয়া আৰু ক’লা ৰঙৰ জ্যামিতিক শাল।',
      gentlePrompt: 'জিৰ’ উপত্যকাৰ তাঁতশিল্পীসকলৰ কাম মনত পেলাওক।'
    }
  ],

  [NER_STATES.SIKKIM]: [
    {
      id: 'pat_sik_bakkhu',
      state: NER_STATES.SIKKIM,
      title: 'চিকিমৰ বাখু পোছাক (Sikkimese Bakkhu / Kho)',
      promptAs: 'চিকিমৰ পৰ্বতীয়া অঞ্চলত পিন্ধা এই ঐতিহ্যবাহী দীঘলীয়া চোলা-সাজবিধ কি?',
      promptEn: 'Identify the traditional full-length wraparound robe worn with silk sash in Sikkim:',
      correctAnswer: 'bakkhu',
      acceptedAliases: ['বাখু', 'bakkhu', 'kho', 'sikkim dress'],
      patternColor: '#1E3A8A',
      motifName: 'পৰম্পৰাগত ৰেচম আৰু বেল্ট (Silk Sash & Robe)',
      options: [
        { id: 'bakkhu', labelAs: 'বাখু পোছাক (Bakkhu)', region: 'Sikkim (Bhutia)', colorHex: '#1E3A8A' },
        { id: 'lepcha', labelAs: 'লেপচা বস্ত্ৰ (Lepcha Handloom)', region: 'Sikkim', colorHex: '#0D9488' },
        { id: 'puan', labelAs: 'মিজো পুয়ান (Puan)', region: 'Mizoram', colorHex: '#B91C1C' }
      ],
      hint: 'শীতৰ দিনত পিন্ধা কঁকালত কাপোৰৰ বেল্ট থকা সুন্দৰ সাজ।',
      gentlePrompt: 'হিমালয়ৰ বুকুত পিন্ধা ৰেচমী চোলাটো মনত পেলাওক।'
    }
  ]
};

/**
 * 3. Daily Routine & Occupational Sequencing Tasks
 */
export const OCCUPATION_SEQUENCING_TASKS = {
  // Occupation: Farmer or Tea Plantation Worker
  farmer: {
    id: 'seq_tea_plucking',
    occupation: 'farmer',
    title: 'চাহপাত তোলা আৰু বাছনি কৰা (Plucking & Sorting Tea Leaves)',
    promptAs: 'চাহ বাগিচাত সুগন্ধি চাহপাত সংগ্ৰহ কৰাৰ সঠিক ক্ৰমটো সজাওক:',
    promptEn: 'Arrange the correct steps for harvesting fresh tea leaves in the garden:',
    steps: [
      { id: 'step_tea_1', order: 1, textAs: '১. বাঁহৰ পাচিটো মূৰত বা পিঠিত সুৰক্ষিতভাৱে বান্ধক', textEn: '1. Fasten bamboo basket securely on back', icon: '🧺' },
      { id: 'step_tea_2', order: 2, textAs: '২. কোমল দুখিলা আৰু কুঁহিপাত আলফুলে তোলক', textEn: '2. Pluck two tender leaves and a bud', icon: '🍃' },
      { id: 'step_tea_3', order: 3, textAs: '৩. ডাঠ বা শুকান পাতবোৰ পৃথকে আঁতৰাই থওক', textEn: '3. Sort out dry or coarse leaves', icon: '🌿' },
      { id: 'step_tea_4', order: 4, textAs: '৪. ওজন কৰাৰ বাবে সংগ্ৰহ কেন্দ্ৰলৈ নি জমা দিয়ক', textEn: '4. Take filled basket to weighing shed', icon: '⚖️' }
    ],
    hint: 'প্ৰথমে পাচিটো বান্ধি ল’ব লাগে, তাৰ পিছতহে কোমল পাত তোলক।',
    gentlePrompt: 'ৰাতিপুৱা বাগিচালৈ গৈ প্ৰথমে কি প্ৰস্তুতি চলোৱা হয়?'
  },

  // Occupation: Handloom Weaver
  weaver: {
    id: 'seq_handloom_weaving',
    occupation: 'weaver',
    title: 'তাঁত শাল সজোৱা আৰু বোৱা (Setting Up Loom & Weaving)',
    promptAs: 'শালত শুৱনি কাপোৰ বোৱাৰ সঠিক ক্ৰমটো সজাওক:',
    promptEn: 'Arrange the steps for setting up the traditional handloom and weaving:',
    steps: [
      { id: 'step_weav_1', order: 1, textAs: '১. চেৰেকী আৰু ববীনত সূতাখিনি মেৰিয়াই লওক', textEn: '1. Wind yarn evenly onto bobbins and spools', icon: '🧵' },
      { id: 'step_weav_2', order: 2, textAs: '২. শালত টোলোঠা আৰু দীঘ সূতা টানকৈ বান্ধক', textEn: '2. Mount warp threads securely on the loom', icon: '🪵' },
      { id: 'step_weav_3', order: 3, textAs: '৩. মাকোৰে বানী সুমুৱাই বুটাবোৰ হাতৰে বাচক', textEn: '3. Pass the shuttle to weave motifs', icon: '🪡' },
      { id: 'step_weav_4', order: 4, textAs: '৪. ৰাহেৰে কাপোৰৰ আঁচ পৰীক্ষা কৰি মেৰিয়াওক', textEn: '4. Inspect the selvedge and wind woven cloth', icon: '✨' }
    ],
    hint: 'প্ৰথমে সদায় সূতা ববীনত মেৰিয়াই ল’ব লাগে।',
    gentlePrompt: 'শালত বহাৰ আগতে সূতাৰ প্ৰস্তুতি কেনেকৈ কৰা হৈছিল?'
  },

  // Occupation: Teacher or Administrative Clerk
  teacher_clerk: {
    id: 'seq_classroom_prep',
    occupation: 'teacher_clerk',
    title: 'পাঠদান আৰু বহী সজোৱা (Preparing Class & Lessons)',
    promptAs: 'পাঠশালাত পুৱাৰ পাঠদান আৰম্ভ কৰাৰ সঠিক ক্ৰমটো সজাওক:',
    promptEn: 'Arrange the steps for opening class and conducting the morning lesson:',
    steps: [
      { id: 'step_teach_1', order: 1, textAs: '১. ছাত্ৰ-ছাত্ৰীৰ উপস্থিতিৰ বহীখন টেবুলত মেলক', textEn: '1. Open attendance register on desk', icon: '📖' },
      { id: 'step_teach_2', order: 2, textAs: '২. চক্ আৰু ডাস্তাৰ হাতত লৈ ফলকখন পৰিষ্কাৰ কৰক', textEn: '2. Wipe chalkboard with duster and chalk', icon: '📝' },
      { id: 'step_teach_3', order: 3, textAs: '৩. আজিৰ পাঠদানৰ বিষয়টো ডাঙৰকৈ লিখি দিয়ক', textEn: '3. Write day’s lesson topic on board', icon: '✏️' },
      { id: 'step_teach_4', order: 4, textAs: '৪. সকলোকে বহী মেলিবলৈ কৈ পাঠ বুজাই দিয়ক', textEn: '4. Have students open books and begin reading', icon: '🎓' }
    ],
    hint: 'প্ৰথমে সদায় হাজিৰা বহীখন মেলি ল’ব লাগে।',
    gentlePrompt: 'বিদ্যালয়ত ঘণ্টা পৰাৰ পিছত প্ৰথম কাম কি আছিল?'
  },

  // Default / Homemaker fallback: Assam Chai Preparation
  homemaker: {
    id: 'seq_assam_tea',
    occupation: 'homemaker',
    title: 'সোৱাদভৰা অসমীয়া চাহ (Preparing Assam Tea)',
    promptAs: 'সোৱাদভৰা চাহ তৈয়াৰ কৰাৰ সঠিক ক্ৰমটো সজাওক:',
    promptEn: 'Arrange the correct steps for preparing a warm cup of tea:',
    steps: [
      { id: 'step_tea_h1', order: 1, textAs: '১. চচপেনত পানী লৈ ভালদৰে উতলাওক', textEn: '1. Boil fresh water in the kettle', icon: '🫖' },
      { id: 'step_tea_h2', order: 2, textAs: '২. সুগন্ধি অসম চাহপাত আৰু আদা দিয়ক', textEn: '2. Add fresh tea leaves and ginger', icon: '🍃' },
      { id: 'step_tea_h3', order: 3, textAs: '৩. সোৱাদ অনুসৰি গাখীৰ আৰু চেনি দিয়ক', textEn: '3. Add milk and sugar to taste', icon: '🥛' },
      { id: 'step_tea_h4', order: 4, textAs: '৪. ফিল্টাৰেৰে চালি গৰমে গৰমে কাপত পৰিৱেশন কৰক', textEn: '4. Strain into cup and enjoy warm', icon: '☕' }
    ],
    hint: 'প্ৰথমে সদায় পানী উতলাব লাগে, তাৰ পিছতহে চাহপাত দিব লাগে।',
    gentlePrompt: 'ৰাতিপুৱা চাহ বনাওঁতে প্ৰথমে কি কৰোঁ?'
  }
};

/**
 * Helper: Retrieve Cultural Assets for a specific NER State
 */
export function getCulturalContentByState(stateName = NER_STATES.ASSAM) {
  const safeState = Object.values(NER_STATES).includes(stateName) ? stateName : NER_STATES.ASSAM;
  const memoryTasks = STATE_MEMORY_TASKS[safeState] || STATE_MEMORY_TASKS[NER_STATES.ASSAM];
  const textileTasks = STATE_TEXTILE_TASKS[safeState] || STATE_TEXTILE_TASKS[NER_STATES.ASSAM];

  return {
    state: safeState,
    memoryTasks,
    textileTasks
  };
}

/**
 * Helper: Retrieve Sequencing Task mapped to Patient's Occupation
 */
export function getSequencingTaskByOccupation(occupation = 'homemaker') {
  const occKey = (occupation || '').toLowerCase().replace(/[\s-]+/g, '_');
  if (occKey.includes('teach') || occKey.includes('clerk') || occKey.includes('school') || occKey.includes('office')) {
    return OCCUPATION_SEQUENCING_TASKS.teacher_clerk;
  }
  if (occKey.includes('weav') || occKey.includes('loom') || occKey.includes('craft') || occKey.includes('tailor')) {
    return OCCUPATION_SEQUENCING_TASKS.weaver;
  }
  if (occKey.includes('plantation') || occKey.includes('tea_garden') || occKey.includes('farm') || occKey.includes('cultiv') || occKey.includes('plucking')) {
    return OCCUPATION_SEQUENCING_TASKS.farmer;
  }
  // Fallback to homemaker / tea routine
  return OCCUPATION_SEQUENCING_TASKS.homemaker;
}

/**
 * Helper: Dynamically interpolate patient autobiography anchors into prompt templates
 */
export function interpolatePersonalPrompt(template, profile = {}) {
  if (!template) return '';
  const familyMember = profile.familyMembers?.[0]?.name || 'পৰিয়ালৰ লোক (Family)';
  const relationship = profile.familyMembers?.[0]?.relationship || 'আপোনজন';
  const village = profile.villageTown || profile.homeState || 'গৃহচহৰ (Hometown)';

  return template
    .replace(/\{name\}/g, familyMember)
    .replace(/\{relationship\}/g, relationship)
    .replace(/\{village\}/g, village)
    .replace(/\{hometown\}/g, village);
}

// Backwards-compatible exports for existing game components & tests
export const MEMORY_RECALL_TASKS = STATE_MEMORY_TASKS[NER_STATES.ASSAM];
export const TEXTILE_PATTERN_TASKS = STATE_TEXTILE_TASKS[NER_STATES.ASSAM];
export const CULINARY_SEQUENCING_TASKS = [OCCUPATION_SEQUENCING_TASKS.homemaker];
