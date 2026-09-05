/**
 * multilingualAudioHelp.js - Authentic Spoken Audio Guidance & Prompts across NER Languages
 * Supported Languages:
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

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English', region: 'Pan-NER / Standard', speechLocale: 'en-IN', icon: '🇬🇧' },
  { code: 'as', label: 'Assamese', nativeName: 'অসমীয়া', region: 'Assam & Brahmaputra Valley', speechLocale: 'as-IN', icon: '🌿' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', region: 'Barak Valley & Tripura', speechLocale: 'bn-IN', icon: '🌸' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', region: 'Arunachal & Regional Standard', speechLocale: 'hi-IN', icon: '🇮🇳' },
  { code: 'mni', label: 'Manipuri', nativeName: 'মৈতৈলোন্ (Meitei)', region: 'Manipur & Imphal Valley', speechLocale: 'hi-IN', icon: '🌺' },
  { code: 'lus', label: 'Mizo', nativeName: 'Mizo ṭawng', region: 'Mizoram & Lushai Hills', speechLocale: 'en-IN', icon: '🌄' },
  { code: 'kha', label: 'Khasi', nativeName: 'Ka Ktien Khasi', region: 'Meghalaya & Khasi Hills', speechLocale: 'en-IN', icon: '🌧️' },
  { code: 'grt', label: 'Garo', nativeName: 'A·chik', region: 'Meghalaya & Garo Hills', speechLocale: 'en-IN', icon: '🥁' },
  { code: 'brx', label: 'Bodo', nativeName: 'बर’ (Boro)', region: 'Bodoland & Western Assam', speechLocale: 'as-IN', icon: '🌾' }
];

export const AUDIO_HELP_SCRIPTS = {
  en: {
    welcome: 'Welcome to NeuroSetu. You are in a safe place. Tap any card below to play memory games, check your daily medicine reminders, or speak with your family. You can also tap the microphone to answer using your voice.',
    games: 'Tap on any of the three game cards to begin. You can answer questions by touching the options or speaking your answer clearly.',
    reminders: 'Here are your daily reminders. You can track your medicines, water intake, daily walk, and doctor appointments. Tap Read All Aloud to hear your schedule.',
    progress: 'This dashboard tracks your memory journey and response latency gently for your health worker and family.',
    sos: 'If you ever need immediate assistance, pressing the SOS button will connect you to the National Elderline 14567 and alert your caregiver.'
  },
  as: {
    welcome: 'নিওৰোসেতুলৈ নমস্কাৰ। আপোনাৰ দিনটো শুভ হওক। খেলিবলৈ যিকোনো এটা কাৰ্ড স্পৰ্শ কৰক, নাইবা ঔষধৰ তালিকা আৰু সোঁৱৰণী চাওক। আপুনি মাইক্ৰ’ফোন টিপি মাত মাতিও উত্তৰ দিব পাৰে।',
    games: 'খেল আৰম্ভ কৰিবলৈ যিকোনো এটা খেল বাচি লওক। আপুনি আঙুলিৰে স্পৰ্শ কৰি বা মাত মাতি উত্তৰ দিব পাৰে।',
    reminders: 'এইয়া আপোনাৰ দৈনিক সোঁৱৰণী। ঔষধ খোৱা, পানী খোৱা আৰু চিকিৎসকৰ সাক্ষাৎ সূচী ইয়াত উপলব্ধ।',
    progress: 'আপোনাৰ স্মৃতি শক্তিৰ উন্নতি আৰু খেলৰ খতিয়ান ইয়াত সংৰক্ষিত হৈ আছে।',
    sos: 'জরুৰীকালীন সহায়ৰ বাবে জ্যেষ্ঠ নাগৰিক হেল্পলাইন ১৪৫৬৭ নম্বৰ আৰু পৰিয়াললৈ যোগাযোগ কৰা হ’ব।'
  },
  bn: {
    welcome: 'নিউরোসেতুতে আপনাকে স্বাগতম। আপনার দিনটি সুন্দর হোক। স্মৃতিশক্তি ও আনন্দের জন্য নিচের কার্ডগুলো স্পর্শ করুন, অথবা ঔষধের তালিকা দেখুন। আপনি মাইকে কথা বলেও উত্তর দিতে পারেন।',
    games: 'খেলতে শুরু করার জন্য যেকোনো একটি খেলা বেছে নিন। আপনি স্ক্রিনে ছুঁয়ে বা মুখে বলে উত্তর দিতে পারেন।',
    reminders: 'এখানে আপনার দৈনন্দিন ঔষধ, জল খাওয়া এবং ডাক্তারের সাথে দেখা করার সময়সূচী রয়েছে।',
    progress: 'আপনার স্বাস্থ্য এবং স্মৃতিশক্তির অগ্রগতির খতিয়ান এখানে সুরক্ষিত রয়েছে।',
    sos: 'জরুরী সহায়তার জন্য ১৪৫৬৭ এল্ডারলাইনে এবং আপনার পরিবারের কাছে বার্তা পাঠানো হবে।'
  },
  hi: {
    welcome: 'न्यूरोसेतु में आपका स्वागत है। आपका दिन शुभ हो। अपनी याददाश्त और खेल के लिए नीचे दिए गए कार्ड को छुएं या दवाई की याददाश्त देखें। आप माइक दबाकर बोलकर भी जवाब दे सकते हैं।',
    games: 'खेलने के लिए किसी भी कार्ड को चुनें। आप स्क्रीन छूकर या बोलकर उत्तर दे सकते हैं।',
    reminders: 'यह आपकी दवाइयों, पानी पीने और डॉक्टर की जांच की दैनिक सूची है।',
    progress: 'आपकी याददाश्त और खेल की प्रगति यहां सुरक्षित है।',
    sos: 'आपातकालीन सहायता के लिए वरिष्ठ नागरिक हेल्पलाइन 14567 और आपके परिवार से संपर्क होगा।'
  },
  mni: {
    welcome: 'NeuroSetu da taranan okchari. Nahanbagee thabak, ningshing nupal amasung leirang pumnamak asomda leijei. Microphonda ngangbadagi paokhum pijaba yai.',
    games: 'Sannaba hounaba card amada thubiyu. Fajatana paokhum piba yai.',
    reminders: 'Ahing-nungthilgi hidak-langthak amasung eshing thakpagi ningshingba asomda leijei.',
    progress: 'Punsigee ningshing thabaksing asomda mayek shengna thamjei.',
    sos: 'Akanba matamda mateng panaba helpline 14567 da pao pijagani.'
  },
  lus: {
    welcome: 'NeuroSetu ah kan lo lawm a che. I hriselna leh hriat rengna atana infiamna leh damdawi hriattirna en turin card hi hmet rawh. Aw hmangin i chhang thei bawk e.',
    games: 'Infiam tan turin a hnuai ami hi thlang rawh. Tawngka in emaw khawih in emaw i chhang thei ang.',
    reminders: 'Hei hi i nitin damdawi ei hun leh tui in hun hriattirna a ni e.',
    progress: 'I hriat rengna hmasawnna te helai ah hian a inziak reng e.',
    sos: 'Tanpui i ngaih chuan Elderline 14567 ah biak pawh theih a ni.'
  },
  kha: {
    welcome: 'Khublei bad sngewbha sha ka NeuroSetu. Kynmaw ban pyndonkam ia ki jingialehkai bad ki dawai ba la thoh. Phi lah ruh ban kren lyngba ka microphone.',
    games: 'Jied ia kino kino ki jingialehkai ban sdang. Phi lah ban shu thoh ne kren ban ai jubab.',
    reminders: 'Kine ki dei ki jingkynmaw ia ki dawai bad ka jingdih um man la ka sngi.',
    progress: 'Ka jingroiirong jong ka jingkynmaw jong phi la buh bha hangne.',
    sos: 'Lada donkam jingiarap kyrkieh, phone sha ka 14567.'
  },
  grt: {
    welcome: 'NeuroSetu-ona rimchaksoa. Sam aro kal·anirangko nina ia card-rangko jotbo. Na·simang microphone-chi aganbana gita man·gen.',
    games: 'Kal·na gita ia card-rangko seokbo. Ku·rangchi aganchakna man·gen.',
    reminders: 'Ia re·anggipa salrangni sam aro chi ringani niamrangko nina man·a.',
    progress: 'Na·simangni gisik bimang aro an·sengbaljokaniko nina man·a.',
    sos: 'Nangchongmota somoio 14567 helpline-ona phone ka·na man·gen.'
  },
  brx: {
    welcome: 'নিওৰোসেতু-আও बरायबाय। गावनि गोसोखांथि आरो मुलि लोंनायनि थाखाय गाहायनि काडफोरखौ थু। नोंथाङा माइक\'आव रायलायनानैबो फिनजाथाय होनो हागोन।',
    games: 'गेलेनो थाखाय गाहायनि काडखौ थु। रायलायनानैबो फिनजाथाय होनो हागौ।',
    reminders: 'मुलि लोंनाय आरो दै लोंनायनि गोसोखांथि बेयाव दं।',
    progress: 'गावनि साबसिन जानायनि खौरां बेयाव नुगोन।',
    sos: 'गाहाइ हेल्पलाइन 14567 आव कल खालाम।'
  }
};

export const AUDIO_HELP_PHONETIC_SCRIPTS = {
  en: {
    welcome: 'Welcome to NeuroSetu. You are in a safe place. Tap any card below to play memory games, check your daily medicine reminders, or speak with your family. You can also tap the microphone to answer using your voice.',
    games: 'Tap on any of the three game cards to begin. You can answer questions by touching the options or speaking your answer clearly.',
    reminders: 'Here are your daily reminders. You can track your medicines, water intake, daily walk, and doctor appointments. Tap Read All Aloud to hear your schedule.',
    progress: 'This dashboard tracks your memory journey and response latency gently for your health worker and family.',
    sos: 'If you ever need immediate assistance, pressing the SOS button will connect you to the National Elderline 14567 and alert your caregiver.'
  },
  as: {
    welcome: 'Nomoskaar NeuroSetuloi. Apunaar dinto shubho houk. Kheliboloi jikono eta card sparsha korok, naiba oukhodor taalika aru showoroni saawok. Apuni microphone tipi maat maatio uttor dibo paare.',
    games: 'Khel aarombho koriboloi jikono eta khel baasi lowok. Apuni aangulire sparsha kori ba maat maati uttor dibo paare.',
    reminders: 'Eiya apunaar doinik showoroni. Oukhodh khowaa, paani khowaa aru chikitsokor saakshaat susee iyaat uplobdho.',
    progress: 'Apunaar smriti shaktir unnoti aru khelor khotiyaan iyaat songrokkhito hoi aase.',
    sos: 'Zorurikalin xohaayor baabe zyeshtho naagorik helpline 14567 nombor aru poriyaaloloi zogaazog koraa hobo.'
  },
  bn: {
    welcome: 'NeuroSetute aapnake shagotom. Aapanar dinti shundor hok. Shritishokti o anonder jonno nicher card-gulo sparsha korun, othoba aushodher taalika dekhun. Aapni mike-e kotha bole-o uttor dite paaren.',
    games: 'Khelte shuru korar jonno jekono ekti khelaa bechhe nin. Aapni screen-e chhuye baa mukhe bole uttor dite paaren.',
    reminders: 'Ekhane aapnar doinondin aushodh, jol khaowaa ebong doctorer saathe dekha korar somoysuchi royechhe.',
    progress: 'Aapnar swasthya ebong smritishoktir ogrogotir khotiyaan ekhane shurokkhito royechhe.',
    sos: 'Joruri shohayotar jonno 14567 elderline-e ebong aaponar poribarer kaachhe baartaa pathano hobe.'
  },
  hi: {
    welcome: 'NeuroSetu mein aapka swaagat hai. Aapka din shubh ho. Apni yaaddasht aur khel ke liye neeche diye gaye card ko chhuein, ya dawaii ki soochi dekhein. Aap mic dabaakar bolkar bhi jawaab de sakte hain.',
    games: 'Khelne ke liye kisi bhi card ko chunein. Aap screen chhukar ya bolkar uttar de sakte hain.',
    reminders: 'Yeh aapki dawaiyon, paani peene aur doctor ki jaanch ki dainik soochi hai.',
    progress: 'Aapki yaaddasht aur khel ki pragati yahaan surakshit hai.',
    sos: 'Aapaatkaaleen sahaayata ke liye varishth naagrik helpline 14567 aur aapke parivaar se sampark hoga.'
  },
  mni: {
    welcome: 'NeuroSetu da taranan okchari. Nahanbagee thabak, ningshing nupal amasung leirang pumnamak asomda leijei. Microphonda ngangbadagi paokhum pijaba yai.',
    games: 'Sannaba hounaba card amada thubiyu. Fajatana paokhum piba yai.',
    reminders: 'Ahing-nungthilgi hidak-langthak amasung eshing thakpagi ningshingba asomda leijei.',
    progress: 'Punsigee ningshing thabaksing asomda mayek shengna thamjei.',
    sos: 'Akanba matamda mateng panaba helpline 14567 da pao pijagani.'
  },
  lus: {
    welcome: 'NeuroSetu ah kan lo lawm a che. I hriselna leh hriat rengna atana infiamna leh damdawi hriattirna en turin card hi hmet rawh. Aw hmangin i chhang thei bawk e.',
    games: 'Infiam tan turin a hnuai ami hi thlang rawh. Tawngka in emaw khawih in emaw i chhang thei ang.',
    reminders: 'Hei hi i nitin damdawi ei hun leh tui in hun hriattirna a ni e.',
    progress: 'I hriat rengna hmasawnna te helai ah hian a inziak reng e.',
    sos: 'Tanpui i ngaih chuan Elderline 14567 ah biak pawh theih a ni.'
  },
  kha: {
    welcome: 'Khublei bad sngewbha sha ka NeuroSetu. Kynmaw ban pyndonkam ia ki jingialehkai bad ki dawai ba la thoh. Phi lah ruh ban kren lyngba ka microphone.',
    games: 'Jied ia kino kino ki jingialehkai ban sdang. Phi lah ban shu thoh ne kren ban ai jubab.',
    reminders: 'Kine ki dei ki jingkynmaw ia ki dawai bad ka jingdih um man la ka sngi.',
    progress: 'Ka jingroiirong jong ka jingkynmaw jong phi la buh bha hangne.',
    sos: 'Lada donkam jingiarap kyrkieh, phone sha ka 14567.'
  },
  grt: {
    welcome: 'NeuroSetu-ona rimchaksoa. Sam aro kal·anirangko nina ia card-rangko jotbo. Na·simang microphone-chi aganbana gita man·gen.',
    games: 'Kal·na gita ia card-rangko seokbo. Ku·rangchi aganchakna man·gen.',
    reminders: 'Ia re·anggipa salrangni sam aro chi ringani niamrangko nina man·a.',
    progress: 'Na·simangni gisik bimang aro an·sengbaljokaniko nina man·a.',
    sos: 'Nangchongmota somoio 14567 helpline-ona phone ka·na man·gen.'
  },
  brx: {
    welcome: 'NeuroSetu-ao borayboy. Gaoni gosokhangthi aro muli longnayni thakhay gahayni card-forkhow thu. Nongthanga mic-ao raylaynanoybo finzathay hono haagon.',
    games: 'Geleno thakhay gahayni card-khow thu. Raylaynanoybo finzathay hono haagou.',
    reminders: 'Muli longnay aro doy longnayni gosokhangthi beyaw dong.',
    progress: 'Gaoni saawbsin jaanayni khorang beyaw nugon.',
    sos: 'Gaahay helpline 14567 aaw call khaalaam.'
  }
};

/**
 * Get Audio Guidance text by section and language (with optional phonetic mode)
 */
export function getAudioHelpText(section = 'welcome', lang = 'en', usePhonetic = false) {
  const dictionary = usePhonetic ? AUDIO_HELP_PHONETIC_SCRIPTS : AUDIO_HELP_SCRIPTS;
  const scripts = dictionary[lang] || dictionary.en || AUDIO_HELP_SCRIPTS.en;
  return scripts[section] || scripts.welcome || AUDIO_HELP_SCRIPTS.en.welcome;
}
