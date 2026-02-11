export interface Prompt {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  category: string;
  aiModel: string;
  rating: number;
  reviews: number;
  sales: number;
  thumbnail: string;
  seller: {
    name: string;
    avatar: string;
    rating: number;
  };
  tags: string[];
  difficulty: "مبتدئ" | "متقدم";
  samples: string[];
  fullContent?: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  count: number;
}

export const categories: Category[] = [
  { id: "gpt", name: "ChatGPT", nameEn: "ChatGPT", icon: "MessageSquare", count: 234 },
  { id: "midjourney", name: "Midjourney", nameEn: "Midjourney", icon: "Image", count: 189 },
  { id: "dalle", name: "DALL·E", nameEn: "DALL·E", icon: "Palette", count: 156 },
  { id: "business", name: "الأعمال", nameEn: "Business", icon: "Briefcase", count: 298 },
  { id: "education", name: "التعليم", nameEn: "Education", icon: "GraduationCap", count: 167 },
  { id: "marketing", name: "التسويق", nameEn: "Marketing", icon: "TrendingUp", count: 203 },
  { id: "writing", name: "الكتابة", nameEn: "Writing", icon: "PenTool", count: 245 },
  { id: "design", name: "التصميم", nameEn: "Design", icon: "Sparkles", count: 178 },
];

export const prompts: Prompt[] = [
  {
    id: "1",
    title: "برومبت كتابة محتوى تسويقي احترافي",
    titleEn: "Professional Marketing Content Writer",
    description: "برومبت متقدم لكتابة محتوى تسويقي جذاب يزيد من التحويلات والمبيعات. مثالي لكتابة إعلانات، منشورات وسائل التواصل، ورسائل البريد الإلكتروني.",
    descriptionEn: "Advanced prompt for writing engaging marketing content that increases conversions and sales.",
    price: 29.99,
    category: "marketing",
    aiModel: "ChatGPT",
    rating: 4.8,
    reviews: 124,
    sales: 567,
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    seller: {
      name: "أحمد محمود",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      rating: 4.9,
    },
    tags: ["تسويق", "محتوى", "إعلانات", "SEO"],
    difficulty: "متقدم",
    samples: [
      "مثال على محتوى تسويقي لمنتج تقني...",
      "مثال على إعلان جذاب لخدمة رقمية...",
    ],
  },
  {
    id: "2",
    title: "مولد صور فنية بأسلوب عربي",
    titleEn: "Arabic Style Artistic Image Generator",
    description: "برومبت لتوليد صور فنية رائعة بأسلوب عربي وإسلامي. مثالي للمصممين والفنانين الذين يبحثون عن إلهام بصري.",
    descriptionEn: "Generate stunning artistic images with Arabic and Islamic style.",
    price: 39.99,
    category: "midjourney",
    aiModel: "Midjourney",
    rating: 4.9,
    reviews: 89,
    sales: 423,
    thumbnail: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800",
    seller: {
      name: "فاطمة الزهراء",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      rating: 5.0,
    },
    tags: ["فن", "تصميم", "عربي", "midjourney"],
    difficulty: "مبتدئ",
    samples: [
      "صورة لزخارف إسلامية معاصرة...",
      "صورة لمدينة عربية مستقبلية...",
    ],
  },
  {
    id: "3",
    title: "مساعد كتابة الأبحاث الأكاديمية",
    titleEn: "Academic Research Writing Assistant",
    description: "برومبت شامل لمساعدة الطلاب والباحثين في كتابة الأبحاث الأكاديمية بجودة عالية. يساعد في التنظيم، الصياغة، والمراجع.",
    descriptionEn: "Comprehensive prompt for helping students and researchers write high-quality academic papers.",
    price: 24.99,
    category: "education",
    aiModel: "ChatGPT",
    rating: 4.7,
    reviews: 156,
    sales: 789,
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800",
    seller: {
      name: "د. محمد العلي",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      rating: 4.8,
    },
    tags: ["تعليم", "أبحاث", "أكاديمي", "كتابة"],
    difficulty: "متقدم",
    samples: [],
  },
  {
    id: "4",
    title: "مولد شعارات وهوية تجارية",
    titleEn: "Logo and Brand Identity Generator",
    description: "برومبت لإنشاء أفكار شعارات احترافية وهوية تجارية متكاملة. مثالي للمشاريع الناشئة والشركات الصغيرة.",
    descriptionEn: "Generate professional logo ideas and complete brand identity.",
    price: 34.99,
    category: "design",
    aiModel: "DALL·E",
    rating: 4.6,
    reviews: 98,
    sales: 345,
    thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800",
    seller: {
      name: "سارة أحمد",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      rating: 4.7,
    },
    tags: ["تصميم", "شعار", "هوية", "برندنق"],
    difficulty: "مبتدئ",
    samples: [],
  },
  {
    id: "5",
    title: "استراتيجي خطة عمل شاملة",
    titleEn: "Comprehensive Business Plan Strategist",
    description: "برومبت لإنشاء خطط عمل احترافية وشاملة لأي نوع من المشاريع. يشمل التحليل المالي، السوقي، والتنفيذي.",
    descriptionEn: "Create professional comprehensive business plans for any type of project.",
    price: 49.99,
    category: "business",
    aiModel: "ChatGPT",
    rating: 4.9,
    reviews: 67,
    sales: 234,
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
    seller: {
      name: "خالد البشير",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      rating: 4.9,
    },
    tags: ["أعمال", "خطة", "استراتيجية", "تمويل"],
    difficulty: "متقدم",
    samples: [],
  },
  {
    id: "6",
    title: "كاتب قصص وروايات إبداعية",
    titleEn: "Creative Story and Novel Writer",
    description: "برومبت متخصص في كتابة القصص والروايات الإبداعية بأسلوب أدبي راقي. مثالي للكتاب والمؤلفين.",
    descriptionEn: "Specialized prompt for writing creative stories and novels with refined literary style.",
    price: 27.99,
    category: "writing",
    aiModel: "ChatGPT",
    rating: 4.8,
    reviews: 143,
    sales: 678,
    thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
    seller: {
      name: "ليلى حسن",
      avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100",
      rating: 4.8,
    },
    tags: ["كتابة", "قصص", "رواية", "إبداع"],
    difficulty: "مبتدئ",
    samples: [],
  },
  {
    id: "7",
    title: "محلل بيانات ومخططات بيانية",
    titleEn: "Data Analyst and Chart Generator",
    description: "برومبت لتحليل البيانات وإنشاء تقارير ومخططات بيانية احترافية. مثالي لمحللي البيانات وأصحاب القرار.",
    descriptionEn: "Analyze data and create professional reports and charts.",
    price: 44.99,
    category: "business",
    aiModel: "ChatGPT",
    rating: 4.7,
    reviews: 76,
    sales: 289,
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    seller: {
      name: "عمر الشمري",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100",
      rating: 4.8,
    },
    tags: ["بيانات", "تحليل", "تقارير", "أعمال"],
    difficulty: "متقدم",
    samples: [],
  },
  {
    id: "8",
    title: "مصمم واجهات مستخدم UI/UX",
    titleEn: "UI/UX Designer Prompt",
    description: "برومبت لتوليد أفكار تصميم واجهات مستخدم احترافية وتجربة مستخدم متميزة. يشمل نصائح وأفضل الممارسات.",
    descriptionEn: "Generate professional UI/UX design ideas with best practices.",
    price: 36.99,
    category: "design",
    aiModel: "ChatGPT",
    rating: 4.6,
    reviews: 92,
    sales: 412,
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
    seller: {
      name: "نور الدين",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100",
      rating: 4.7,
    },
    tags: ["تصميم", "UI", "UX", "واجهات"],
    difficulty: "متقدم",
    samples: [],
  },
];

export const testimonials = [
  {
    id: "1",
    name: "محمد السعيد",
    role: "مسوق رقمي",
    content: "وجدت البرومبتات التي أحتاجها لتطوير عملي. جودة عالية وأسعار معقولة!",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100",
    rating: 5,
  },
  {
    id: "2",
    name: "فاطمة الحربي",
    role: "مصممة جرافيك",
    content: "منصة رائعة للعثور على برومبتات Midjourney المميزة. وفرت علي الكثير من الوقت.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100",
    rating: 5,
  },
  {
    id: "3",
    name: "أحمد الخطيب",
    role: "كاتب محتوى",
    content: "بفضل البرومبتات من هذا السوق، أصبحت كتابتي أكثر احترافية وإبداعاً.",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
    rating: 5,
  },
];

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
}

export const reviews: Review[] = [
  {
    id: "1",
    userName: "عبدالله محمد",
    userAvatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100",
    rating: 5,
    date: "2026-02-05",
    comment: "برومبت رائع جداً! ساعدني في تحسين محتوى التسويق بشكل كبير.",
  },
  {
    id: "2",
    userName: "منى العتيبي",
    userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
    rating: 4,
    date: "2026-02-03",
    comment: "جيد جداً، لكن كنت أتمنى أن يكون هناك المزيد من الأمثلة.",
  },
  {
    id: "3",
    userName: "سعيد الأحمدي",
    userAvatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100",
    rating: 5,
    date: "2026-01-28",
    comment: "ممتاز! يستحق السعر. البائع محترف ومتعاون.",
  },
];
