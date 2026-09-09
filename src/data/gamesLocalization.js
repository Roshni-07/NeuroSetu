/**
 * gamesLocalization.js - Comprehensive Multilingual & Voice Guide Engine for All Cognitive Games
 * 
 * Supports:
 * - English ('en')
 * - Assamese / অসমীয়া ('as')
 * - Bengali / বাংলা ('bn')
 * - Hindi / हिन्दी ('hi')
 * - Manipuri / মৈতৈলোন্ ('mni')
 * - Mizo / Mizo ṭawng ('lus')
 * - Khasi / Ka Ktien Khasi ('kha')
 * - Garo / A·chik ('grt')
 * - Bodo / बर' ('brx')
 */

export const CATEGORY_LOCALIZATIONS = {
  Memory: {
    en: { title: 'Memory Training', desc: 'Gentle recall of cultural items, folk stories, and daily rhythms' },
    as: { title: 'স্মৃতি অনুশীলন', desc: 'সাংস্কৃতিক সামগ্ৰী, লোকগাথা আৰু দৈনিক ৰীতিৰ সোঁৱৰণী' },
    bn: { title: 'স্মৃতিশক্তি অনুশীলন', desc: 'সাংস্কৃতিক সামগ্রী, লোকগাথা এবং দৈনন্দিন রীতির স্মরণ' },
    hi: { title: 'स्मृति और याददाश्त', desc: 'पारंपरिक वस्तुएं, लोक कथाएं और दैनिक दिनचर्या की याददाश्त' },
    mni: { title: 'Ningshingba Thabak', desc: 'Aribee thabak, wari amasung ahing-nungthilgi ningshingba' },
    lus: { title: 'Hriatrengna Infiamna', desc: 'Hmanlai thil, thawnthu leh nitin nunphung hriat rengna' },
    kha: { title: 'Ka Jingkynmaw', desc: 'Ka jingkynmaw ia ki jingiathuhkhana bad ki kam man la ka sngi' },
    grt: { title: 'Gisik Ra·ani Kal·ani', desc: 'A·chik a·songni gimin aro salanti kamrangko gisik ra·ani' },
    brx: { title: 'गोसोखांथि गेलेनाय', desc: 'हारिमुनि बेसाद, खौरां आरो सानफ्रोमबोनि हुदा गोसोखांनाय' }
  },
  Attention: {
    en: { title: 'Attention & Focus', desc: 'Mindful visual observation and detail finding' },
    as: { title: 'মনোযোগ আৰু দৃষ্টি', desc: 'সজাগ দৃষ্টিৰে সুক্ষ্ম পাৰ্থক্য আৰু বস্তু চিনাক্তকৰণ' },
    bn: { title: 'মনোযোগ ও একাগ্রতা', desc: 'সতর্ক দৃষ্টিতে সূক্ষ্ম পার্থক্য ও বস্তু চিহ্নিতকরণ' },
    hi: { title: 'ध्यान और एकाग्रता', desc: 'सावधानीपूर्वक देखना और बारीक अंतर पहचानना' },
    mni: { title: 'Pukning Changba', desc: 'Fajatana yengba amasung khetnaba thiba' },
    lus: { title: 'Ngaihtuahna Leh Enfimna', desc: 'Fimkhur taka thil thliar hran leh en chianna' },
    kha: { title: 'Ka Jingpyrkhat Bad Jingpeit Bha', desc: 'Ka jingpeit bniah bad jinglap ia ki jingiapher' },
    grt: { title: 'Gisik On·ani', desc: 'Nambate niani aro dingtanggrikako amani' },
    brx: { title: 'गोसो होनाय आरो नोजोर', desc: 'मोजाङै नोजोर होनाय आरो फारागखौ दिहुननाय' }
  },
  'Reasoning/Executive Function': {
    en: { title: 'Reasoning & Planning', desc: 'Everyday sorting, household organization, and logical ordering' },
    as: { title: 'যুক্তি আৰু সিদ্ধান্ত', desc: 'দৈনন্দিন সামগ্ৰী সজোৱা আৰু যুক্তিসঙ্গত সিদ্ধান্ত' },
    bn: { title: 'যুক্তি ও সিদ্ধান্ত', desc: 'দৈনন্দিন সামগ্রী সাজানো এবং যুক্তিসঙ্গত সিদ্ধান্ত গ্রহণ' },
    hi: { title: 'तर्क और निर्णय क्षमता', desc: 'घरेलू सामान का सही वर्गीकरण और तार्किक व्यवस्था' },
    mni: { title: 'Wakhalsing Khanba', desc: 'Yumgi potlam fajana thamba amasung khallaga thabak touba' },
    lus: { title: 'Rilru Fingna Leh Ruahmanna', desc: 'In chhung thil dah fel leh ruahmanna siam' },
    kha: { title: 'Ka Jingstad Bad Jingpynbeit', desc: 'Ka jingpynbeit ia ki tiar iing bad jingpyrkhat shai' },
    grt: { title: 'U·iani Aro Namatgrik-ani', desc: 'Nokni basturangko donkratani aro namgipa chanchiani' },
    brx: { title: 'जुक्ति आरो थांखि', desc: 'न’नि बेसाद साजायनाय आरो जुक्तिजों सिधान्त लानाय' }
  },
  'Visual Reasoning': {
    en: { title: 'Visual & Spatial', desc: 'Traditional weaves, handloom patterns, and village landmarks' },
    as: { title: 'দৃশ্যমান বিশ্লেষণ', desc: 'তাঁতশালৰ বস্ত্ৰ চানেকি, জ্যামিতিক ৰূপ আৰু গাঁৱৰ বাট-পথ' },
    bn: { title: 'দৃশ্যমান বিশ্লেষণ', desc: 'তাঁতের নকশা, জ্যামিতিক রূপ এবং গ্রামের পথঘাট' },
    hi: { title: 'दृश्य व स्थानिक समझ', desc: 'पारंपरिक बुनाई, हथकरघा पैटर्न और दिशा ज्ञान' },
    mni: { title: 'Ubagi Wakhallon', desc: 'Khutsa heiba yongkhamgi machat amasung lambi-sarang' },
    lus: { title: 'Hmuh Theih Finna', desc: 'Puan tah dan ze zawn leh hmun hma hriat hran' },
    kha: { title: 'Ka Jingiohi Bad Dur', desc: 'Ki dur tha-iing bad ki lynti shnong' },
    grt: { title: 'Niani U·iani', desc: 'Gan-chinani ritingrang aro ramarangko u·iani' },
    brx: { title: 'नुनाय जुक्ति', desc: 'दामनाय-बांनाय महर, गामिनि लामा आरो सिनायथि' }
  },
  'Emotional Cognition': {
    en: { title: 'Emotional Wellbeing', desc: 'Empathy, village harmony, caring for companions, and warm smiles' },
    as: { title: 'ভাৱ আৰু অনুভূতি', desc: 'সহানুভূতি, সংগীৰ যত্ন আৰু প্ৰশান্ত মনৰ আনন্দ' },
    bn: { title: 'ভাব ও অনুভূতি', desc: 'সহানুভূতি, সঙ্গীর যত্ন এবং মানসিক প্রশান্তি' },
    hi: { title: 'भावनात्मक समझ', desc: 'सहानुभूति, साथी की देखभाल और मन की शांति' },
    mni: { title: 'Pukninggi Phibam', desc: 'Pukning nungshiba amasung shanna-khotnabagi haraoba' },
    lus: { title: 'Rilru Veina Leh Inremna', desc: 'Mi dang hriatthiamna leh rannung duatna' },
    kha: { title: 'Ka Jingmut Jingpyrkhat', desc: 'Ka jingiasngewlem bad ka jingsngewbha ha iing ha sem' },
    grt: { title: 'Ka·dongani Aro Gisik An·sengani', desc: 'Gipinrangko ka·saani aro an·sengbee dongani' },
    brx: { title: 'गोसोनि भाव आरो अननाय', desc: 'अनसायलायनाय, लोगोखौ जोथोन लानाय आरो गोजोन गोसो' }
  }
};

export const GAMES_LOCALIZATION = {
  // 1. Grandma's Shopping List
  'grandmas-shopping-list': {
    en: {
      name: "Grandma's Shopping List",
      subtitle: 'Assam tea & weekly bazaar market recall',
      culturalTag: 'Village Haat Bazaar',
      instructions: [
        'Take a few seconds to look at Grandma’s shopping list.',
        'When the list hides, tap only the items that were on her list.',
        'Check your basket when ready!'
      ],
      voiceExplanation: "Welcome to Grandma's Shopping List. Grandma has prepared a list of items for the weekly village market. Look at the items carefully. When they disappear, tap the items you remember from her list, then press confirm. Take your time, there is no hurry."
    },
    as: {
      name: 'আইতাৰ বজাৰৰ তালিকা',
      subtitle: 'সাপ্তাহিক হাট বজাৰৰ প্ৰয়োজনীয় বস্তু সোঁৱৰণ',
      culturalTag: 'গাঁৱৰ সাপ্তাহিক হাট',
      instructions: [
        'আইতাৰ বজাৰৰ তালিকাখন অলপ সময় মন দি চাওক।',
        'তালিকাখন লুকুৱাৰ পিছত, তাত থকা বস্তুবোৰত আঙুলিৰে স্পৰ্শ কৰক।',
        'বাছনি সম্পূৰ্ণ হ’লে নিশ্চিত কৰক।'
      ],
      voiceExplanation: 'আইতাৰ বজাৰৰ তালিকালৈ আপোনাক স্বাগতম। আইতাই গাঁৱৰ হাটৰ পৰা আনিবলগীয়া সামগ্ৰীৰ তালিকা প্ৰস্তুত কৰিছে। তালিকাখন মন দি চাওক। তালিকাখন লুকুৱাৰ পিছত আইতাৰ তালিকাত থকা বস্তুবোৰত স্পৰ্শ কৰক আৰু নিশ্চিত কৰক। খৰখেদা নকৰি আৰামেৰে খেলক।'
    },
    bn: {
      name: 'ঠাকুরমার বাজারের ফর্দ',
      subtitle: 'সাপ্তাহিক হাটের প্রয়োজনীয় জিনিস স্মরণ',
      culturalTag: 'গ্রামের হাট বাজার',
      instructions: [
        'ঠাকুরমার বাজারের ফর্দটি কিছুক্ষণ মন দিয়ে দেখুন।',
        'ফর্দটি লুকানোর পর, তালিকায় থাকা জিনিসগুলো স্পর্শ করুন।',
        'পছন্দ শেষ হলে নিশ্চিত বোতাম চাপুন।'
      ],
      voiceExplanation: 'ঠাকুরমার বাজারের ফর্দে স্বাগতম। ঠাকুরমা হাটের জন্য কিছু দরকারি জিনিস ঠিক করেছেন। জিনিসগুলো মন দিয়ে দেখে মনে রাখুন। এরপর তালিকায় থাকা জিনিসগুলো বেছে নিন।'
    },
    hi: {
      name: 'दादी की बाज़ार की सूची',
      subtitle: 'साप्ताहिक हाट बाज़ार के सामान की याददाश्त',
      culturalTag: 'गाँव की साप्ताहिक हाट',
      instructions: [
        'दादी की बाज़ार की सूची को कुछ सेकंड ध्यान से देखें।',
        'सूची छिप जाने के बाद, केवल उन्हीं वस्तुओं को छुएं जो सूची में थीं।',
        'तैयार होने पर अपनी टोकरी की पुष्टि करें।'
      ],
      voiceExplanation: 'दादी की बाज़ार की सूची में आपका स्वागत है। दादी ने गाँव के बाज़ार से लाने के लिए कुछ सामान चुने हैं। वस्तुओं को ध्यान से देखें और याद रखें। फिर उन पर टैप करें।'
    },
    mni: {
      name: 'Ibellogi Keithel List',
      subtitle: 'Haftagi keithelda lounaba potlam ningshingba',
      culturalTag: 'Khunagi Keithel',
      instructions: [
        'Ibellogi list asi matam khara yengbiyu.',
        'List lottaba matamda yaoriba potlamsing thubiyu.',
        'Loishinbada confirm toubiyu.'
      ],
      voiceExplanation: 'Ibellogi Keithel List ta taranna okchari. Ibellogi keithel potlamsing ningshingbiyu amashung thubiyu.'
    },
    lus: {
      name: 'Pi Bazar List',
      subtitle: 'Bazar thil lei tur hriat rengna',
      culturalTag: 'Khawpui Bazar',
      instructions: [
        'Pi bazar list hi ngun takin lo en rawh.',
        'A bo hnuah list a mi te kha thlang rawh.',
        'I peih hnuah confirm rawh.'
      ],
      voiceExplanation: 'Pi Bazar List ah kan lo lawm a che. Bazar thil turte hi ngun takin en la, a bo hnuah i hriat rengte kha thlang rawh.'
    },
    kha: {
      name: 'Ka List Iew I Mei-ieit',
      subtitle: 'Ki tiar iew ban kynmaw',
      culturalTag: 'Ka Iew Shnong',
      instructions: [
        'Peit bha ia ka list iew i mei-ieit.',
        'Haba la jah ka list, jied ia kito ki tiar.',
        'Pynskhem haba la dep.'
      ],
      voiceExplanation: 'Khublei sha ka list iew i mei-ieit. Peit ia ki tiar iew bad kynmaw ban jied ia ki haba la jah.'
    },
    grt: {
      name: 'Ambini Bazar List',
      subtitle: 'Bazar-o breani basturangko gisik ra·ani',
      culturalTag: 'Songni Bazar',
      instructions: [
        'Ambini bazar list-ko nambate nibo.',
        'List gimao, uano donggipa basturangko seokbo.',
        'Matchotahaon confirm ka·bo.'
      ],
      voiceExplanation: 'Ambini bazar list-ona rimchaksoa. Basturangko nambate nichengbo aro gisik ra·e seokbo.'
    },
    brx: {
      name: 'आबौनि हाथाइनि बिलाइ',
      subtitle: 'हाथाइनि बेसादफोरखौ गोसोखांनाय',
      culturalTag: 'गामिनि हाथाइ',
      instructions: [
        'आबौनि हाथाइ बिलाइखौ एसे सम नोजोर हो।',
        'बिलाइया एरसोनाय उनाव, थिक बेसादफोरखौ थु।',
        'जाखांनाय उनाव बासकेटखौ मोजां खालाम।'
      ],
      voiceExplanation: 'आबौनि हाथाइ बिलाइ गेलेनायाव बरायबाय। हाथाइनि बेसादफोरखौ गोसोआव लाखिनानै फिननाय हो।'
    }
  },

  // 2. Festival Memory Match
  'festival-memory-match': {
    en: {
      name: 'Festival Memory Match',
      subtitle: 'Pair matching with Bihu drums, hornpipes & hats',
      culturalTag: 'Bihu & Hornbill Festivals',
      instructions: [
        'Tap any closed card to reveal its festival symbol.',
        'Tap another card to find its matching twin pair.',
        'Remember where each card was located!'
      ],
      voiceExplanation: 'In Festival Memory Match, tap two cards at a time to find matching pairs of cultural instruments and festive symbols like the Bihu drum, hornpipe, and japi. Try to remember where each symbol was hidden.'
    },
    as: {
      name: 'উৎসৱৰ যোৰা মিলোৱা খেল',
      subtitle: 'ঢোল, পেঁপা আৰু জাপিৰ যোৰা বিচাৰি উলিওৱা',
      culturalTag: 'বিহু আৰু হৰ্ণবিল উৎসৱ',
      instructions: [
        'সাংস্কৃতিক প্ৰতীক চাবলৈ বন্ধ কাৰ্ডত স্পৰ্শ কৰক।',
        'একে ধৰণৰ আন এখন কাৰ্ড বিচাৰি যোৰা মিলাওক।',
        'কাৰ্ডবোৰ ক’ত আছিল মনত ৰাখক!'
      ],
      voiceExplanation: 'উৎসৱৰ যোৰা মিলোৱা খেলত দুখনকৈ কাৰ্ড খুলি একে ধৰণৰ ঢোল, পেঁপা নাইবা জাপিৰ যোৰা মিলাওক। কাৰ্ডবোৰ ক’ত আছিল মনত ৰাখিলে খেলটো অতি সহজ হ’ব।'
    },
    bn: {
      name: 'উৎসবের জোড়া মেলানো খেলা',
      subtitle: 'ঢোল, পেঁপা ও জপির জোড়া খুঁজে বের করা',
      culturalTag: 'বিহু ও লোক উৎসব',
      instructions: [
        'উৎসবের প্রতীক দেখতে যেকোনো বন্ধ কার্ড ছুঁয়ে খুলুন।',
        'একই রকমের দ্বিতীয় কার্ডটি খুঁজে জোড়া মেলান।',
        'কোন কার্ড কোথায় ছিল তা মনে রাখুন।'
      ],
      voiceExplanation: 'উৎসবের জোড়া মেলানো খেলায় দুটো করে কার্ড খুলে ঢাক, বাঁশি বা জপির মতো লোকজ প্রতীকের জোড়া মেলান।'
    },
    hi: {
      name: 'त्योहार स्मृति मिलान',
      subtitle: 'बिहू ढोल, पेपा और जापी के जोड़े मिलाएं',
      culturalTag: 'बिहू व लोक उत्सव',
      instructions: [
        'प्रतीक देखने के लिए किसी भी बंद कार्ड को छुएं।',
        'उसका मेल खाने वाला दूसरा कार्ड ढूंढकर जोड़ा बनाएं।',
        'याद रखें कि कौन सा कार्ड कहां रखा था!'
      ],
      voiceExplanation: 'त्योहार स्मृति मिलान में दो-दो कार्ड खोलकर बिहू ढोल, पेपा या जापी जैसे समान चित्रों के जोड़े बनाएं। शांत मन से खेलें।'
    },
    mni: {
      name: 'Kumedgi Ningshing Match',
      subtitle: 'Pung, Pepa amasung Leiranggi jora thiba',
      culturalTag: 'Kumed Thouram',
      instructions: ['Card amada thubiyu.', 'Mani manaba atei amaga jora sembiyu.', 'Card leiba mapham ningshingbiyu.'],
      voiceExplanation: 'Kumedgi ningshing match ta card ani-ani thubiraga manaba potlamsing jora sembiyu.'
    },
    lus: {
      name: 'Kut Hriatrengna Match',
      subtitle: 'Kut thil zawnchhuah leh inmil rem',
      culturalTag: 'Kut Leh Awle',
      instructions: ['Card pakhat hawng rawh.', 'A inmil pui tur dang hawng rawh.', 'Card awmna hmun hria rawh.'],
      voiceExplanation: 'Kut hriatrengna match ah hian card pahnih hawngin a inmil zawng rawh le.'
    },
    kha: {
      name: 'Ka Jingiabiap Shad Bad Kynmaw',
      subtitle: 'Ki dur shad bad jingrwai ban pyniahap',
      culturalTag: 'Ki Lehniam Shnong',
      instructions: ['Plied ia ka card.', 'Wad ia kawei pat kaba iasyriem.', 'Kynmaw ia ka jaka ba don ka card.'],
      voiceExplanation: 'Plied ia ki card ban wad ia ki dur kiba iasyriem bad pyniahap ia ki.'
    },
    grt: {
      name: 'Mani-Chani Gisik Match',
      subtitle: 'Dama aro dingtang dingtang ba·rarangko match ka·ani',
      culturalTag: 'Wangala Aro Bihu',
      instructions: ['Card-ko kulibo.', 'Apsan dakgipa card-ko am·bo.', 'Card-ni biapko gisik ra·bo.'],
      voiceExplanation: 'Ia kal·anio card gipin baksa apsan ong·gipako am·e match ka·bo.'
    },
    brx: {
      name: 'फोसावनाय गोसोखांथि',
      subtitle: 'खाम, सिफुं आरो जमग्रा बेसाद जोरा खालामनाय',
      culturalTag: 'बैसागु आरो हारिमु',
      instructions: ['काडखौ खेवनानै महर नाय।', 'बेजों समान गुबुन काडखौ नागिर।', 'काडनि जायगाखौ गोसोआव लाखि।'],
      voiceExplanation: 'फोसावनाय गेलेनायाव खाम आरो सिफुंनि महरफोरखौ जोरा खालामनानै गेले।'
    }
  },

  // 3. Daily Routine Recall
  'daily-routine-recall': {
    en: {
      name: 'Daily Routine Recall',
      subtitle: 'Put village morning tea & activities in order',
      culturalTag: 'Village Daily Rhythm',
      instructions: [
        'Look at the daily village activities at the bottom.',
        'Drag or tap each activity into its 1st to 5th chronological slot.',
        'Confirm the daily sequence when done.'
      ],
      voiceExplanation: 'In Daily Routine Recall, arrange typical daily events like having morning tea, watering garden plants, taking medicine, having lunch, and nighttime rest into their natural order from dawn to bedtime.'
    },
    as: {
      name: 'দৈনন্দিন কৰ্ম ক্ৰম',
      subtitle: 'ৰাতিপুৱাৰ চাহৰ পৰা নিশাৰ বিশ্ৰামলৈ ক্ৰম সজোৱা',
      culturalTag: 'গাঁৱৰ দৈনিক জীৱন',
      instructions: [
        'তলত থকা দৈনিক কামবোৰ মন দি চাওক।',
        'প্ৰথমৰ পৰা পঞ্চম স্থানলৈ ক্ৰমানুসৰি সজাওক।',
        'সকলোবোৰ সজোৱাৰ পিছত নিশ্চিত কৰক।'
      ],
      voiceExplanation: 'দৈনন্দিন কৰ্ম ক্ৰমত ৰাতিপুৱাৰ চাহ, বাগিচাৰ কাম, ঔষধ খোৱা, দুপৰীয়াৰ আহাৰ আৰু নিশাৰ শুৱনিলৈকে দিনটোৰ কামবোৰ সময় অনুসৰি সঠিক ক্ৰমত সজাওক।'
    },
    bn: {
      name: 'দৈনন্দিন কাজের ক্রম',
      subtitle: 'সকালের চা থেকে রাতের ঘুম পর্যন্ত ক্রম সাজান',
      culturalTag: 'গ্রামীণ দৈনন্দিন জীবন',
      instructions: [
        'নিচের দৈনন্দিন কাজগুলো মনোযোগ দিয়ে দেখুন।',
        'প্রথম থেকে পঞ্চম স্থান পর্যন্ত সময় অনুযায়ী সাজান।',
        'সাজানো শেষ হলে নিশ্চিত করুন।'
      ],
      voiceExplanation: 'দৈনন্দিন কাজের ক্রমে সকালের চা, ওষুধ খাওয়া, দুপুরের খাবার ও রাতের ঘুমের মতো কাজগুলোকে সময়মতো ক্রমানুসারে সাজিয়ে নিন।'
    },
    hi: {
      name: 'दैनिक दिनचर्या क्रम',
      subtitle: 'सुबह की चाय से लेकर रात के आराम तक क्रमबद्ध करें',
      culturalTag: 'गाँव की दिनचर्या',
      instructions: [
        'नीचे दी गई दैनिक गतिविधियों को देखें।',
        'उन्हें सुबह से रात के अनुसार 1 से 5 के क्रम में लगाएं।',
        'क्रम पूरा होने पर पुष्टि करें।'
      ],
      voiceExplanation: 'दैनिक दिनचर्या क्रम में सुबह की चाय, बागवानी, दवाई लेना, दोपहर का भोजन और रात के आराम को सही समय के अनुसार क्रम में लगाएं।'
    },
    mni: {
      name: 'Nitin Thabak Ningshingba',
      subtitle: 'Ahing-nungthilgi thabak machat kramba',
      culturalTag: 'Nitin Punsigi Echel',
      instructions: ['Nitin thabak thouna yengbiyu.', 'Ahanbadagi manga subada thambiyu.', 'Confirm toubiyu.'],
      voiceExplanation: 'Nitin thabak ningshingbada ayukki cha thakpadagi ahinggi tumbalao phaobagi thabaksing kramna thambiyu.'
    },
    lus: {
      name: 'Nitin Nunphung Remna',
      subtitle: 'Tukthuan atanga zan mut thlenga rem dan',
      culturalTag: 'Nitin Nunphung',
      instructions: ['Nitin thiltih te hi en la.', 'A indawt dan in 1 atanga 5 ah rem rawh.', 'I peih hnuah confirm rawh.'],
      voiceExplanation: 'Zing thingpui in atanga zan mut thlenga kan thil tih thin te hi a indawt in rem rawh le.'
    },
    kha: {
      name: 'Ki Kam Man La Ka Sngi',
      subtitle: 'Pynbeit ia ki kam naduh step haduh miet',
      culturalTag: 'Ka Jingim Man La Ka Sngi',
      instructions: ['Peit ia ki kam man la ka sngi.', 'Pynbeit naduh kaba 1 haduh kaba 5.', 'Pynskhem haba la dep.'],
      voiceExplanation: 'Pynbeit ia ki kam kiba ngi leh man la ka sngi naduh ka step haduh ka miet.'
    },
    grt: {
      name: 'Salanti Kamrangko Ritingatani',
      subtitle: 'Pringoni walo tusiani ritingko sulsul donani',
      culturalTag: 'Salanti Janggi Tangani',
      instructions: ['Salanti kamrangko nibo.', '1st-oni 5th-ona sulsul donbo.', 'Matchotahaon confirm ka·bo.'],
      voiceExplanation: 'Pringni cha ringani, sam ringani aro walo tusianiko sulsul ritingate donbo.'
    },
    brx: {
      name: 'सानफ्रोमबोनि हुदा गोसोखांनाय',
      subtitle: 'फुंनि चा लोंनायनिफ्राय हरनि उन्दुनायसिम फारिफाय साजायनाय',
      culturalTag: 'सानफ्रोमबोनि जिउ',
      instructions: ['गाहायनि सानफ्रोमबोनि खामानिफोरखौ नाय।', '1 निफ्राय 5 फारिसिम साजाय।', 'जाखांनाय उनाव थिक खालाम।'],
      voiceExplanation: 'फुंनिफ्राय हरसिम मावनाय खामानिफोरखौ फारिफाय साजायनानै फिननाय हो।'
    }
  },

  // 4. Shell Memory Trail
  'shell-memory-trail': {
    en: {
      name: 'Memory Trail',
      subtitle: 'Track the item with the glowing golden pearl',
      culturalTag: 'Daily Items Focus',
      instructions: [
        'Watch carefully as one item lights up with a golden pearl.',
        'Follow the item with your eyes as the items glide and swap positions.',
        'Tap the item where you think the pearl is hiding.'
      ],
      voiceExplanation: 'Watch carefully as a glowing pearl is placed under one of the items. Follow the item with your eyes as they shift across the screen, then tap where the pearl is hidden.'
    },
    as: {
      name: 'সোণালী মুকুতাৰ সন্ধান',
      subtitle: 'উজ্জ্বল মুকুতা থকা পাত্ৰটো চকুৰে অনুসৰণ কৰক',
      culturalTag: 'দৃষ্টি আৰু একাগ্রতা',
      instructions: [
        'কোনটো পাত্ৰত সোণালী মুকুতাটো আছে মন দি চাওক।',
        'পাত্ৰবোৰ ইফাল-সিফাল হ’লে চকুৰে লক্ষ্য ৰাখক।',
        'মুকুতাটো থকা পাত্ৰটোত স্পৰ্শ কৰক।'
      ],
      voiceExplanation: 'সোণালী মুকুতাৰ সন্ধান খেলত কোনটো বাটি বা পাত্ৰৰ তলত মুকুতাটো আছে চকুৰে লক্ষ্য কৰক। পাত্ৰবোৰ লৰচৰ হোৱাৰ পিছত সঠিক পাত্ৰটো বাচি লওক।'
    },
    bn: {
      name: 'মুক্তোর সন্ধান খেলা',
      subtitle: 'উজ্জ্বল মুক্তা থাকা পাত্রটি চোখে চোখে রাখুন',
      culturalTag: 'দৃষ্টি ও একাগ্রতা',
      instructions: [
        'কোন পাত্রের নিচে মুক্তাটি রয়েছে তা লক্ষ্য করুন।',
        'পাত্রগুলো স্থানান্তর হলে চোখ দিয়ে অনুসরণ করুন।',
        'মুক্তা থাকা পাত্রটি বেছে নিন।'
      ],
      voiceExplanation: 'একটি পাত্রের নিচে উজ্জ্বল মুক্তা রাখা হবে। পাত্রগুলো অদলবদল হওয়ার সময় চোখ রাখুন এবং সঠিক পাত্রটি নির্বাচন করুন।'
    },
    hi: {
      name: 'मोती की खोज',
      subtitle: 'चमकते मोती वाले बर्तन पर नज़र रखें',
      culturalTag: 'एकाग्रता अभ्यास',
      instructions: [
        'देखें कि किस बर्तन के नीचे सुनहरा मोती रखा गया है।',
        'बर्तनों के स्थान बदलने पर अपनी नज़र उस पर बनाए रखें।',
        'मोती वाले सही बर्तन को छुएं।'
      ],
      voiceExplanation: 'मोती की खोज में देखें कि सुनहरा मोती किस बर्तन के नीचे है। बर्तनों के हिलने पर ध्यान से देखें और अंत में सही बर्तन पर टैप करें।'
    },
    mni: {
      name: 'Muthigi Lambi',
      subtitle: 'Sana muthi leiba potlamdi yengbiyu',
      culturalTag: 'Pukning Changba',
      instructions: ['Muthi yaoriba potlam nambate yengbiyu.', 'Potlam hongdokpada mitna ningshingbiyu.', 'Muthi leiba mapham thubiyu.'],
      voiceExplanation: 'Sana muthi leiba potlamdi mitna enbiyu amashung aroibada thubiyu.'
    },
    lus: {
      name: 'Tangka Hriat Zawnna',
      subtitle: 'Tangka thuhrukna en zui rawh',
      culturalTag: 'Fimkhur Zawnna',
      instructions: ['Tangka dahna kha ngun takin en rawh.', 'An insawn kual lai khan i mitin zui rawh.', 'A awmna i rin kha kawk rawh.'],
      voiceExplanation: 'Tangka thuhrukna kha en tlat la, an insawn zawhah a awmna zawn chhuak rawh le.'
    },
    kha: {
      name: 'Ka Jingbuh Riang Ia U Mawkordor',
      subtitle: 'Bud ia u mawkordor da ki khmat',
      culturalTag: 'Ka Jingpeit Bha',
      instructions: ['Peit bha ia u mawkordor ha kano ka pliang.', 'Bud da ki khmat haba ki pynkhih.', 'Tuh ia kaba don u mawkordor.'],
      voiceExplanation: 'Peit bha ia u mawkordor haba ki pynkhih ia ki pliang bad jied ia kaba biang.'
    },
    grt: {
      name: 'Mukta Amani Kal·ani',
      subtitle: 'Sonani muktako mikronchi ja·rikbo',
      culturalTag: 'Gisik On·e Niani',
      instructions: ['Mukta donggipa biapko nichengbo.', 'Bratangko jitmitingo mikronchi ja·rikbo.', 'Mukta donggipa biapko seokbo.'],
      voiceExplanation: 'Mukta donggipa biapko nambate ja·rikbo aro uano jotbo.'
    },
    brx: {
      name: 'मुकुता नागिरनाय',
      subtitle: 'सोनानि मुकुता थानाय बेसादखौ नोजोर हो',
      culturalTag: 'नोजोर गोसोखांथि',
      instructions: ['मुकुता थानाय बेसादखौ नाय।', 'जायगा सोलायनायाव नोजोर हो।', 'मुकुता थानाय बेसादखौ थु।'],
      voiceExplanation: 'सोनानि मुकुता थानाय बेसादखौ मोजाङै नोजोर होनानै नागिरना दिहुन।'
    }
  },

  // 5. What Belongs Here (Reasoning)
  'what-belongs-here': {
    en: {
      name: 'What Belongs Here?',
      subtitle: 'Household sorting into kitchen, prayer room & courtyard',
      culturalTag: 'Homestead Sorting',
      instructions: [
        'Look at the traditional household items at the bottom.',
        'Assign each item to its rightful room: Kitchen, Prayer Room, or Courtyard.',
        'Tap confirm when all items are sorted.'
      ],
      voiceExplanation: 'In What Belongs Here, sort traditional home items into their rightful rooms, such as placing the tea kettle in the kitchen, the prayer bell in the prayer room, and the garden broom in the courtyard.'
    },
    as: {
      name: 'ঘৰৰ সামগ্ৰী সজোৱা খেল',
      subtitle: 'পাকঘৰ, নামঘৰ আৰু চোতালৰ সামগ্ৰী শ্ৰেণীভুক্ত কৰক',
      culturalTag: 'ঘৰুৱা ব্যৱস্থাপনা',
      instructions: [
        'তলত থকা ঘৰুৱা বস্তুবোৰ মন দি চাওক।',
        'প্ৰতিটো বস্তু নিজৰ স্থানলৈ পঠিয়াওক: পাকঘৰ, নামঘৰ নাইবা চোতাল।',
        'সকলো সজোৱাৰ পিছত নিশ্চিত কৰক।'
      ],
      voiceExplanation: 'ঘৰৰ সামগ্ৰী সজোৱা খেলত চাহৰ কেটলী পাকঘৰত, নামঘৰত কাঁহ-ঘণ্টি আৰু চোতালত জাপি বা বাঢ়নীৰ দৰে বস্তুবোৰ নিজ নিজ ঠাইত সজাওক।'
    },
    bn: {
      name: 'ঘরের জিনিস সাজানোর খেলা',
      subtitle: 'রান্নাঘর, ঠাকুরঘর ও উঠোনের জিনিস সঠিক স্থানে রাখুন',
      culturalTag: 'গৃহস্থালির বিন্যাস',
      instructions: [
        'নিচের গৃহস্থালির জিনিসগুলো দেখুন।',
        'প্রতিটি জিনিস সঠিক স্থানে রাখুন: রান্নাঘর, ঠাকুরঘর বা উঠোন।',
        'সব সাজানো হলে নিশ্চিত করুন।'
      ],
      voiceExplanation: 'ঘরের জিনিস সাজানোর খেলায় চায়ের কেতলি রান্নাঘরে, পূজার ঘণ্টা ঠাকুরঘরে এবং উঠোনের জিনিস উঠোনে সাজিয়ে রাখুন।'
    },
    hi: {
      name: 'सही कमरे में सामान रखें',
      subtitle: 'रसोई, पूजा घर और आंगन की वस्तुओं को व्यवस्थित करें',
      culturalTag: 'घरेलू व्यवस्था',
      instructions: [
        'नीचे दिए गए घरेलू सामान को देखें।',
        'प्रत्येक वस्तु को उसके सही कमरे में रखें: रसोई, पूजा घर या आँगन।',
        'सभी सामान रखने के बाद पुष्टि करें।'
      ],
      voiceExplanation: 'इस खेल में चाय की केतली को रसोई में, पूजा की घंटी को पूजा घर में और झाड़ू या टोपी को आँगन में सही जगह पर रखें।'
    },
    mni: {
      name: 'Kadaida Thamgani?',
      subtitle: 'Chakshang, Laining-thasang amasung Sumanggi potlam',
      culturalTag: 'Yumgi Potlam',
      instructions: ['Yumgi potlam yengbiyu.', 'Chakshang, Laining thasangda fajana thambiyu.', 'Confirm toubiyu.'],
      voiceExplanation: 'Yumgi potlamsing maram chana makhagi mapham khudingda thambiyu.'
    },
    lus: {
      name: 'Khawi Hmunah Nge A Awm Ang?',
      subtitle: 'Choka, Biak In hmun leh Tualzawl thil dah fel',
      culturalTag: 'In Chhung Enkawl',
      instructions: ['In chhung thil te hi en rawh.', 'Choka, Tawngtai hmun leh Tualzawlah dah rawh.', 'Confirm rawh.'],
      voiceExplanation: 'In chhung thil te hi an awmna hmun dik takah dah fel rawh le.'
    },
    kha: {
      name: 'Kaei Kaba Dei Hangne?',
      subtitle: 'Pynbynta sha ka rympei, kamra duwai bad phyllaw',
      culturalTag: 'Ka Jingpynbeit Iing',
      instructions: ['Peit ia ki tiar iing.', 'Buh ha ka rympei, kamra duwai ne phyllaw.', 'Pynskhem haba la dep.'],
      voiceExplanation: 'Buh ia ki tiar iing ha ki kamra kiba dei kum ka rympei, kamra duwai ne phyllaw.'
    },
    grt: {
      name: 'Badia Biapona Nang·a?',
      subtitle: 'Song·chakani, Bi·chakani aro Saraoni basturang',
      culturalTag: 'Nokni Basturang',
      instructions: ['Nokni basturangko nibo.', 'Song·chakani, Bi·chakani ba Saraona donbo.', 'Confirm ka·bo.'],
      voiceExplanation: 'Nokni basturangko an·tangtangni biapona name donbo.'
    },
    brx: {
      name: 'बबे जायगायाव थागोन?',
      subtitle: 'संखं, पुजा खथा आरो आंगिनानि बेसाद साजायनाय',
      culturalTag: 'न’नि बेसाद',
      instructions: ['न’नि बेसादफोरखौ नाय।', 'संखं, पुजा खथा एबा आंगिनायाव दोन।', 'जाखांनाय उनाव थिक खालाम।'],
      voiceExplanation: 'न’नि बेसादफोरखौ मोजाङै थिक खथायाव साजायनानै दोन।'
    }
  },

  // 6. Pack Village Basket
  'pack-village-basket': {
    en: {
      name: 'Pack the Village Basket',
      subtitle: 'Pick only picnic items & leave farm tools behind',
      culturalTag: 'Village River Picnic',
      instructions: [
        'Read Grandma’s picnic prompt at the top.',
        'Tap only the picnic refreshments (pitha, tea, water bottle).',
        'Avoid sharp farm tools like sickles and pestles!'
      ],
      voiceExplanation: 'In Pack the Village Basket, select delicious snacks and refreshments for a riverside picnic like tea and pitha, while leaving garden tools behind.'
    },
    as: {
      name: 'বনভোজৰ খৰাহী সজোৱা',
      subtitle: 'নদীৰ পাৰৰ বনভোজৰ খোৱা বস্তু বাচি লওক',
      culturalTag: 'নদীৰ পাৰৰ বনভোজ',
      instructions: [
        'ওপৰৰ বনভোজৰ তালিকাখন পঢ়ক।',
        'কেৱল বনভোজত খোৱা বস্তু বাছক (পিঠা, চাহ, পানী)।',
        'দা, কোৰ বা খেতিৰ সঁজুলিবোৰ বাদ দিয়ক!'
      ],
      voiceExplanation: 'বনভোজৰ খৰাহী সজোৱা খেলত নদীৰ পাৰৰ বনভোজৰ বাবে চাহ, পিঠা আৰু পানীৰ দৰে লঘু আহাৰবোৰ বাচি খৰাহীত ভৰাওক আৰু খেতিৰ সঁজুলিবোৰ বাদ দিয়ক।'
    },
    bn: {
      name: 'পিকনিকের ঝুড়ি সাজানো',
      subtitle: 'নদীর পাড়ে পিকনিকের জন্য খাবার জিনিস বেছে নিন',
      culturalTag: 'নদীর পাড়ে বনভোজন',
      instructions: [
        'পিকনিকের জন্য প্রয়োজনীয় খাবার বেছে নিন।',
        'পিঠা, চা ও ফলের মতো খাবার ঝুড়িতে রাখুন।',
        'কাস্তে বা কোদালের মতো ভারী জিনিস এড়িয়ে চলুন।'
      ],
      voiceExplanation: 'বনভোজনের জন্য চা, পিঠা ও সুস্বাদু খাবারের জিনিসগুলো ঝুড়িতে বেছে নিন।'
    },
    hi: {
      name: 'पिकनिक की टोकरी सजाएं',
      subtitle: 'नदी किनारे पिकनिक के लिए केवल खाने-पीने का सामान चुनें',
      culturalTag: 'गाँव की पिकनिक',
      instructions: [
        'पिकनिक के लिए उपयुक्त स्वादिष्ट खाद्य पदार्थ चुनें।',
        'चाय, पीठा और पानी की बोतल जैसी चीज़ों को टोकरी में रखें।',
        'हँसिया या कुदाल जैसे औज़ारों को छोड़ दें।'
      ],
      voiceExplanation: 'पिकनिक की टोकरी में चाय, पीठा और फल जैसी खाने की चीजें रखें और खेती के औजारों को छोड़ दें।'
    },
    mni: {
      name: 'Picnic Thambal Thaba',
      subtitle: 'Chaningba chinjak khakta khallaga thambiyu',
      culturalTag: 'Picnic Chatpa',
      instructions: ['Picnic potlam khaktang khallu.', 'Pitha, cha amashung eshing khallu.', 'Yumgi thabakki pot louthok-u.'],
      voiceExplanation: 'Picnic chatnaba chaba-thakpagi potlamsing khaktang khallaga thambiyu.'
    },
    lus: {
      name: 'Picnic Bawm Siam',
      subtitle: 'Chawlhhmuna ei tur chauh thlang rawh',
      culturalTag: 'Lui Kama Chawlhhmun',
      instructions: ['Picnic ei tur chauh thlang rawh.', 'Thingpui, chhang leh tui thlang rawh.', 'Hna thawh hmanraw dah suh.'],
      voiceExplanation: 'Picnic a ei tur thingpui leh chhang te chauh bawmah dah rawh le.'
    },
    kha: {
      name: 'Ka Shang Bam Khana',
      subtitle: 'Jied tang ia ki jingbam bam khana',
      culturalTag: 'Ka Leit Bam Khana',
      instructions: ['Jied tang ia ki jingbam.', 'Sha, kpu bad um dih.', 'Ki tiar trei kper klet noh.'],
      voiceExplanation: 'Jied tang ia ki jingbam kiba sngewbha ban leit bam khana sha wah.'
    },
    grt: {
      name: 'Picnic-na Kokko Dakani',
      subtitle: 'Cha-ringani basturangko san seokbo',
      culturalTag: 'Chibima Samni Picnic',
      instructions: ['Cha-ringani basturangko seokbo.', 'Pitha, cha aro chirangko ra·bo.', 'Gamani basturangko watbo.'],
      voiceExplanation: 'Picnic-na cha-ringani basturangko kok-o chipbo aro gipin basturangko watbo.'
    },
    brx: {
      name: 'पिकनिकनि बासकेट साजायनाय',
      subtitle: 'दैसा सेरनि पिकनिकनि थाखाय जाग्रा बेसाद सायख’',
      culturalTag: 'दैसा सेरनि पिकनिक',
      instructions: ['पिकनिकनि जाग्रा बेसाद सायख’।', 'पिथा, चा आरो दै लोंनाय बेसाद सायख’।', 'खेथिनि हाथियारफोरखौ गार।'],
      voiceExplanation: 'पिकनिकनि थाखाय जाग्रा-लोंग्रा बेसादफोरखौ बासकेटाव सायख’नानै ला।'
    }
  },

  // 7. Whose Emotion (Emotional Cognition)
  'whose-emotion': {
    en: {
      name: "Whose Emotion?",
      subtitle: 'Match facial expressions with heartwarming village situations',
      culturalTag: 'Empathy & Expressions',
      instructions: [
        'Look at the emotion prompt (Joyful, Calm, Surprised).',
        'Read or listen to the four village situations.',
        'Tap the situation that naturally evokes that feeling.'
      ],
      voiceExplanation: 'In Whose Emotion, connect heartwarming feelings like joy, peaceful calmness, or surprise with situations from daily life in the village.'
    },
    as: {
      name: 'ভাৱ আৰু মনৰ ভাব',
      subtitle: 'আনন্দ, শান্তি আৰু আৱেগৰ সৈতে পৰিস্থিতি মিলাওক',
      culturalTag: 'সহানুভূতি আৰু আৱেগ',
      instructions: [
        'মনৰ ভাবটো চাওক (আনন্দিত, শান্ত, আচৰিত)।',
        'চাৰিটা ঘৰুৱা পৰিস্থিতি মন দি পঢ়ক বা শুনক।',
        'যিটো পৰিস্থিতিত সেই অনুভৱ হয়, তাত স্পৰ্শ কৰক।'
      ],
      voiceExplanation: 'ভাৱ আৰু মনৰ ভাব খেলত আনন্দ, শান্তি নাইবা পৰিয়ালৰ মিলনৰ দৰে মনৰ অনুভূতিবোৰৰ সৈতে সঠিক পৰিস্থিতিটো বাচি লওক।'
    },
    bn: {
      name: 'ভাব ও অনুভূতির মিল',
      subtitle: 'আনন্দ, শান্তি ও আবেগের সাথে গ্রামীণ পরিস্থিতি মেলান',
      culturalTag: 'সহানুভূতি ও মনন',
      instructions: [
        'মনের ভাবটি দেখুন (আনন্দিত, শান্ত, আশ্চর্য)।',
        'চারটি পরিস্থিতি মনোযোগ দিয়ে পড়ুন বা শুনুন।',
        'যে পরিস্থিতিতে এই অনুভূতি হয় তা নির্বাচন করুন।'
      ],
      voiceExplanation: 'মনের ভাব ও অনুভূতির সাথে গ্রামের আনন্দময় মুহূর্তগুলোর সঠিক মিল খুঁজে নিন।'
    },
    hi: {
      name: 'भाव और भावनाएं पहचानें',
      subtitle: 'खुशी, शांति और आश्चर्य के साथ गाँव की स्थितियों का मिलान करें',
      culturalTag: 'सहानुभूति व समझ',
      instructions: [
        'दी गई भावना को देखें (प्रसन्न, शांत, आश्चर्यचकित)।',
        'गाँव की चार स्थितियों को पढ़ें या सुनें।',
        'उस स्थिति को चुनें जो स्वाभाविक रूप से यह भावना लाती है।'
      ],
      voiceExplanation: 'इस खेल में खुशी, शांति और अपनापन जैसी भावनाओं को गाँव की सही परिस्थितियों से जोड़ें।'
    },
    mni: {
      name: 'Pukninggi Phibam',
      subtitle: 'Haraoba, Shanthiba amashung nungcba phibam thiba',
      culturalTag: 'Pukning Nungshiba',
      instructions: ['Phibam yengbiyu.', 'Wari mari leiba thabak thubiyu.', 'Correct answer thibiyu.'],
      voiceExplanation: 'Pukninggi haraoba amashung shanthibagi phibam khallaga matik chaba thabak thubiyu.'
    },
    lus: {
      name: 'Tu Rilru Nge?',
      subtitle: 'Hlimna, thlamuanna leh rilru puthmang hriatthiamna',
      culturalTag: 'Rilru Veina',
      instructions: ['Rilru puthmang en rawh.', 'Khaw chhung thil thleng pali te chhiar la.', 'A inmil ber thlang rawh.'],
      voiceExplanation: 'Hlimna leh thlamuanna rilru puthmang nena inmil ber thil thleng thlang rawh le.'
    },
    kha: {
      name: 'Ka Jingiasngew Jongno?',
      subtitle: 'Ka jingsngewbha, jingsuk bad jingsngewrit',
      culturalTag: 'Ka Jingmut Bha',
      instructions: ['Peit ia ka jingsngew.', 'Pule ia ki saw tylli ki jingjia.', 'Jied ia kaba iadei bad kata ka jingsngew.'],
      voiceExplanation: 'Jied ia ka jingjia kaba pynlong ia ka jingsngewbha ne jingsuk ha iing ha sem.'
    },
    grt: {
      name: 'Saniba Ka·dongani?',
      subtitle: 'Kusiongani, Tom·tomani aro Gisik An·sengani',
      culturalTag: 'Gisikni Kusiongani',
      instructions: ['Ka·donganiko nibo.', 'Songni obostharangko poraibo.', 'Ua obosthako seokbo.'],
      voiceExplanation: 'Kusiongani aro tom·tomaniko songni namgipa obostharang baksa match ka·bo.'
    },
    brx: {
      name: 'सोरनि गोसोनि भाव?',
      subtitle: 'गोजोननाय, शान्ति आरो अननायनि भाव सायख’नाय',
      culturalTag: 'अनसायलायनाय',
      instructions: ['गोसोनि भावखौ नाय।', 'गामिनि जाथाइफोरखौ फराय।', 'उथ्रायनाय जाथाइखौ थु।'],
      voiceExplanation: 'गोजोननाय आरो अननायनि भावजों समान जानाय जाथाइखौ बासिनानै ला।'
    }
  },

  // 8. Find The Difference
  'find-the-difference': {
    en: {
      name: 'Find the Difference',
      subtitle: 'Identify subtle variations in handloom shawls & crafts',
      culturalTag: 'Handloom & Weaves',
      instructions: [
        'Examine the four textile pattern tiles.',
        'Three tiles have the exact same motif.',
        'Tap the one tile that has a subtle difference!'
      ],
      voiceExplanation: 'In Find the Difference, examine the traditional handloom weave tiles. Look carefully and tap the one tile that has a different color or symbol from the others.'
    },
    as: {
      name: 'পাৰ্থক্য বিচাৰক',
      subtitle: 'তাঁতৰ বস্ত্ৰৰ চানেকিৰ মাজত সামান্য পাৰ্থক্যটো চিনাক্ত কৰক',
      culturalTag: 'তাঁতশালৰ বস্ত্ৰশিল্প',
      instructions: [
        'চাৰিটা বস্ত্ৰ চানেকিৰ টাইল মন দি পৰীক্ষা কৰক।',
        'তিনিটা টাইলৰ ডিজাইন একেবাৰে একে।',
        'যিটো টাইল সামান্য বেলেগ, তাত স্পৰ্শ কৰক!'
      ],
      voiceExplanation: 'পাৰ্থক্য বিচাৰক খেলত কাপোৰৰ চানেকিৰ চাৰিটা টাইল মন দি চাওক আৰু যিটো টাইল আন তিনিটাতকৈ সামান্য বেলেগ, তাত স্পৰ্শ কৰক।'
    },
    bn: {
      name: 'পার্থক্য খুঁজে বের করুন',
      subtitle: 'তাঁতের কাপড়ের নকশার মধ্যে সূক্ষ্ম অমিলটি চিহ্নিত করুন',
      culturalTag: 'তাঁতশিল্পের নিদর্শন',
      instructions: [
        'কাপড়ের নকশার চারটি টাইল মনোযোগ দিয়ে দেখুন।',
        'তিনটি টাইল দেখতে হুবহু এক রকম।',
        'যে টাইলটি একটু আলাদা, সেটি স্পর্শ করুন।'
      ],
      voiceExplanation: 'চারটি নকশার মধ্যে যেটি অন্যগুলোর চেয়ে কিছুটা আলাদা, মনোযোগ দিয়ে দেখে সেটি বেছে নিন।'
    },
    hi: {
      name: 'अंतर पहचानें',
      subtitle: 'हथकरघा शॉल और नमूनों में सूक्ष्म अंतर खोजें',
      culturalTag: 'हथकरघा कला',
      instructions: [
        'चारों वस्त्र नमूनों को ध्यान से देखें।',
        'तीन नमूने बिल्कुल एक जैसे हैं।',
        'जो एक नमूना अलग है, उस पर टैप करें!'
      ],
      voiceExplanation: 'इस खेल में चारों कपड़ों के नमूनों को ध्यान से देखें और जो एक नमूना बाकी तीनों से अलग है, उसे पहचानें।'
    },
    mni: {
      name: 'Khetnaba Thiba',
      subtitle: 'Innaphi fajatana yengbada khetnaba thiba',
      culturalTag: 'Khutsa Heiba',
      instructions: ['Tile mari yengbiyu.', 'Ahumdi chap mannei.', 'Khetnariba amaduda thubiyu.'],
      voiceExplanation: 'Innaphigi tile marigi manungda khetnariba amadu fajatana thubiyu.'
    },
    lus: {
      name: 'A Danglam Zawnna',
      subtitle: 'Puan tah ze zinga a danglam ber zawnna',
      culturalTag: 'Puan Tah Ze',
      instructions: ['Puan tah ze pali te hi en rawh.', 'Pathum chu an inang vek.', 'A danglam ber kha thlang rawh.'],
      voiceExplanation: 'Puan tah ze pali zinga a danglam ber kha zawn chhuak rawh le.'
    },
    kha: {
      name: 'Ka Jingiapher Dur',
      subtitle: 'Shem ia ka dur kaba iapher ha ki jain',
      culturalTag: 'Ka Tha Jain',
      instructions: ['Peit ia ki saw tylli ki dur jain.', 'Lai tylli ki iasyriem bha.', 'Jied ia kaba iapher.'],
      voiceExplanation: 'Peit bha ia ki dur jain bad jied ia kaba iapher na kiwei.'
    },
    grt: {
      name: 'Dingtangko Amani',
      subtitle: 'Bara dakanio dingtanggrikako amani',
      culturalTag: 'Bara Dokani',
      instructions: ['Tile brigiko nibo.', 'Gittam apsan ong·a.', 'Dingtang ong·gipako seokbo.'],
      voiceExplanation: 'Bara dakanirangko nambate nie dingtang ong·gipako seokbo.'
    },
    brx: {
      name: 'फाराग दिहुननाय',
      subtitle: 'दामनाय-बांनाय सि-जोमनि फारागखौ नागिरनाय',
      culturalTag: 'हारिमुनि दामनाय',
      instructions: ['ब्रै मोहरफोरखौ मोजाङै नाय।', 'मोनथाम महरआ समान।', 'फाराग थानाय मोनसेखौ थु।'],
      voiceExplanation: 'ब्रै महरनि मादाव फाराग जानाय मोनसेखौ सायख’नानै ला।'
    }
  },

  // 9. Tea Garden Detective
  'tea-garden-detective': {
    en: {
      name: 'Tea Garden Detective',
      subtitle: 'Spot hidden fauna & birds among tea bushes',
      culturalTag: 'Assam Tea Estates',
      instructions: [
        'Look carefully at the lush green tea garden scene.',
        'Spot the target bird or wildlife creature hiding in the tea bushes.',
        'Tap directly on the hidden subject when found!'
      ],
      voiceExplanation: 'In Tea Garden Detective, look closely at the tea bushes to find hidden tea garden birds and gentle wildlife. Tap where they are hiding.'
    },
    as: {
      name: 'চাহ বাগিচাৰ অনুসন্ধান',
      subtitle: 'চাহ গছৰ আঁৰত লুকাই থকা চৰাই-চিৰিকটি বিচাৰি উলিওৱা',
      culturalTag: 'অসমৰ চাহ বাগিচা',
      instructions: [
        'সেউজীয়া চাহ বাগিচাখন মন দি পৰ্যবেক্ষণ কৰক।',
        'চাহ গছৰ মাজত লুকাই থকা চৰাই বা জীৱ-জন্তু বিচাৰক।',
        'লুকাই থকা বস্তুটো দেখা পালে তাত স্পৰ্শ কৰক!'
      ],
      voiceExplanation: 'চাহ বাগিচাৰ অনুসন্ধান খেলত সেউজীয়া চাহ গছৰ পাতৰ আঁৰত লুকাই থকা চৰাই বা পখিলা মন দি বিচাৰি উলিয়াই স্পৰ্শ কৰক।'
    },
    bn: {
      name: 'চা বাগানের গোয়েন্দা',
      subtitle: 'চা গাছের আড়ালে লুকানো পাখি ও জীবজন্তু সন্ধান',
      culturalTag: 'চা বাগান ও প্রকৃতি',
      instructions: [
        'সবুজ চা বাগানটি মনোযোগ দিয়ে দেখুন।',
        'চা গাছের ফাঁকে লুকানো পাখি বা প্রাণী খুঁজুন।',
        'দেখা পেলে সেটির উপর স্পর্শ করুন।'
      ],
      voiceExplanation: 'চা বাগানের সুন্দর দৃশ্যে লুকানো পাখি বা প্রকৃতিটিকে খুঁজে বের করুন।'
    },
    hi: {
      name: 'चाय बागान खोजी',
      subtitle: 'चाय की झाड़ियों में छिपे पक्षियों और जीवों को खोजें',
      culturalTag: 'असम के चाय बागान',
      instructions: [
        'हरे-भरे चाय बागान के दृश्य को ध्यान से देखें।',
        'झाड़ियों में छिपे पक्षी या जीव को पहचानें।',
        'मिलने पर उस पर टैप करें!'
      ],
      voiceExplanation: 'चाय बागान खोजी में हरी पत्तियों के बीच छिपे पक्षी या सुंदर तितली को ध्यान से खोजें।'
    },
    mni: {
      name: 'Cha Pambigi Thiba',
      subtitle: 'Cha pambigi maraktagi ucheksing thiba',
      culturalTag: 'Cha Pambi',
      instructions: ['Cha pambi fajana yengbiyu.', 'Lottaba uchek thibiyu.', 'Thonglaga thubiyu.'],
      voiceExplanation: 'Cha pambigi manungda lottaba uchek thidoklaga thubiyu.'
    },
    lus: {
      name: 'Thingpui Huan Enchianna',
      subtitle: 'Thingpui hnah zinga sava biru zawnna',
      culturalTag: 'Thingpui Huan',
      instructions: ['Thingpui huan ngun takin en rawh.', 'Sava biru kha zawng chhuak rawh.', 'I hmuh rualin kawk rawh.'],
      voiceExplanation: 'Thingpui huan zinga sava biru kha ngun takin zawng chhuak rawh le.'
    },
    kha: {
      name: 'Ka Jingwad Ha Kper Sha',
      subtitle: 'Wad ia ki sim kiba rieh ha ki dieng sha',
      culturalTag: 'Ka Kper Sha',
      instructions: ['Peit bha ia ka kper sha.', 'Wad ia ki sim kiba rieh.', 'Tuh haba la iohi.'],
      voiceExplanation: 'Wad ia ki sim kiba rieh hapdeng ki sla dieng sha.'
    },
    grt: {
      name: 'Cha Baganni Am·ani',
      subtitle: 'Cha bijakrangni gisepo donggipa do·orangko am·ani',
      culturalTag: 'Cha Baganko Niani',
      instructions: ['Cha baganko nambate nibo.', 'Donnugipa do·oko am·bo.', 'Nikahaon uano jotbo.'],
      voiceExplanation: 'Cha bijakrangni gisepo donnugipa do·oko am·e seokbo.'
    },
    brx: {
      name: 'चा बागाननि नागिरनाय',
      subtitle: 'चा बिफांनि गेजेराव एरसोना थानाय दाउसिन नागिरनाय',
      culturalTag: 'चा बागान',
      instructions: ['चा बागानखौ मोजाङै नाय।', 'एरसोना थानाय दाउसिनखौ नागिर।', 'नुनाय लोगो लोगो थु।'],
      voiceExplanation: 'चा बिफांनि गेजेराव एरसोना थानाय दाउसिनखौ नागिरनानै दिहुन।'
    }
  },

  // 10. Memory Map Home
  'memory-map-home': {
    en: {
      name: 'Village Path Home',
      subtitle: 'Guide the elder safely through familiar village trails',
      culturalTag: 'Village Spatial Trails',
      instructions: [
        'Look at the starting pond, banyan tree, and home destination.',
        'Choose the peaceful, safe village path without obstacles.',
        'Reach home safely at your own comfortable pace.'
      ],
      voiceExplanation: 'In Village Path Home, trace the gentle, peaceful pathway leading past the village banyan tree and pond back to home.'
    },
    as: {
      name: 'ঘৰলৈ যোৱা বাট',
      subtitle: 'বৰগছ আৰু পুখুৰীৰ মাজেৰে ঘৰলৈ সুৰক্ষিত বাট বাছক',
      culturalTag: 'গাঁৱৰ চিনাকি বাট',
      instructions: [
        'পুখুৰী, বৰগছ আৰু ঘৰৰ স্থান মন দি চাওক।',
        'সকলো বাধা এৰাই সুৰক্ষিত বাটটো বাচি লওক।',
        'ধীৰে ধীৰে নিজৰ আৰামমতে ঘৰত উপস্থিত হওক।'
      ],
      voiceExplanation: 'ঘৰলৈ যোৱা বাট খেলত পুখুৰী আৰু বৰগছৰ কাষেৰে নিজৰ ঘৰলৈ সুৰক্ষিত আৰু শান্ত বাটটো বাচি লওক।'
    },
    bn: {
      name: 'বাড়ি ফেরার মেঠোপথ',
      subtitle: 'বটগাছ ও পুকুরের পাশ দিয়ে বাড়ি ফেরার নিরাপদ পথ',
      culturalTag: 'চেনা মেঠোপথ',
      instructions: [
        'পুকুর, বটগাছ ও বাড়ির অবস্থানটি দেখুন।',
        'বাধা এড়িয়ে সবচেয়ে নিরাপদ পথটি বেছে নিন।',
        'শান্তভাবে হেঁটে নিরাপদে বাড়ি পৌঁছান।'
      ],
      voiceExplanation: 'গ্রামের শান্ত মেঠোপথ ধরে চেনা গাছ ও পুকুর পেরিয়ে নিরাপদে ঘরে ফিরে আসুন।'
    },
    hi: {
      name: 'घर लौटने का रास्ता',
      subtitle: 'बरगद के पेड़ और तालाब से होकर घर का सुरक्षित मार्ग चुनें',
      culturalTag: 'गाँव की पगडंडी',
      instructions: [
        'तालाब, बरगद का पेड़ और घर की स्थिति देखें।',
        'रुकावटों से बचकर सबसे सुरक्षित और शांत रास्ता चुनें।',
        'आराम से सुरक्षित घर पहुंचें।'
      ],
      voiceExplanation: 'घर लौटने का रास्ता खेल में गाँव के बरगद के पेड़ और तालाब से होकर अपने घर का सही रास्ता चुनें।'
    },
    mni: {
      name: 'Yumda Hallakpagi Lambi',
      subtitle: 'Khunagi pukhridagi yum phaobagi lambi',
      culturalTag: 'Khunagi Lambi',
      instructions: ['Pukhri amashung yum yengbiyu.', 'Lambi faba khallu.', 'Yumda mayol charo.'],
      voiceExplanation: 'Khunagi pukhridagi yum phaobagi fajaraba lambi khallaga hallak-u.'
    },
    lus: {
      name: 'In Panna Kawng',
      subtitle: 'Dil leh thingbuk kal tlanga in panna kawng',
      culturalTag: 'Khaw Chhung Kawng',
      instructions: ['Dil leh in awmna en rawh.', 'Kawng him ber thlang rawh.', 'In thleng thleng kal rawh.'],
      voiceExplanation: 'Khaw chhung dil leh thingbuk kal tlanga in panna kawng him ber thlang rawh le.'
    },
    kha: {
      name: 'Ka Lynti Sha Iing',
      subtitle: 'Iaid lyngba ki nan bad dieng ban poi iing',
      culturalTag: 'Ka Lynti Shnong',
      instructions: ['Peit ia ka nan bad ka iing.', 'Jied ia ka lynti kaba shngain.', 'Poi sha iing suk suk.'],
      voiceExplanation: 'Jied ia ka lynti kaba shngain ban poi suk sha iing.'
    },
    grt: {
      name: 'Nokona Re·angani Rama',
      subtitle: 'Songni bol aro pokkhoriko re·pakani',
      culturalTag: 'Songni Rama',
      instructions: ['Pokkhori aro nokko nibo.', 'Namgipa ramako seokbo.', 'Nokona chel·e sokbo.'],
      voiceExplanation: 'Songni ramako nie an·senge nokona re·angbo.'
    },
    brx: {
      name: 'न’सिम थांनाय लामा',
      subtitle: 'पोख्रि आरो बर बिफांनि सेरजों न’सिम थांनाय',
      culturalTag: 'गामिनि लामा',
      instructions: ['पोख्रि आरो न’खौ नाय।', 'गोजोन लामाखौ बासि।', 'न’सिम मोजाङै सौहै।'],
      voiceExplanation: 'गामिनि पोख्रि आरो बर बिफांनि सेरजों न’सिम थांनाय मोजां लामाखौ सायख’।'
    }
  },

  // 11. Remember The Story
  'remember-the-story': {
    en: {
      name: 'Remember the Story',
      subtitle: 'Read or listen to a folk tale, then answer gentle questions',
      culturalTag: 'Folk Tales & Lore',
      instructions: [
        'Read or listen to the warm folk story.',
        'Remember the animals, places, and heartfelt moments.',
        'Answer simple, gentle questions about the story.'
      ],
      voiceExplanation: 'In Remember the Story, listen to a heartwarming folk story and answer a few gentle questions about what happened.'
    },
    as: {
      name: 'সাধুকথা সোঁৱৰণী',
      subtitle: 'লোকগাথা পঢ়ক বা শুনক, তাৰ পিছত সহজ প্ৰশ্নৰ উত্তৰ দিয়ক',
      culturalTag: 'আইতাৰ সাধুকথা',
      instructions: [
        'সুন্দৰ সাধুকথাটো মন দি পঢ়ক বা শুনক।',
        'সাধুটোৰ চৰিত্ৰ, স্থান আৰু ঘটনা মনত ৰাখক।',
        'সাধুটোৰ ওপৰত থকা সহজ প্ৰশ্নবোৰৰ উত্তৰ দিয়ক।'
      ],
      voiceExplanation: 'সাধুকথা সোঁৱৰণী খেলত এটি মৰমলগা সাধু শুনক বা পঢ়ক আৰু সাধুটোৰ ওপৰত সোধা সহজ প্ৰশ্নসমূহৰ উত্তৰ বাচি লওক।'
    },
    bn: {
      name: 'গল্প মনে রাখা খেলা',
      subtitle: 'লোককাহিনী শুনুন এবং সহজ প্রশ্নের উত্তর দিন',
      culturalTag: 'দাদি-নানির গল্প',
      instructions: [
        'সুন্দর রূপকথা বা লোকগল্পটি মনোযোগ দিয়ে শুনুন।',
        'গল্পের চরিত্র ও ঘটনাগুলো মনে রাখুন।',
        'সহজ প্রশ্নগুলোর উত্তর বেছে নিন।'
      ],
      voiceExplanation: 'একটি সুন্দর গ্রামীণ গল্প শুনুন এবং গল্পটি থেকে সহজ কয়েকটি প্রশ্নের উত্তর দিন।'
    },
    hi: {
      name: 'कहानी की याददाश्त',
      subtitle: 'लोक कथा सुनें और सरल प्रश्नों के उत्तर दें',
      culturalTag: 'दादी की लोककथाएं',
      instructions: [
        'सुंदर लोक कथा को ध्यान से पढ़ें या सुनें।',
        'पात्रों और स्थानों को याद रखें।',
        'कहानी से जुड़े सरल प्रश्नों के उत्तर दें।'
      ],
      voiceExplanation: 'कहानी की याददाश्त में एक मनमोहक लोक कथा सुनें और उसके आधार पर पूछे गए सरल प्रश्नों के उत्तर दें।'
    },
    mni: {
      name: 'Wari Ningshingba',
      subtitle: 'Aribee wari taraga paokhum piba',
      culturalTag: 'Khunagi Wari',
      instructions: ['Wari taru.', 'Wari ningshingu.', 'Wahanggi paokhum pibiyu.'],
      voiceExplanation: 'Khunagi fajaraba wari taraga wahang masingda paokhum pibiyu.'
    },
    lus: {
      name: 'Thawnthu Hriatrengna',
      subtitle: 'Thawnthu ngaihthlak hnuah zawhna chhan',
      culturalTag: 'Hmanlai Thawnthu',
      instructions: ['Thawnthu ngun takin ngaithla rawh.', 'Thil thleng te kha hre reng la.', 'Zawhna te chhang rawh.'],
      voiceExplanation: 'Hmanlai thawnthu ngaihnawm tak ngaithla la, a hnua zawhna te chhang rawh le.'
    },
    kha: {
      name: 'Ka Jingkynmaw Jingiathuhkhana',
      subtitle: 'Sngap ia ka puriskam bad jubab ia ki jingkylli',
      culturalTag: 'Ki Puriskam Shnong',
      instructions: ['Sngap bha ia ka jingiathuhkhana.', 'Kynmaw ia ki briew bad ki jaka.', 'Jubab ia ki jingkylli.'],
      voiceExplanation: 'Sngap ia ka jingiathuhkhana kaba sngewtynnad bad jubab ia ki jingkylli.'
    },
    grt: {
      name: 'Golpoko Gisik Ra·ani',
      subtitle: 'Songni golpoko knae sing·anirangko aganchakani',
      culturalTag: 'A·chik Katta Golpo',
      instructions: ['Golpoko knatimbo.', 'Golponi bidingko gisik ra·bo.', 'Sing·anirangko aganchakbo.'],
      voiceExplanation: 'Songni namgipa golpoko knatimbo aro uani gimin aganchakbo.'
    },
    brx: {
      name: 'खौरां-सोलों गोसोखांनाय',
      subtitle: 'हारिमुनि सल’ खोनासं आरो सोंथिनि फिननाय हो',
      culturalTag: 'आबौनि सल’',
      instructions: ['सल’खौ मोजाङै खोनासं।', 'जाथाइफोरखौ गोसोआव लाखि।', 'सोंथिनि फिननायखौ सायख’।'],
      voiceExplanation: 'हारिमुनि मोजां सल’ खोनासं आरो सोंनाय सोंथिफोरनि गोरलैयै फिननाय हो।'
    }
  },

  // 12. Day In My Village
  'day-in-my-village': {
    en: {
      name: 'A Day in My Village',
      subtitle: 'Experience seasons, morning markets, and evening river breeze',
      culturalTag: 'Village Heritage Life',
      instructions: [
        'Explore village moments across dawn, noon, and twilight.',
        'Match community tasks with the right time of day.',
        'Enjoy peaceful village nostalgia.'
      ],
      voiceExplanation: 'In A Day in My Village, reflect on traditional village moments throughout the day, connecting dawn tea, midday weaving, and twilight gatherings.'
    },
    as: {
      name: 'মোৰ গাঁৱৰ এটি দিন',
      subtitle: 'পুৱাৰ বতাহ, দুপৰীয়াৰ তাঁত আৰু সন্ধিয়াৰ নৈৰ পাৰ',
      culturalTag: 'গাঁও আৰু ঐতিহ্য',
      instructions: [
        'ৰাতিপুৱা, দুপৰীয়া আৰু গধূলিৰ গাঁৱৰ জীৱন উপভোগ কৰক।',
        'সময় অনুসৰি সঠিক গাঁৱৰ কাম বাছক।',
        'চিনাকি স্মৃতিৰ আনন্দ লওক।'
      ],
      voiceExplanation: 'মোৰ গাঁৱৰ এটি দিন খেলত ৰাতিপুৱাৰ বতাহ, দুপৰীয়াৰ তাঁতশাল আৰু সন্ধিয়াৰ নৈৰ পাৰৰ চিনাকি পৰিৱেশৰ স্মৃতি সজীৱ কৰি তোলক।'
    },
    bn: {
      name: 'আমার গ্রামের একটি দিন',
      subtitle: 'সকালের রোদ, দুপুরের কাজ ও সন্ধ্যার নদী পাড়ের স্মৃতি',
      culturalTag: 'পল্লী জীবন ও ঐতিহ্য',
      instructions: [
        'সকাল, দুপুর ও সন্ধ্যার গ্রামীণ মুহূর্তগুলো দেখুন।',
        'সময়ের সাথে মিলিয়ে সঠিক কাজটি বেছে নিন।',
        'শান্ত স্মৃতি রোমন্থন করুন।'
      ],
      voiceExplanation: 'গ্রামের সুন্দর সকাল, দুপুরের কাজ ও সন্ধ্যার শান্ত পরিবেশের স্মৃতি নিয়ে খেলুন।'
    },
    hi: {
      name: 'मेरे गाँव का एक दिन',
      subtitle: 'सुबह की धूप, दोपहर का काम और शाम की नदी किनारे की शांति',
      culturalTag: 'गाँव का सहज जीवन',
      instructions: [
        'सुबह, दोपहर और शाम के गाँव के पलों को महसूस करें।',
        'समय के अनुसार गाँव के सही काम को चुनें।',
        'गाँव की सुखद यादों का आनंद लें।'
      ],
      voiceExplanation: 'मेरे गाँव का एक दिन खेल में सुबह से शाम तक गाँव के शांत वातावरण और कार्यों का मिलान करें।'
    },
    mni: {
      name: 'Eigi Khunagi Numit Ama',
      subtitle: 'Ayukki nungshit, nungthilgi thabak amashung numidang',
      culturalTag: 'Khunagi Punsigi Matam',
      instructions: ['Khunagi matam khallu.', 'Ayuk numidanggi thabak manou.', 'Fajana shannabiyu.'],
      voiceExplanation: 'Khunagi ayuk, nungthil amashung numidanggi fajaraba thabaksing khallaga shannabiyu.'
    },
    lus: {
      name: 'Ka Khua a Ni Khat',
      subtitle: 'Zing boruak, chhun hna leh tlai tlaithla thil',
      culturalTag: 'Khaw Nunphung',
      instructions: ['Khaw chhung thil thleng te en la.', 'Hun bi nena inmil ber thlang rawh.', 'Hlim takin khel rawh.'],
      voiceExplanation: 'Khaw chhung zing atanga tlai thlenga nunphung zalen leh nuam tak kha ngaihtuah let rawh le.'
    },
    kha: {
      name: 'Shisngi Ha Ka Shnong Jong Nga',
      subtitle: 'Ka step, ka sngi bad ka janmiet ha shnong',
      culturalTag: 'Ka Jingim Shnong',
      instructions: ['Peit ia ki por ha shnong.', 'Pyniahap ia ki kam bad ka por.', 'Kmen ha ki jingkynmaw.'],
      voiceExplanation: 'Pyniahap ia ki kam kiba jia ha shnong naduh step haduh janmiet.'
    },
    grt: {
      name: 'Ang·ni Songni Sal Sa',
      subtitle: 'Pringoni attamona songni janggi tangani',
      culturalTag: 'Songni Katta',
      instructions: ['Songni salrangko nibo.', 'Somoina krae kamrangko seokbo.', 'Kusionge kal·bo.'],
      voiceExplanation: 'Songni pring, saljatchi aro attamni salrangko gisik ra·e seokbo.'
    },
    brx: {
      name: 'आंनि गामिनि मोनसे सान',
      subtitle: 'फुंनि बार, बेलासिनि दैसा सेर आरो गामिनि जिउ',
      culturalTag: 'गामिनि हारिमु',
      instructions: ['फुं, सानजौफु आरो बेलासिनि जाथाइ नाय।', 'समजों समान जानाय खामानि सायख’।', 'गोसोखांनायजों गेले।'],
      voiceExplanation: 'गामिनि फुंनिफ्राय बेलासिसिम जानाय जाथाइफोरखौ फारिफाय सायख’नानै गेले।'
    }
  },

  // 14. Finish Grandma's Weave
  'finish-grandmas-weave': {
    en: {
      name: "Finish Grandma's Weave",
      subtitle: 'Complete the missing geometric border pattern on the loom',
      culturalTag: 'Traditional Handloom Weaves',
      instructions: [
        'Look at the repeating pattern sequence on Grandma’s handloom.',
        'Identify the missing diamond, floral, or stripe symbol.',
        'Tap the matching yarn tile to complete the traditional weave!'
      ],
      voiceExplanation: "In Finish Grandma's Weave, observe the traditional handloom motif on the loom and choose the matching design tile to complete Grandma's shawl."
    },
    as: {
      name: 'আইতাৰ তাঁতশালৰ চানেকি',
      subtitle: 'তাঁতশালত আধৰুৱা হৈ থকা কাপোৰৰ চানেকি সম্পূৰ্ণ কৰক',
      culturalTag: 'অসমৰ হস্ততাঁত শিল্প',
      instructions: [
        'আইতাৰ তাঁতশালৰ কাপোৰৰ চানেকিটো মন দি চাওক।',
        'খালি ঠাইত কি ফুল বা জ্যামিতিক চানেকি বহিব বাছক।',
        'সঠিক টাইলটোত স্পৰ্শ কৰি চানেকি সম্পূৰ্ণ কৰক!'
      ],
      voiceExplanation: 'আইতাৰ তাঁতশালৰ চানেকি খেলত কাপোৰৰ ফুল বা চানেকিৰ ক্ৰমটো মন দি চাই খালি ঠাইত বহিবলগীয়া সঠিক ফুলৰ টাইলটো বাচি লওক।'
    },
    bn: {
      name: 'ঠাকুরমার তাঁতের নকশা',
      subtitle: 'তাঁতের কাপড়ের অসমাপ্ত নকশাটি সম্পূর্ণ করুন',
      culturalTag: 'হস্তশিল্প ও তাঁত নকশা',
      instructions: [
        'ঠাকুরমার তাঁতের কাপড়ের নকশাটি দেখুন।',
        'খালি জায়গায় কোন ফুল বা জ্যামিতিক নকশা বসবে তা খুঁজুন।',
        'সঠিক টাইলটি নির্বাচন করে নকশাটি সম্পূর্ণ করুন।'
      ],
      voiceExplanation: 'তাঁতের কাপড়ে যে নকশাটি বাদ পড়েছে, ক্রমানুসারে দেখে সেটি বসিয়ে নকশাটি সম্পূর্ণ করুন।'
    },
    hi: {
      name: 'दादी की बुनाई पूरी करें',
      subtitle: 'करघे पर पारंपरिक शॉल का छूटा हुआ पैटर्न पूरा करें',
      culturalTag: 'पारंपरिक हथकरघा',
      instructions: [
        'दादी के करघे पर बने पैटर्न के क्रम को देखें।',
        'खाली स्थान में आने वाले सही डिज़ाइन को पहचानें।',
        'सही टाइल पर टैप करके बुनाई को पूरा करें!'
      ],
      voiceExplanation: 'दादी की बुनाई पूरी करें में करघे पर छूटे हुए डिज़ाइन को पहचानकर सही पैटर्न चुनकर शॉल पूरी करें।'
    },
    mni: {
      name: 'Ibellogi Yongkham Machat',
      subtitle: 'Yongkhamda shaba firi machat loisinba',
      culturalTag: 'Yongkham Khutsa Heiba',
      instructions: ['Yongkham machat yengbiyu.', 'Watliba leirang khallu.', 'Fajana shannabiyu.'],
      voiceExplanation: 'Ibellogi yongkhamda watliba leirang machat khallaga firi sembiyu.'
    },
    lus: {
      name: 'Pi Puan Tah Ze Zawh',
      subtitle: 'Puan tah lai a ze kim lo zawh felna',
      culturalTag: 'Puan Tah Ze',
      instructions: ['Puan tah ze inrem dan en la.', 'A ze kim lo kha zawng chhuak rawh.', 'A inmil ber thlang rawh.'],
      voiceExplanation: 'Pi puan tah lai a ze kim lo kha hriain a inmil ber thlang rawh le.'
    },
    kha: {
      name: 'Pynkut Ia Ka Dur Jain I Mei-ieit',
      subtitle: 'Pyndep ia ka dur jain kaba sah ha ka tha jain',
      culturalTag: 'Ka Dur Tha Jain',
      instructions: ['Peit ia ka dur jain i mei-ieit.', 'Wad ia ka dur kaba duna.', 'Pynbiang ia ka.'],
      voiceExplanation: 'Pyndep ia ka dur jain i mei-ieit da kaba jied ia ka dur kaba biang.'
    },
    grt: {
      name: 'Ambini Bara Doko Matchotani',
      subtitle: 'Bara dakanio gimaanggipa ritingko matchotani',
      culturalTag: 'Bara Dokani',
      instructions: ['Bara dakaniko nibo.', 'Gimaanggipa ritingko am·bo.', 'Uano jotbo.'],
      voiceExplanation: 'Ambini bara dakanio gimaanggipa ritingko seoke matchotbo.'
    },
    brx: {
      name: 'आबौनि सि दामनाय जोबनाय',
      subtitle: 'दामनाय सियाव आंखाल थानाय महरखौ फुं खालामनाय',
      culturalTag: 'दामनाय-बांनाय',
      instructions: ['दामनाय सिनि महरखौ नाय।', 'आंखाल थानाय बिबारखौ सायख’।', 'महरखौ आबुं खालाम।'],
      voiceExplanation: 'आबौनि दामनाय सिनि गेजेराव आंखाल जानाय बिबारखौ सायख’नानै फुं खालाम।'
    }
  },

  // 15. Whose Morning Is It?
  'whose-morning-is-it': {
    en: {
      name: "Whose Morning Is It?",
      subtitle: 'Match morning activities to the farmer, weaver, teacher, or child',
      culturalTag: 'Village Vocations & Roles',
      instructions: [
        'Look at the morning item or task shown (plough, slate, shuttle, school bag).',
        'Decide who in the village starts their morning with this item.',
        'Tap the matching village personality!'
      ],
      voiceExplanation: 'In Whose Morning Is It, match village morning items like a school bag, handloom shuttle, or plough with the child, weaver, or farmer who uses it.'
    },
    as: {
      name: 'কাৰ পুৱা কেনেকুৱা?',
      subtitle: 'খেতিয়ক, শিপিনী, শিক্ষক আৰু ছাত্ৰ-ছাত্ৰীৰ পুৱাৰ কাম মিলাওক',
      culturalTag: 'গাঁৱৰ জীৱিকা আৰু চৰিত্ৰ',
      instructions: [
        'পুৱাৰ সঁজুলিটো মন দি চাওক (নাঙল, মাকো, স্লেট, স্কুল বেগ)।',
        'গাঁৱৰ কোনে এই সঁজুলিৰে দিনটো আৰম্ভ কৰে বাছক।',
        'সঠিক ব্যক্তিজনৰ ওপৰত স্পৰ্শ কৰক!'
      ],
      voiceExplanation: 'কাৰ পুৱা কেনেকুৱা খেলত নাঙল, মাকো বা স্কুল বেগৰ দৰে সঁজুলিবোৰ গাঁৱৰ খেতিয়ক, শিপিনী বা ছাত্ৰ-ছাত্ৰীৰ সৈতে সঠিকভাৱে মিলাওক।'
    },
    bn: {
      name: 'কার সকাল কেমন?',
      subtitle: 'কৃষক, তাঁতি, শিক্ষক ও শিক্ষার্থীর সকালের কাজ মেলান',
      culturalTag: 'গ্রামীণ পেশা ও জীবনধারা',
      instructions: [
        'সকালের প্রয়োজনীয় জিনিসটি দেখুন (লাঙল, মাকু, শ্লেট, স্কুল ব্যাগ)।',
        'গ্রামের কে এই জিনিস দিয়ে দিন শুরু করেন তা ভাবুন।',
        'সঠিক ব্যক্তির ছবিতে স্পর্শ করুন।'
      ],
      voiceExplanation: 'লাঙল, বই বা তাঁতের মাকুর মতো জিনিসগুলো কৃষক, তাঁতি বা শিক্ষার্থীর সাথে মিলিয়ে নিন।'
    },
    hi: {
      name: 'किसकी सुबह कैसी?',
      subtitle: 'किसान, बुनकर, शिक्षक और बच्चे के सुबह के कामों का मिलान करें',
      culturalTag: 'गाँव के कार्य व व्यवसाय',
      instructions: [
        'सुबह की वस्तु या उपकरण को देखें (हल, करघा, बस्ता, किताबें)।',
        'सोचें कि गाँव में कौन इस वस्तु के साथ अपनी सुबह शुरू करता है।',
        'सही व्यक्ति के चित्र पर टैप करें!'
      ],
      voiceExplanation: 'किसकी सुबह कैसी में हल, स्कूल बैग या करघे जैसे सामान को किसान, बुनकर या स्कूली बच्चे से सही तरह जोड़ें।'
    },
    mni: {
      name: 'Kanagino Ayuk?',
      subtitle: 'Lousinba, firi shaba, oja amashung anganggi ayuk',
      culturalTag: 'Khunagi Thabak Toubasing',
      instructions: ['Ayukki potlam yengbiyu.', 'Kanana sijinaribano khallu.', 'Fajana shannabiyu.'],
      voiceExplanation: 'School bag, yongkham potlamsing kanana sijinaribano khallaga thubiyu.'
    },
    lus: {
      name: 'Tu Zing Nge A Nih?',
      subtitle: 'Loleh mi, puan tah mi, zirtirtu leh zirlai zing hna',
      culturalTag: 'Khaw Chhung Hna Thawk Te',
      instructions: ['Zing thil hmanrua en la.', 'Tu hman tur nge tih ngaihtuah rawh.', 'A dik ber kawk rawh.'],
      voiceExplanation: 'School bag, puan tah hmanrua leh thil dangte hi a hmangtu tur dik tak zawn rawh le.'
    },
    kha: {
      name: 'Ka Step Jongno?',
      subtitle: 'U nongrep, nongtha jain, nonghikai bad ki khynnah skul',
      culturalTag: 'Ki Kam ha Shnong',
      instructions: ['Peit ia ka tiar step.', 'Kynmaw mano ba pyndonkam.', 'Jied ia u briew uba dei.'],
      voiceExplanation: 'Jied ia u briew uba pyndonkam ia ki tiar kum ka kot skul, ka mohkhiew ne ka tiar tha jain.'
    },
    grt: {
      name: 'Sanina Pring?',
      subtitle: 'Game-cha·gipa, bara dokgipa aro skul chatroni pring',
      culturalTag: 'Songni Kamrang',
      instructions: ['Pringni bostuko nibo.', 'Sawa uako jakkala chanchibo.', 'Uano jotbo.'],
      voiceExplanation: 'Skul bag, bara dokani bosturangko sawa jakkala u·ie seokbo.'
    },
    brx: {
      name: 'सोरनि फुं?',
      subtitle: 'आबादारि, दामग्रा, फोरोंगिरि आरो फरायसाफोरनि फुंनि खामानि',
      culturalTag: 'गामिनि खामानि',
      instructions: ['फुंनि हाथियारखौ नाय।', 'गामियाव सोर बेखौ बाहायो सान।', 'थार मानसिनाव थु।'],
      voiceExplanation: 'स्कुलनि बेग, हाल एबा दामग्रा हाथियारखौ सोर बाहायो सायख’नानै ला।'
    }
  },

  // Legacy Quick Play Game 1: Cultural Memory Recall
  'memory-recall-game': {
    en: {
      name: 'Cultural Memory Recall',
      subtitle: 'Personalized instruments & autobiographical memory cues',
      culturalTag: 'Cultural Instruments',
      instructions: [
        'Look at the instrument or cultural memory question.',
        'Tap the choice that matches the prompt.',
        'Listen to the audio hint if you need a gentle reminder.'
      ],
      voiceExplanation: 'In Cultural Memory Recall, answer questions about traditional instruments and personal memories from your home region.'
    },
    as: {
      name: 'বিহু স্মৃতি খেল',
      subtitle: 'অসমৰ বাদ্যযন্ত্ৰ আৰু চিনাকি স্মৃতিকথা',
      culturalTag: 'সাংস্কৃতিক বাদ্যযন্ত্ৰ',
      instructions: [
        'বাদ্যযন্ত্ৰ বা স্মৃতিৰ প্ৰশ্নটো মন দি চাওক।',
        'সঠিক উত্তৰত আঙুলিৰে স্পৰ্শ কৰক।',
        'প্ৰয়োজন হ’লে সহায়ৰ বাবে শব্দ শুনক।'
      ],
      voiceExplanation: 'বিহু স্মৃতি খেলত ঢোল, পেঁপা নাইবা গগনাৰ দৰে চিনাকি বাদ্যযন্ত্ৰৰ প্ৰশ্নৰ উত্তৰ স্পৰ্শ কৰি বা মাত মাতি দিয়ক।'
    },
    bn: {
      name: 'সাংস্কৃতিক স্মৃতি খেলা',
      subtitle: 'লোক বাদ্যযন্ত্র ও ব্যক্তিগত স্মৃতিচিহ্ন স্মরণ',
      culturalTag: 'লোক বাদ্যযন্ত্র',
      instructions: [
        'বাদ্যযন্ত্র বা স্মৃতির প্রশ্নটি দেখুন।',
        'সঠিক উত্তরের বোতাম স্পর্শ করুন।',
        'প্রয়োজনে শব্দের সাহায্য শুনুন।'
      ],
      voiceExplanation: 'সাংস্কৃতিক স্মৃতি খেলায় ঐতিহ্যবাহী বাদ্যযন্ত্র ও স্মৃতির প্রশ্নের সঠিক উত্তর দিন।'
    },
    hi: {
      name: 'सांस्कृतिक स्मृति खेल',
      subtitle: 'पारंपरिक वाद्ययंत्र और व्यक्तिगत याददाश्त',
      culturalTag: 'पारंपरिक वाद्य',
      instructions: [
        'वाद्ययंत्र या स्मृति के प्रश्न को ध्यान से देखें।',
        'सही विकल्प पर टैप करें।',
        'ज़रूरत पड़ने पर ऑडियो संकेत सुनें।'
      ],
      voiceExplanation: 'सांस्कृतिक स्मृति खेल में ढोल, पेपा या पारंपरिक वाद्ययंत्रों से जुड़े प्रश्नों के उत्तर दें।'
    },
    mni: {
      name: 'Pung-Pepa Ningshing Khel',
      subtitle: 'Khunagi echel amashung ningshing potlam',
      culturalTag: 'Aribee Khutsa',
      instructions: ['Wahang yengbiyu.', 'Achumba khallu.', 'Fajana shannabiyu.'],
      voiceExplanation: 'Khunagi pung amashung aribee potlamsinggi wahangda paokhum pibiyu.'
    },
    lus: {
      name: 'Hnam Hriatrengna Khel',
      subtitle: 'Hnam rimawi hmanrua leh hriatrengna',
      culturalTag: 'Hnam Rimawi',
      instructions: ['Zawhna en rawh.', 'A dik thlang rawh.', 'Hlim takin khel rawh.'],
      voiceExplanation: 'Hnam rimawi hmanrua leh hriat rengna chungchang zawhna te chhang rawh le.'
    },
    kha: {
      name: 'Ka Jingkynmaw Tiar Jingrwai',
      subtitle: 'Ki tiar tem tynrai bad jingkynmaw',
      culturalTag: 'Ki Tiar Tem Tynrai',
      instructions: ['Peit ia ka jingkylli.', 'Jied ia kaba biang.', 'Sngap ia ka jingiarap.'],
      voiceExplanation: 'Jubab ia ki jingkylli shaphang ki tiar tem tynrai.'
    },
    grt: {
      name: 'Dama Gisik Ra·ani',
      subtitle: 'A·chik dama aro gipin knaanirang',
      culturalTag: 'Songni Dama',
      instructions: ['Sing·aniko nibo.', 'Gisik ra·e aganchakbo.', 'Dakchakani knatimbo.'],
      voiceExplanation: 'Songni dama aro knaanirangni gimin aganchakbo.'
    },
    brx: {
      name: 'खाम-सिफुं गोसोखांनाय',
      subtitle: 'हारिमुनि दामग्रा बेसाद आरो गोसोखांथि',
      culturalTag: 'दामग्रा बेसाद',
      instructions: ['सोंथिखौ नाय।', 'थार फिननायखौ थु।', 'मोजाङै खोनासं।'],
      voiceExplanation: 'खाम आरो सिफुंनि सोंथिफोरखौ मोजाङै गोसोआव लाखिनानै फिननाय हो।'
    }
  },

  // Legacy Quick Play Game 2: Traditional Patterns
  'pattern-matching-game': {
    en: {
      name: 'Traditional Patterns',
      subtitle: 'Traditional handloom patterns & NER weaves',
      culturalTag: 'Handloom Motifs',
      instructions: [
        'Look at the highlighted traditional pattern.',
        'Find the matching textile swatch from the choices below.',
        'Tap the correct swatch to score points.'
      ],
      voiceExplanation: 'In Traditional Patterns, look at the traditional handloom motif like Muga Silk or Eri Chador, and tap the matching swatch.'
    },
    as: {
      name: 'বস্ত্ৰ চানেকি খেল',
      subtitle: 'মুগা, এৰী আৰু পাটৰ ঐতিহ্যমণ্ডিত বস্ত্ৰ চানেকি',
      culturalTag: 'হস্ততাঁত বস্ত্ৰ',
      instructions: [
        'ওপৰৰ বস্ত্ৰ চানেকিটো মন দি পৰীক্ষা কৰক।',
        'তলৰ বিকল্পসমূহৰ পৰা একে চানেকি বিচাৰি উলিয়াক।',
        'সঠিক চানেকিটোত স্পৰ্শ কৰক।'
      ],
      voiceExplanation: 'বস্ত্ৰ চানেকি খেলত মুগা, এৰী বা পাট কাপোৰৰ চানেকি চাই একে ধৰণৰ চানেকিটো বাচি লওক।'
    },
    bn: {
      name: 'ঐতিহ্যবাহী বস্ত্র নকশা',
      subtitle: 'মুগা, এরী ও সিল্কের ট্র্যাডিশনাল নকশা মেলানো',
      culturalTag: 'ঐতিহ্যবাহী নকশা',
      instructions: [
        'উপরে দেখানো কাপড়ের নকশাটি দেখুন।',
        'নিচের বিকল্পগুলো থেকে একই রকম নকশা বেছে নিন।',
        'সঠিক নকশায় স্পর্শ করুন।'
      ],
      voiceExplanation: 'ঐতিহ্যবাহী বস্ত্র নকশা খেলায় কাপড়ের নকশার সাথে মিল রেখে সঠিক বিকল্পটি নির্বাচন করুন।'
    },
    hi: {
      name: 'पारंपरिक वस्त्र पैटर्न',
      subtitle: 'मुगा सिल्क, एरी चादर और हथकरघा पैटर्न पहचान',
      culturalTag: 'पारंपरिक बुनाई',
      instructions: [
        'ऊपर दिखाए गए वस्त्र के पैटर्न को देखें।',
        'नीचे दिए गए विकल्पों में से उसी पैटर्न को चुनें।',
        'सही पैटर्न पर टैप करें।'
      ],
      voiceExplanation: 'पारंपरिक वस्त्र पैटर्न में मुगा सिल्क या एरी चादर के नमूनों को देखकर सही मिलान चुनें।'
    },
    mni: {
      name: 'Innaphi Machat Khel',
      subtitle: 'Muga amashung Innaphi machat khallu',
      culturalTag: 'Khutsa Machat',
      instructions: ['Innaphi machat yengbiyu.', 'Manaba khallu.', 'Fajana shannabiyu.'],
      voiceExplanation: 'Innaphi machat nambate yengbiyu amashung manaba khallu.'
    },
    lus: {
      name: 'Puan Tah Ze Khel',
      subtitle: 'Puanchei leh puan tah ze hriat zawnna',
      culturalTag: 'Puan Ze',
      instructions: ['Puan tah ze en rawh.', 'A inmil thlang rawh.', 'Khel nuam le.'],
      voiceExplanation: 'Puan tah ze dik tak kha thlang rawh le.'
    },
    kha: {
      name: 'Ka Dur Jain Tynrai',
      subtitle: 'Ki dur jain Ryndia bad Jainsem',
      culturalTag: 'Ki Dur Jain',
      instructions: ['Peit ia ka dur jain.', 'Jied ia kaba iasyriem.', 'Kmen ha ka jingialehkai.'],
      voiceExplanation: 'Jied ia ka dur jain kaba iasyriem bad kaba don halor.'
    },
    grt: {
      name: 'Bara Dokani Riting',
      subtitle: 'Dakmanda aro gipin barani riting',
      culturalTag: 'A·chik Bara',
      instructions: ['Barani ritingko nibo.', 'Apsan ong·gipako seokbo.', 'Kusionge kal·bo.'],
      voiceExplanation: 'Dakmanda barani ritingko nie apsan ong·gipako seokbo.'
    },
    brx: {
      name: 'दामनाय महर गेलेनाय',
      subtitle: 'दखना आरो आर’नाइनि महर नागिरनाय',
      culturalTag: 'बर’नि सि',
      instructions: ['दामनाय महरखौ नाय।', 'समान महरखौ सायख’।', 'मोजाङै गेले।'],
      voiceExplanation: 'दखना आरो आर’नाइनि महरखौ मोजाङै गोसोआव लाखिनानै समान महर सायख’।'
    }
  },

  // Legacy Quick Play Game 3: Daily Routine Sequencing
  'sequencing-game': {
    en: {
      name: 'Daily Routine Sequencing',
      subtitle: 'Step-by-step village tea preparation and routine',
      culturalTag: 'Village Tea Craft',
      instructions: [
        'Look at the steps to prepare tea or accomplish a task.',
        'Choose the next correct chronological action.',
        'Complete all sequence steps successfully.'
      ],
      voiceExplanation: 'In Daily Routine Sequencing, arrange the steps of preparing Assam tea or completing daily tasks into the correct order.'
    },
    as: {
      name: 'দৈনন্দিন কৰ্ম ক্ৰম খেল',
      subtitle: 'অসমীয়া চাহ বনোৱা আৰু দৈনিক ৰীতিৰ সঠিক ক্ৰম',
      culturalTag: 'চাহ প্ৰস্তুতকৰণ',
      instructions: [
        'চাহ বনোৱা বা দৈনন্দিন কামৰ পদক্ষেপবোৰ চাওক।',
        'পৰৱৰ্তী সঠিক পদক্ষেপটো বাচি লওক।',
        'সকলোবোৰ ক্ৰমানুসৰি সম্পূৰ্ণ কৰক।'
      ],
      voiceExplanation: 'দৈনন্দিন কৰ্ম ক্ৰম খেলত সুস্বাদু লাল চাহ বনোৱা বা দিনটোৰ কামবোৰ সঠিক ক্ৰমত এক, দুই, তিনি হিচাপে বাচি লওক।'
    },
    bn: {
      name: 'দৈনন্দিন কাজের ক্রম সাজানো',
      subtitle: 'চা তৈরি ও দৈনন্দিন কাজের সঠিক ধাপ নির্ধারণ',
      culturalTag: 'চা তৈরির ধাপ',
      instructions: [
        'চা তৈরি বা কাজের ধাপগুলো লক্ষ্য করুন।',
        'পরবর্তী সঠিক ধাপটি বেছে নিন।',
        'সঠিক ক্রমানুসারে সম্পূর্ণ করুন।'
      ],
      voiceExplanation: 'চা তৈরি ও কাজের ধাপগুলো ক্রমানুসারে সাজিয়ে সঠিক উত্তর দিন।'
    },
    hi: {
      name: 'दैनिक क्रम खेल',
      subtitle: 'पारंपरिक चाय बनाने और दैनिक कार्यों के सही चरण',
      culturalTag: 'चाय बनाने का क्रम',
      instructions: [
        'चाय बनाने या दैनिक कार्य के चरणों को देखें।',
        'अगला सही चरण चुनें।',
        'सभी चरणों को सही क्रम में पूरा करें।'
      ],
      voiceExplanation: 'दैनिक क्रम खेल में चाय बनाने या दिनचर्या के चरणों को एक के बाद एक सही क्रम में लगाएं।'
    },
    mni: {
      name: 'Cha Semba Kramba',
      subtitle: 'Cha sembagi machat kramba khallu',
      culturalTag: 'Cha Semba',
      instructions: ['Cha sembagi step yengbiyu.', 'Matungda touranba khallu.', 'Fajana shannabiyu.'],
      voiceExplanation: 'Cha sembada ahanba amasung matung tarakpagi step sing khallu.'
    },
    lus: {
      name: 'Thingpui Siam Dan Indawt',
      subtitle: 'Thingpui siam dan indawt zawnna',
      culturalTag: 'Thingpui Siam',
      instructions: ['Thingpui siam dan en rawh.', 'A dawt leh tur thlang rawh.', 'A indawt in zawh rawh.'],
      voiceExplanation: 'Thingpui siam dan indawt dik tak kha thlang rawh le.'
    },
    kha: {
      name: 'Ka Pynbeit Rynjup Ka Sha',
      subtitle: 'Ka rukom shet sha bad pynbeit',
      culturalTag: 'Ka Shet Sha',
      instructions: ['Peit ia ka rukom shet sha.', 'Jied ia kaba bud.', 'Pyndep ia baroh.'],
      voiceExplanation: 'Pynbeit ia ka rukom shet sha naduh ban pynkhluit um haduh ban dih.'
    },
    grt: {
      name: 'Cha Tariani Riting',
      subtitle: 'Cha tariani sulsul ritingatani',
      culturalTag: 'Cha Tariani',
      instructions: ['Cha tariani ritingko nibo.', 'Ja·mano ong·gipako seokbo.', 'Matchotbo.'],
      voiceExplanation: 'Cha tariani sulsul ritingko nie ja·man ja·man done matchotbo.'
    },
    brx: {
      name: 'चा बानायनाय फारि',
      subtitle: 'चा बानायनायनि फारिफाय हुदा',
      culturalTag: 'चा बानायनाय',
      instructions: ['चा बानायनायनि फारिखौ नाय।', 'उननि थार खामानिखौ सायख’।', 'फारिफाय आबुं खालाम।'],
      voiceExplanation: 'चा बानायनायनि फारिखौ मोजाङै गोसोआव लाखिनानै उननि फारिखौ सायख’नानै ला।'
    }
  }
};

export const UI_LOCALIZATIONS = {
  hubTitle: {
    en: 'NeuroSetu Cognitive Hub',
    as: 'নিওৰোসেতু কগনিটিভ হাব',
    bn: 'নিউরোসেতু কগনিটিভ হাব',
    hi: 'न्यूरोसेतु संज्ञानात्मक हब',
    mni: 'NeuroSetu Pukning Khel Hub',
    lus: 'NeuroSetu Rilru Infiamna Hub',
    kha: 'NeuroSetu Ka Hub Jingialehkai',
    grt: 'NeuroSetu Gisik Kal·ani Hub',
    brx: 'निउर’सेतु गोसो गेलेग्रा थावनि'
  },
  hubSubtitle: {
    en: 'Gentle, elder-friendly mind exercises inspired by Assam tea gardens, Bihu festivals, handloom weaves & village memories.',
    as: 'অসমৰ চাহ বাগিচা, বিহু উৎসৱ, হস্ততাঁত শিল্প আৰু গাঁৱৰ সোঁৱৰণীৰে নিৰ্মিত জ্যেষ্ঠ নাগৰিক-অনুকূল মানসিক অনুশীলন।',
    bn: 'চা বাগান, বিহু উৎসব, তাঁতশিল্প ও গ্রামীণ স্মৃতি বিজড়িত প্রবীণ-বান্ধব মনের আনন্দময় অনুশীলন।',
    hi: 'चाय बागान, लोक उत्सव, हथकरघा बुनाई और गाँव की मधुर यादों से प्रेरित बुजुर्ग-अनुकूल मानसिक अभ्यास।',
    mni: 'Khunagi aribee wari, cha pambi amashung leirang ningshingbada yupharaba thabaksing.',
    lus: 'Hmanlai khaw nunphung leh hriat rengna atanga siam upate tana rilru sawizawina.',
    kha: 'Ki jingialehkai kiba jem bad sngewtynnad kiba pynkynmaw ia ka jingim shnong tynrai.',
    grt: 'Songni cha bagan aro manderangni gimin gisik ra·ani kal·anirang.',
    brx: 'चा बागान, हारिमु आरो गामिनि गोसोखांथिजों बानायनाय गोसोनि गेलेनाय।'
  },
  exercisesDone: {
    en: 'Exercises Done',
    as: 'সম্পূৰ্ণ কৰা খেল',
    bn: 'সম্পন্ন অনুশীলন',
    hi: 'पूरे किए गए अभ्यास',
    mni: 'Loishinkhraba Khel',
    lus: 'Infiamna Zohte',
    kha: 'Ki Jingialehkai Ba La Dep',
    grt: 'Matchotgipa Kal·ani',
    brx: 'जोबनाय गेलेनाय'
  },
  activePlayed: {
    en: 'Active Games Played',
    as: 'অংশগ্ৰহণ কৰা খেলসমূহ',
    bn: 'অংশগ্রহণকৃত খেলা',
    hi: 'खेले गए खेल',
    mni: 'Shannakhraba Khelsing',
    lus: 'Infiamna Khelh Tawhte',
    kha: 'Ki Ba La Leh',
    grt: 'Kal·gimin Kal·anirang',
    brx: 'गेलेखांनाय गेलेनायफोर'
  },
  voiceGuide: {
    en: 'Voice Guide',
    as: 'মাত শুনক (নিয়ম)',
    bn: 'নিয়ম শুনুন',
    hi: 'नियम सुनें (आवाज़)',
    mni: 'Khonjelda Tabiye',
    lus: 'Aw Ngaithla Rawh',
    kha: 'Sngap Ia Ka Ktien',
    grt: 'Ku·rangko Knatimbo',
    brx: 'राव खोनासं'
  },
  howToPlay: {
    en: 'How to Play',
    as: 'খেলৰ নিয়ম',
    bn: 'খেলবেন কীভাবে',
    hi: 'खेलने का तरीका',
    mni: 'Shannabagie Mawong',
    lus: 'Khelh Dan Tur',
    kha: 'Ka Rukom Leh',
    grt: 'Kal·ani Niam',
    brx: 'गेलेनायनि नेम'
  },
  startPlaying: {
    en: 'Start Playing',
    as: 'খেল আৰম্ভ কৰক',
    bn: 'খেলা শুরু করুন',
    hi: 'खेलना शुरू करें',
    mni: 'Shannaba Houro',
    lus: 'Khel Tan Rawh',
    kha: 'Sdang Ban Leh',
    grt: 'Kal·na A·bachengbo',
    brx: 'गेलेनो जागाय'
  },
  tapToPlay: {
    en: 'Tap to play',
    as: 'খেলিবলৈ স্পৰ্শ কৰক',
    bn: 'খেলতে স্পর্শ করুন',
    hi: 'खेलने के लिए छुएं',
    mni: 'Shannaba thubiyu',
    lus: 'Khel turin hmet rawh',
    kha: 'Tuh ban leh',
    grt: 'Kal·na jotbo',
    brx: 'गेलेनो थाखाय थु'
  },
  playAgain: {
    en: 'Play Again',
    as: 'পুনৰ খেলক',
    bn: 'আবার খেলুন',
    hi: 'फिर से खेलें',
    mni: 'Amuk Hanna Shannou',
    lus: 'Khel Nawn Rawh',
    kha: 'Leh Biang',
    grt: 'Pil·te Kal·bo',
    brx: 'आरोबाव गेले'
  },
  gamesHub: {
    en: 'Games Hub',
    as: 'খেলৰ তালিকা',
    bn: 'খেলার তালিকা',
    hi: 'गेम्स हब',
    mni: 'Khel Hub',
    lus: 'Games Hub',
    kha: 'Ka Hub Jingialehkai',
    grt: 'Kal·ani Hub',
    brx: 'गेलेग्रा थावनि'
  },
  wellDone: {
    en: 'Well done!',
    as: 'বৰ ভাল হ’ল!',
    bn: 'খুব ভালো হয়েছে!',
    hi: 'बहुत बढ़िया!',
    mni: 'Yamna Fajei!',
    lus: 'I ti tha lutuk!',
    kha: 'Bha Shisha!',
    grt: 'Nama Ong·aha!',
    brx: 'जोबोर मोजां जादों!'
  },
  score: {
    en: 'Score',
    as: 'পইন্ট / নম্বৰ',
    bn: 'পয়েন্ট / নম্বর',
    hi: 'अंक (Score)',
    mni: 'Point',
    lus: 'Mark',
    kha: 'Ka Marks',
    grt: 'Mark',
    brx: 'नम्बर'
  },
  accuracy: {
    en: 'Accuracy',
    as: 'শুদ্ধতা',
    bn: 'সঠিকতা',
    hi: 'सटीकता',
    mni: 'Chumba',
    lus: 'Dikna',
    kha: 'Ka Jingbiang',
    grt: 'Kakket Ong·ani',
    brx: 'थारथाइ'
  },
  tipRelax: {
    en: 'Take your time — there is no rush!',
    as: 'ধৈৰ্য্যৰে আৰামেৰে খেলক — কোনো খৰখেদা নাই!',
    bn: 'ধৈর্য ধরে খেলুন — কোনো তাড়াহুড়ো নেই!',
    hi: 'आराम से खेलें — कोई जल्दी नहीं है!',
    mni: 'Tanna shannabiyu — kanamasu yangna leite!',
    lus: 'Hmanhmawh suh — i duh tawkin muangchangin ti rawh!',
    kha: 'Shong suk bad leh jem jem — ym don jingkyrkieh!',
    grt: 'Ka·sinen kal·bo — mamung chakatgrikani dongja!',
    brx: 'गोजोनै गेले — जेबो थाब खालामनांगौ गैया!'
  },
  returnHome: {
    en: 'Return to NeuroSetu Portal',
    as: 'মুখ্য পৃষ্ঠালৈ উভতি যাওক',
    bn: 'মূল পৃষ্ঠায় ফিরে যান',
    hi: 'मुख्य पोर्टल पर लौटें',
    mni: 'NeuroSetuda Hallakpa',
    lus: 'Home ah Kir Leh Rawh',
    kha: 'Leit biang sha ka Home',
    grt: 'A·bachengona Re·bapilbo',
    brx: 'गाहाइ बिलाइआव थांफिन'
  },
  patientCareHub: {
    en: 'Patient Care Hub',
    as: 'ৰোগীৰ সেৱা কেন্দ্ৰ',
    bn: 'রোগী সেবা কেন্দ্র',
    hi: 'रोगी सेवा केंद्र',
    mni: 'Patient Care Hub',
    lus: 'Damlo Enkawlna',
    kha: 'Ka Jingsumar Ia Ki Nongpang',
    grt: 'Sagipako Simsakani',
    brx: 'साने जोथोन लानाय'
  },
  ashaDashboard: {
    en: 'ASHA Telemetry Dashboard',
    as: 'আশা / পৰিচর্যাকাৰী ডেচব’ৰ্ড',
    bn: 'আশা / কেয়ারগিভার ড্যাশবোর্ড',
    hi: 'आशा / स्वास्थ्य कार्यकर्ता डैशबोर्ड',
    mni: 'ASHA Dashboard',
    lus: 'ASHA Dashboard',
    kha: 'Ka Dashboard ASHA',
    grt: 'ASHA Dashboard',
    brx: 'आशा देसबर्ड'
  }
};

/**
 * Get localized game config merged with fallback defaults
 */
export function getLocalizedGame(gameConfig, language = 'en') {
  if (!gameConfig) return null;
  const langKey = language || 'en';
  const gameLoc = GAMES_LOCALIZATION[gameConfig.id];

  const loc = gameLoc?.[langKey] || gameLoc?.en || {};
  const enLoc = gameLoc?.en || {};

  return {
    ...gameConfig,
    name: loc.name || enLoc.name || gameConfig.name,
    subtitle: loc.subtitle || enLoc.subtitle || gameConfig.subtitle,
    culturalTag: loc.culturalTag || enLoc.culturalTag || gameConfig.culturalTag,
    instructions: loc.instructions || enLoc.instructions || gameConfig.instructions || [],
    voiceExplanation: loc.voiceExplanation || enLoc.voiceExplanation || `${loc.name || gameConfig.name}. ${Array.isArray(loc.instructions) ? loc.instructions.join('. ') : ''}`
  };
}

/**
 * Get spoken voice guide narration text for a specific game
 */
export function getGameVoiceExplanation(gameId, language = 'en') {
  const langKey = language || 'en';
  const gameLoc = GAMES_LOCALIZATION[gameId];
  if (!gameLoc) return '';
  const loc = gameLoc[langKey] || gameLoc.en;
  return loc?.voiceExplanation || `${loc?.name || ''}. ${loc?.instructions ? loc.instructions.join('. ') : ''}`;
}

/**
 * Get localized category title and description
 */
export function getCategoryLocalized(categoryId, language = 'en') {
  const langKey = language || 'en';
  const cat = CATEGORY_LOCALIZATIONS[categoryId];
  if (!cat) return { title: categoryId, desc: '' };
  return cat[langKey] || cat.en || { title: categoryId, desc: '' };
}

/**
 * Get generic UI localized string
 */
export function getUIString(key, language = 'en') {
  const langKey = language || 'en';
  const entry = UI_LOCALIZATIONS[key];
  if (!entry) return key;
  return entry[langKey] || entry.en || key;
}
