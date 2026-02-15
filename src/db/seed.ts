import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories } from "./schema/categories";
import { prompts } from "./schema/prompts";
import { sellerProfiles } from "./schema/seller-profiles";
import { testimonials } from "./schema/testimonials";
import { sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

// ─── Seller Personas ──────────────────────────────────────────────

const sellers = [
  { id: "seed-seller-1", name: "أحمد الخالدي", rating: 4.9, country: "SA", bio: "مطور برومبتات محترف متخصص في التسويق والأعمال" },
  { id: "seed-seller-2", name: "فاطمة الزهراء", rating: 5.0, country: "EG", bio: "خبيرة في تصميم الصور بالذكاء الاصطناعي والفنون الرقمية" },
  { id: "seed-seller-3", name: "محمد العتيبي", rating: 4.7, country: "AE", bio: "مبرمج ومطور برومبتات للأكواد والتطبيقات" },
  { id: "seed-seller-4", name: "نورة الشمري", rating: 4.8, country: "JO", bio: "متخصصة في برومبتات التعليم والمحتوى الأكاديمي" },
  { id: "seed-seller-5", name: "خالد البدر", rating: 4.6, country: "MA", bio: "كاتب محتوى محترف يصنع برومبتات إبداعية متميزة" },
  { id: "seed-seller-6", name: "سارة المالكي", rating: 4.9, country: "KW", bio: "خبيرة تسويق رقمي تقدم أفضل برومبتات الحملات الإعلانية" },
  { id: "seed-seller-7", name: "عبدالله الحربي", rating: 4.5, country: "QA", bio: "مصمم جرافيك يبدع في برومبتات التصميم والهوية البصرية" },
  { id: "seed-seller-8", name: "ريم القحطاني", rating: 4.8, country: "BH", bio: "متخصصة في كتابة برومبتات الأعمال والاستراتيجيات" },
  { id: "seed-seller-9", name: "يوسف الدوسري", rating: 3.9, country: "OM", bio: "مطور تطبيقات يقدم برومبتات برمجية متقدمة" },
  { id: "seed-seller-10", name: "هند العنزي", rating: 4.7, country: "TN", bio: "صانعة محتوى رقمي متخصصة في وسائل التواصل الاجتماعي" },
];

function sellerAvatar(name: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=ffdfbf`;
}

// ─── AI Models & Generation Types ─────────────────────────────────

const difficulties = ["مبتدئ", "متقدم"] as const;

// ─── Prompt Templates ─────────────────────────────────────────────

const promptData: {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  tags: string[];
  generationType: "text" | "image" | "code" | "marketing" | "design";
  aiModel: string;
  category: string;
}[] = [
  // TEXT prompts (20)
  { title: "كاتب محتوى تسويقي احترافي", titleEn: "Professional Marketing Content Writer", description: "برومبت متقدم لكتابة محتوى تسويقي جذاب يزيد من التحويلات والمبيعات", descriptionEn: "Advanced prompt for writing engaging marketing content", tags: ["تسويق", "محتوى", "إعلانات"], generationType: "text", aiModel: "ChatGPT", category: "marketing" },
  { title: "مساعد كتابة الأبحاث الأكاديمية", titleEn: "Academic Research Writing Assistant", description: "برومبت شامل لمساعدة الطلاب والباحثين في كتابة الأبحاث بجودة عالية", descriptionEn: "Comprehensive academic research writing helper", tags: ["تعليم", "أبحاث", "أكاديمي"], generationType: "text", aiModel: "ChatGPT", category: "education" },
  { title: "كاتب قصص إبداعية عربية", titleEn: "Arabic Creative Story Writer", description: "برومبت متخصص في كتابة القصص والروايات الإبداعية بأسلوب أدبي راقي", descriptionEn: "Creative Arabic fiction and story writing prompt", tags: ["كتابة", "قصص", "إبداع"], generationType: "text", aiModel: "Claude", category: "writing" },
  { title: "محرر النصوص وتدقيق لغوي", titleEn: "Text Editor and Proofreader", description: "برومبت لتحرير النصوص العربية وتصحيح الأخطاء اللغوية والنحوية", descriptionEn: "Arabic text editing and grammar correction", tags: ["تدقيق", "لغة", "تحرير"], generationType: "text", aiModel: "ChatGPT", category: "writing" },
  { title: "مترجم محترف عربي-إنجليزي", titleEn: "Professional Arabic-English Translator", description: "برومبت للترجمة الاحترافية بين العربية والإنجليزية مع الحفاظ على السياق", descriptionEn: "Professional Arabic-English bidirectional translation", tags: ["ترجمة", "لغة", "عربي"], generationType: "text", aiModel: "Claude", category: "writing" },
  { title: "مستشار خطة عمل شاملة", titleEn: "Comprehensive Business Plan Advisor", description: "برومبت لإنشاء خطط عمل احترافية شاملة تتضمن التحليل المالي والسوقي", descriptionEn: "Create professional comprehensive business plans", tags: ["أعمال", "خطة", "استراتيجية"], generationType: "text", aiModel: "ChatGPT", category: "business" },
  { title: "كاتب رسائل بريد إلكتروني", titleEn: "Email Copywriter", description: "برومبت لكتابة رسائل بريد إلكتروني احترافية للتسويق والمبيعات", descriptionEn: "Professional email writing for marketing and sales", tags: ["بريد", "تسويق", "مبيعات"], generationType: "text", aiModel: "Gemini", category: "marketing" },
  { title: "مولد أفكار محتوى يوتيوب", titleEn: "YouTube Content Ideas Generator", description: "برومبت لتوليد أفكار فيديوهات يوتيوب جذابة مع عناوين وأوصاف محسّنة", descriptionEn: "Generate engaging YouTube video ideas with optimized titles", tags: ["يوتيوب", "محتوى", "فيديو"], generationType: "text", aiModel: "ChatGPT", category: "marketing" },
  { title: "كاتب منشورات وسائل التواصل", titleEn: "Social Media Post Writer", description: "برومبت لكتابة منشورات جذابة لجميع منصات وسائل التواصل الاجتماعي", descriptionEn: "Write engaging posts for all social media platforms", tags: ["سوشال", "منشورات", "تواصل"], generationType: "text", aiModel: "Claude", category: "marketing" },
  { title: "محلل بيانات ومخططات بيانية", titleEn: "Data Analyst and Chart Maker", description: "برومبت لتحليل البيانات وإنشاء تقارير ومخططات بيانية احترافية", descriptionEn: "Data analysis and professional chart generation", tags: ["بيانات", "تحليل", "تقارير"], generationType: "text", aiModel: "ChatGPT", category: "business" },
  { title: "مساعد إعداد السيرة الذاتية", titleEn: "Resume Writing Assistant", description: "برومبت لإنشاء سيرة ذاتية احترافية متوافقة مع أنظمة ATS", descriptionEn: "Create professional ATS-compatible resumes", tags: ["سيرة", "وظائف", "مهنية"], generationType: "text", aiModel: "Gemini", category: "business" },
  { title: "كاتب وصف منتجات متجر", titleEn: "E-commerce Product Description Writer", description: "برومبت لكتابة أوصاف منتجات جذابة ومحسّنة لمحركات البحث", descriptionEn: "Write SEO-optimized product descriptions", tags: ["تجارة", "منتجات", "SEO"], generationType: "text", aiModel: "ChatGPT", category: "marketing" },
  { title: "مولد خطط دروس تعليمية", titleEn: "Lesson Plan Generator", description: "برومبت لإنشاء خطط دروس تفاعلية ومفصّلة للمعلمين والمدرسين", descriptionEn: "Create interactive detailed lesson plans for teachers", tags: ["تعليم", "دروس", "مناهج"], generationType: "text", aiModel: "Claude", category: "education" },
  { title: "مستشار استراتيجية تسويق رقمي", titleEn: "Digital Marketing Strategy Consultant", description: "برومبت لتطوير استراتيجيات تسويق رقمي شاملة ومخصصة", descriptionEn: "Develop comprehensive digital marketing strategies", tags: ["تسويق", "استراتيجية", "رقمي"], generationType: "text", aiModel: "ChatGPT", category: "marketing" },
  { title: "محرر مقالات مدونة محسّنة", titleEn: "SEO Blog Article Editor", description: "برومبت لكتابة وتحرير مقالات مدونة متوافقة مع SEO", descriptionEn: "Write and edit SEO-optimized blog articles", tags: ["مدونة", "SEO", "مقالات"], generationType: "text", aiModel: "Gemini", category: "writing" },
  { title: "مساعد تلخيص الكتب والمقالات", titleEn: "Book and Article Summarizer", description: "برومبت لتلخيص الكتب والمقالات الطويلة بطريقة منظمة ومفيدة", descriptionEn: "Summarize books and long articles effectively", tags: ["تلخيص", "كتب", "قراءة"], generationType: "text", aiModel: "Claude", category: "education" },
  { title: "كاتب نصوص إعلانية PPC", titleEn: "PPC Ad Copy Writer", description: "برومبت لكتابة نصوص إعلانية فعّالة لحملات Google Ads و Facebook", descriptionEn: "Write effective ad copy for PPC campaigns", tags: ["إعلانات", "PPC", "حملات"], generationType: "text", aiModel: "ChatGPT", category: "marketing" },
  { title: "مولد أسئلة مقابلات العمل", titleEn: "Job Interview Questions Generator", description: "برومبت لإنشاء أسئلة مقابلات عمل مخصصة حسب الوظيفة والمستوى", descriptionEn: "Generate customized job interview questions", tags: ["مقابلات", "وظائف", "توظيف"], generationType: "text", aiModel: "Gemini", category: "business" },
  { title: "كاتب سيناريوهات فيديو", titleEn: "Video Script Writer", description: "برومبت لكتابة سيناريوهات فيديو احترافية للإعلانات والمحتوى التعليمي", descriptionEn: "Write professional video scripts for ads and educational content", tags: ["فيديو", "سيناريو", "إنتاج"], generationType: "text", aiModel: "Claude", category: "writing" },
  { title: "مساعد كتابة العقود القانونية", titleEn: "Legal Contract Writing Assistant", description: "برومبت لصياغة العقود والاتفاقيات القانونية بلغة عربية دقيقة", descriptionEn: "Draft legal contracts and agreements in Arabic", tags: ["قانوني", "عقود", "اتفاقيات"], generationType: "text", aiModel: "ChatGPT", category: "business" },

  // IMAGE prompts (20)
  { title: "مولد صور فنية بأسلوب عربي", titleEn: "Arabic Style Art Generator", description: "برومبت لتوليد صور فنية رائعة بأسلوب عربي وإسلامي مع زخارف هندسية", descriptionEn: "Generate stunning Arabic and Islamic style art", tags: ["فن", "عربي", "زخارف"], generationType: "image", aiModel: "Midjourney", category: "design" },
  { title: "مصمم شعارات احترافية", titleEn: "Professional Logo Designer", description: "برومبت لإنشاء شعارات احترافية وهوية تجارية متكاملة", descriptionEn: "Create professional logos and brand identity", tags: ["شعار", "هوية", "تصميم"], generationType: "image", aiModel: "DALL·E", category: "design" },
  { title: "مولد صور منتجات تجارية", titleEn: "Product Photography Generator", description: "برومبت لتوليد صور منتجات احترافية للمتاجر الإلكترونية", descriptionEn: "Generate professional product photos for e-commerce", tags: ["منتجات", "صور", "تجارة"], generationType: "image", aiModel: "Midjourney", category: "design" },
  { title: "مصمم أغلفة كتب رقمية", titleEn: "Digital Book Cover Designer", description: "برومبت لتصميم أغلفة كتب رقمية جذابة واحترافية", descriptionEn: "Design attractive digital book covers", tags: ["أغلفة", "كتب", "نشر"], generationType: "image", aiModel: "DALL·E", category: "design" },
  { title: "مولد رسوم توضيحية تعليمية", titleEn: "Educational Illustration Generator", description: "برومبت لإنشاء رسوم توضيحية تعليمية واضحة وجذابة", descriptionEn: "Create clear educational illustrations", tags: ["رسوم", "تعليم", "توضيح"], generationType: "image", aiModel: "Stable Diffusion", category: "education" },
  { title: "مصمم بانرات إعلانية", titleEn: "Ad Banner Designer", description: "برومبت لتصميم بانرات إعلانية احترافية لوسائل التواصل والمواقع", descriptionEn: "Design professional advertising banners", tags: ["بانر", "إعلانات", "تصميم"], generationType: "image", aiModel: "Midjourney", category: "marketing" },
  { title: "مولد صور خلفيات سطح المكتب", titleEn: "Desktop Wallpaper Generator", description: "برومبت لتوليد خلفيات سطح مكتب عالية الدقة بأساليب فنية متنوعة", descriptionEn: "Generate high-resolution desktop wallpapers", tags: ["خلفيات", "فن", "HD"], generationType: "image", aiModel: "Stable Diffusion", category: "design" },
  { title: "مصمم شخصيات كرتونية", titleEn: "Cartoon Character Designer", description: "برومبت لتصميم شخصيات كرتونية فريدة للعلامات التجارية والمحتوى", descriptionEn: "Design unique cartoon characters for brands", tags: ["كرتون", "شخصيات", "رسم"], generationType: "image", aiModel: "Midjourney", category: "design" },
  { title: "مولد صور واقعية بالذكاء الاصطناعي", titleEn: "AI Photorealistic Image Generator", description: "برومبت لتوليد صور واقعية عالية الجودة باستخدام الذكاء الاصطناعي", descriptionEn: "Generate photorealistic AI images", tags: ["واقعي", "صور", "AI"], generationType: "image", aiModel: "DALL·E", category: "design" },
  { title: "مصمم بطاقات دعوة رقمية", titleEn: "Digital Invitation Card Designer", description: "برومبت لتصميم بطاقات دعوة رقمية أنيقة للمناسبات المختلفة", descriptionEn: "Design elegant digital invitation cards", tags: ["بطاقات", "دعوة", "مناسبات"], generationType: "image", aiModel: "Stable Diffusion", category: "design" },
  { title: "مولد صور أطعمة شهية", titleEn: "Food Photography Generator", description: "برومبت لتوليد صور أطعمة شهية واحترافية للمطاعم والقوائم", descriptionEn: "Generate appetizing food photography", tags: ["طعام", "مطاعم", "صور"], generationType: "image", aiModel: "Midjourney", category: "marketing" },
  { title: "مصمم أيقونات تطبيقات", titleEn: "App Icon Designer", description: "برومبت لتصميم أيقونات تطبيقات جوال احترافية وجذابة", descriptionEn: "Design professional mobile app icons", tags: ["أيقونات", "تطبيقات", "موبايل"], generationType: "image", aiModel: "DALL·E", category: "design" },
  { title: "مولد صور مناظر طبيعية خيالية", titleEn: "Fantasy Landscape Generator", description: "برومبت لتوليد صور مناظر طبيعية خيالية مذهلة بتفاصيل دقيقة", descriptionEn: "Generate stunning fantasy landscape images", tags: ["مناظر", "خيال", "طبيعة"], generationType: "image", aiModel: "Midjourney", category: "design" },
  { title: "مصمم إنفوجرافيك بصري", titleEn: "Visual Infographic Designer", description: "برومبت لتصميم إنفوجرافيك بصري جذاب لعرض البيانات والمعلومات", descriptionEn: "Design visual infographics for data presentation", tags: ["إنفوجرافيك", "بيانات", "تصميم"], generationType: "image", aiModel: "Stable Diffusion", category: "business" },
  { title: "مولد صور بورتريه فني", titleEn: "Artistic Portrait Generator", description: "برومبت لتوليد صور بورتريه فنية بأساليب مختلفة (زيتي، مائي، رقمي)", descriptionEn: "Generate artistic portraits in various styles", tags: ["بورتريه", "فن", "رسم"], generationType: "image", aiModel: "Midjourney", category: "design" },
  { title: "مصمم أنماط وباترنات", titleEn: "Pattern and Texture Designer", description: "برومبت لتصميم أنماط وباترنات قابلة للتكرار لاستخدامات متعددة", descriptionEn: "Design seamless repeatable patterns and textures", tags: ["أنماط", "باترن", "نسيج"], generationType: "image", aiModel: "Stable Diffusion", category: "design" },
  { title: "مولد صور معمارية ثلاثية الأبعاد", titleEn: "3D Architecture Render Generator", description: "برومبت لتوليد صور معمارية ثلاثية الأبعاد واقعية للمشاريع", descriptionEn: "Generate realistic 3D architectural renders", tags: ["معمارية", "3D", "تصميم"], generationType: "image", aiModel: "Midjourney", category: "design" },
  { title: "مصمم ملصقات وستيكرات", titleEn: "Sticker and Decal Designer", description: "برومبت لتصميم ملصقات وستيكرات مميزة للطباعة والاستخدام الرقمي", descriptionEn: "Design unique stickers and decals", tags: ["ملصقات", "ستيكر", "طباعة"], generationType: "image", aiModel: "DALL·E", category: "design" },
  { title: "مولد صور موضة وأزياء", titleEn: "Fashion Photography Generator", description: "برومبت لتوليد صور أزياء وموضة احترافية للعلامات التجارية", descriptionEn: "Generate professional fashion photography", tags: ["أزياء", "موضة", "تصميم"], generationType: "image", aiModel: "Midjourney", category: "marketing" },
  { title: "مصمم خرائط ذهنية بصرية", titleEn: "Visual Mind Map Designer", description: "برومبت لتصميم خرائط ذهنية بصرية جذابة لتنظيم الأفكار", descriptionEn: "Design visual mind maps for idea organization", tags: ["خرائط", "أفكار", "تنظيم"], generationType: "image", aiModel: "Stable Diffusion", category: "education" },

  // CODE prompts (20)
  { title: "مساعد بناء تطبيقات React", titleEn: "React App Builder Assistant", description: "برومبت لبناء مكونات React احترافية مع TypeScript و Tailwind", descriptionEn: "Build professional React components with TypeScript", tags: ["React", "TypeScript", "تطوير"], generationType: "code", aiModel: "Copilot", category: "gpt" },
  { title: "مولد API باستخدام Node.js", titleEn: "Node.js API Generator", description: "برومبت لإنشاء واجهات برمجية RESTful احترافية باستخدام Node.js و Express", descriptionEn: "Generate professional RESTful APIs with Node.js", tags: ["API", "Node.js", "باك إند"], generationType: "code", aiModel: "ChatGPT", category: "gpt" },
  { title: "مصحح أخطاء البرمجة الذكي", titleEn: "Smart Code Debugger", description: "برومبت لتشخيص وإصلاح أخطاء البرمجة في مختلف اللغات", descriptionEn: "Diagnose and fix programming bugs across languages", tags: ["تصحيح", "أخطاء", "برمجة"], generationType: "code", aiModel: "Claude", category: "gpt" },
  { title: "مولد استعلامات SQL متقدمة", titleEn: "Advanced SQL Query Generator", description: "برومبت لكتابة استعلامات SQL معقدة ومُحسّنة للأداء", descriptionEn: "Write complex optimized SQL queries", tags: ["SQL", "قواعد بيانات", "استعلامات"], generationType: "code", aiModel: "ChatGPT", category: "gpt" },
  { title: "مساعد بناء تطبيقات Flutter", titleEn: "Flutter App Builder", description: "برومبت لبناء تطبيقات Flutter متعددة المنصات بتصميم Material", descriptionEn: "Build cross-platform Flutter apps with Material Design", tags: ["Flutter", "موبايل", "Dart"], generationType: "code", aiModel: "Copilot", category: "gpt" },
  { title: "مولد اختبارات وحدة تلقائية", titleEn: "Unit Test Generator", description: "برومبت لكتابة اختبارات وحدة شاملة باستخدام Jest و Testing Library", descriptionEn: "Write comprehensive unit tests with Jest", tags: ["اختبارات", "Jest", "TDD"], generationType: "code", aiModel: "Claude", category: "gpt" },
  { title: "محسّن أداء التطبيقات", titleEn: "Application Performance Optimizer", description: "برومبت لتحليل وتحسين أداء تطبيقات الويب والموبايل", descriptionEn: "Analyze and optimize web and mobile app performance", tags: ["أداء", "تحسين", "سرعة"], generationType: "code", aiModel: "ChatGPT", category: "gpt" },
  { title: "مصمم قواعد بيانات", titleEn: "Database Schema Designer", description: "برومبت لتصميم قواعد بيانات علائقية مُحسّنة مع مخططات ERD", descriptionEn: "Design optimized relational databases with ERD diagrams", tags: ["قواعد بيانات", "ERD", "تصميم"], generationType: "code", aiModel: "Claude", category: "gpt" },
  { title: "مساعد DevOps والنشر", titleEn: "DevOps and Deployment Assistant", description: "برومبت لإعداد بيئات CI/CD وحاويات Docker وKubernetes", descriptionEn: "Set up CI/CD, Docker containers and Kubernetes", tags: ["DevOps", "Docker", "CI/CD"], generationType: "code", aiModel: "ChatGPT", category: "gpt" },
  { title: "مولد أكواد Python للتعلم الآلي", titleEn: "Python ML Code Generator", description: "برومبت لكتابة أكواد Python لنماذج التعلم الآلي والذكاء الاصطناعي", descriptionEn: "Generate Python code for ML and AI models", tags: ["Python", "ML", "AI"], generationType: "code", aiModel: "Copilot", category: "gpt" },
  { title: "مساعد بناء مواقع Next.js", titleEn: "Next.js Website Builder", description: "برومبت لبناء مواقع ويب حديثة باستخدام Next.js و App Router", descriptionEn: "Build modern websites with Next.js App Router", tags: ["Next.js", "ويب", "React"], generationType: "code", aiModel: "Claude", category: "gpt" },
  { title: "مولد أنماط CSS متقدمة", titleEn: "Advanced CSS Pattern Generator", description: "برومبت لإنشاء تصاميم CSS متقدمة مع animations و responsive design", descriptionEn: "Create advanced CSS with animations and responsive design", tags: ["CSS", "تصميم", "responsive"], generationType: "code", aiModel: "ChatGPT", category: "design" },
  { title: "محول أكواد بين اللغات", titleEn: "Cross-Language Code Converter", description: "برومبت لتحويل الأكواد بين لغات البرمجة المختلفة مع الحفاظ على الأداء", descriptionEn: "Convert code between programming languages", tags: ["تحويل", "لغات", "برمجة"], generationType: "code", aiModel: "Claude", category: "gpt" },
  { title: "مساعد GraphQL و API المتقدم", titleEn: "Advanced GraphQL API Helper", description: "برومبت لبناء خوادم GraphQL مع resolvers و subscriptions", descriptionEn: "Build GraphQL servers with resolvers and subscriptions", tags: ["GraphQL", "API", "باك إند"], generationType: "code", aiModel: "Copilot", category: "gpt" },
  { title: "مولد أكواد أتمتة المهام", titleEn: "Task Automation Script Generator", description: "برومبت لكتابة سكريبتات أتمتة لتسهيل المهام المتكررة", descriptionEn: "Write automation scripts for repetitive tasks", tags: ["أتمتة", "سكريبت", "إنتاجية"], generationType: "code", aiModel: "ChatGPT", category: "business" },
  { title: "مصمم أنظمة أمان الويب", titleEn: "Web Security System Designer", description: "برومبت لتصميم وتنفيذ أنظمة أمان متقدمة لتطبيقات الويب", descriptionEn: "Design and implement web security systems", tags: ["أمان", "ويب", "حماية"], generationType: "code", aiModel: "Claude", category: "gpt" },
  { title: "مولد أكواد WordPress مخصصة", titleEn: "Custom WordPress Code Generator", description: "برومبت لكتابة إضافات وقوالب WordPress مخصصة احترافية", descriptionEn: "Write custom WordPress plugins and themes", tags: ["WordPress", "PHP", "إضافات"], generationType: "code", aiModel: "ChatGPT", category: "gpt" },
  { title: "مساعد بناء تطبيقات SwiftUI", titleEn: "SwiftUI App Builder", description: "برومبت لبناء تطبيقات iOS احترافية باستخدام SwiftUI", descriptionEn: "Build professional iOS apps with SwiftUI", tags: ["SwiftUI", "iOS", "Apple"], generationType: "code", aiModel: "Copilot", category: "gpt" },
  { title: "محلل ومُحسّن أكواد TypeScript", titleEn: "TypeScript Code Analyzer", description: "برومبت لتحليل وتحسين أكواد TypeScript مع أفضل الممارسات", descriptionEn: "Analyze and improve TypeScript code with best practices", tags: ["TypeScript", "تحسين", "أكواد"], generationType: "code", aiModel: "Claude", category: "gpt" },
  { title: "مولد أكواد Tailwind CSS", titleEn: "Tailwind CSS Component Generator", description: "برومبت لإنشاء مكونات واجهة مستخدم جميلة باستخدام Tailwind CSS", descriptionEn: "Create beautiful UI components with Tailwind CSS", tags: ["Tailwind", "CSS", "UI"], generationType: "code", aiModel: "ChatGPT", category: "design" },

  // MARKETING prompts (20)
  { title: "مخطط حملات إعلانية متكاملة", titleEn: "Integrated Ad Campaign Planner", description: "برومبت لتخطيط حملات إعلانية متكاملة عبر جميع المنصات الرقمية", descriptionEn: "Plan integrated ad campaigns across digital platforms", tags: ["حملات", "إعلانات", "تسويق"], generationType: "marketing", aiModel: "ChatGPT", category: "marketing" },
  { title: "محلل المنافسين الاستراتيجي", titleEn: "Strategic Competitor Analyzer", description: "برومبت لتحليل المنافسين وتحديد نقاط القوة والضعف والفرص", descriptionEn: "Analyze competitors and identify opportunities", tags: ["منافسة", "تحليل", "استراتيجية"], generationType: "marketing", aiModel: "Claude", category: "business" },
  { title: "مولد استراتيجية محتوى شهرية", titleEn: "Monthly Content Strategy Generator", description: "برومبت لإنشاء خطة محتوى شهرية متكاملة مع تقويم نشر", descriptionEn: "Create monthly content plans with publishing calendar", tags: ["محتوى", "تقويم", "خطة"], generationType: "marketing", aiModel: "ChatGPT", category: "marketing" },
  { title: "كاتب نصوص صفحات الهبوط", titleEn: "Landing Page Copywriter", description: "برومبت لكتابة نصوص صفحات هبوط مقنعة تزيد معدل التحويل", descriptionEn: "Write compelling landing page copy that converts", tags: ["هبوط", "تحويل", "نسخ"], generationType: "marketing", aiModel: "Claude", category: "marketing" },
  { title: "مصمم استراتيجية العلامة التجارية", titleEn: "Brand Strategy Designer", description: "برومبت لتطوير استراتيجية علامة تجارية شاملة ومميزة", descriptionEn: "Develop comprehensive brand strategy", tags: ["علامة", "برندنق", "استراتيجية"], generationType: "marketing", aiModel: "ChatGPT", category: "marketing" },
  { title: "محلل أداء الحملات التسويقية", titleEn: "Marketing Campaign Performance Analyzer", description: "برومبت لتحليل أداء الحملات التسويقية وتقديم توصيات التحسين", descriptionEn: "Analyze marketing campaign performance with recommendations", tags: ["تحليل", "أداء", "حملات"], generationType: "marketing", aiModel: "Gemini", category: "marketing" },
  { title: "مولد أفكار محتوى فيروسي", titleEn: "Viral Content Ideas Generator", description: "برومبت لتوليد أفكار محتوى قابل للانتشار الفيروسي على السوشال ميديا", descriptionEn: "Generate viral content ideas for social media", tags: ["فيروسي", "محتوى", "سوشال"], generationType: "marketing", aiModel: "ChatGPT", category: "marketing" },
  { title: "كاتب دراسات حالة تسويقية", titleEn: "Marketing Case Study Writer", description: "برومبت لكتابة دراسات حالة تسويقية مقنعة تُظهر نتائج العملاء", descriptionEn: "Write compelling marketing case studies", tags: ["دراسة", "حالة", "عملاء"], generationType: "marketing", aiModel: "Claude", category: "marketing" },
  { title: "مخطط استراتيجية SEO شاملة", titleEn: "Comprehensive SEO Strategy Planner", description: "برومبت لتطوير استراتيجية SEO شاملة تشمل الكلمات المفتاحية والمحتوى", descriptionEn: "Develop comprehensive SEO strategy with keywords", tags: ["SEO", "بحث", "محتوى"], generationType: "marketing", aiModel: "ChatGPT", category: "marketing" },
  { title: "مولد سلسلة بريد إلكتروني", titleEn: "Email Sequence Generator", description: "برومبت لإنشاء سلسلة رسائل بريد إلكتروني آلية للتسويق والمبيعات", descriptionEn: "Create automated email marketing sequences", tags: ["بريد", "أتمتة", "مبيعات"], generationType: "marketing", aiModel: "Gemini", category: "marketing" },
  { title: "كاتب عروض تقديمية للمبيعات", titleEn: "Sales Pitch Deck Writer", description: "برومبت لإنشاء عروض تقديمية مقنعة للمبيعات والاستثمار", descriptionEn: "Create compelling sales and investment pitch decks", tags: ["عروض", "مبيعات", "استثمار"], generationType: "marketing", aiModel: "ChatGPT", category: "business" },
  { title: "محلل جمهور مستهدف", titleEn: "Target Audience Analyzer", description: "برومبت لتحليل وتحديد الجمهور المستهدف بدقة لأي منتج أو خدمة", descriptionEn: "Analyze and define target audiences precisely", tags: ["جمهور", "تحليل", "تسويق"], generationType: "marketing", aiModel: "Claude", category: "marketing" },
  { title: "مولد استراتيجية تسعير", titleEn: "Pricing Strategy Generator", description: "برومبت لتطوير استراتيجيات تسعير فعّالة بناءً على السوق والمنافسة", descriptionEn: "Develop effective pricing strategies", tags: ["تسعير", "استراتيجية", "سوق"], generationType: "marketing", aiModel: "ChatGPT", category: "business" },
  { title: "كاتب محتوى LinkedIn احترافي", titleEn: "Professional LinkedIn Content Writer", description: "برومبت لكتابة محتوى LinkedIn احترافي يزيد التفاعل والمتابعين", descriptionEn: "Write professional LinkedIn content for engagement", tags: ["LinkedIn", "محتوى", "مهني"], generationType: "marketing", aiModel: "Gemini", category: "marketing" },
  { title: "مصمم برنامج ولاء العملاء", titleEn: "Customer Loyalty Program Designer", description: "برومبت لتصميم برامج ولاء عملاء فعّالة تزيد الاحتفاظ بالعملاء", descriptionEn: "Design effective customer loyalty programs", tags: ["ولاء", "عملاء", "احتفاظ"], generationType: "marketing", aiModel: "ChatGPT", category: "business" },
  { title: "محلل اتجاهات السوق", titleEn: "Market Trends Analyzer", description: "برومبت لتحليل اتجاهات السوق الحالية والمستقبلية في أي قطاع", descriptionEn: "Analyze current and future market trends", tags: ["سوق", "اتجاهات", "تحليل"], generationType: "marketing", aiModel: "Claude", category: "business" },
  { title: "مولد أفكار منتجات جديدة", titleEn: "New Product Ideas Generator", description: "برومبت لتوليد أفكار منتجات مبتكرة بناءً على احتياجات السوق", descriptionEn: "Generate innovative product ideas based on market needs", tags: ["منتجات", "ابتكار", "أفكار"], generationType: "marketing", aiModel: "Gemini", category: "business" },
  { title: "كاتب نشرات صحفية", titleEn: "Press Release Writer", description: "برومبت لكتابة نشرات صحفية احترافية للشركات والمؤسسات", descriptionEn: "Write professional press releases", tags: ["صحافة", "نشرات", "علاقات عامة"], generationType: "marketing", aiModel: "ChatGPT", category: "marketing" },
  { title: "مخطط فعاليات تسويقية", titleEn: "Marketing Event Planner", description: "برومبت لتخطيط فعاليات تسويقية ناجحة سواء حضورية أو افتراضية", descriptionEn: "Plan successful marketing events", tags: ["فعاليات", "تخطيط", "تسويق"], generationType: "marketing", aiModel: "Claude", category: "marketing" },
  { title: "مصمم استبيانات رضا العملاء", titleEn: "Customer Satisfaction Survey Designer", description: "برومبت لتصميم استبيانات رضا عملاء فعّالة وقابلة للقياس", descriptionEn: "Design effective customer satisfaction surveys", tags: ["استبيانات", "رضا", "عملاء"], generationType: "marketing", aiModel: "Gemini", category: "business" },

  // DESIGN prompts (20)
  { title: "مصمم واجهات مستخدم UI/UX", titleEn: "UI/UX Interface Designer", description: "برومبت لتصميم واجهات مستخدم احترافية وتجربة مستخدم متميزة", descriptionEn: "Design professional UI/UX interfaces", tags: ["UI", "UX", "واجهات"], generationType: "design", aiModel: "ChatGPT", category: "design" },
  { title: "مصمم نظام ألوان احترافي", titleEn: "Professional Color System Designer", description: "برومبت لإنشاء أنظمة ألوان متناسقة ومتوافقة مع إرشادات الوصول", descriptionEn: "Create consistent accessible color systems", tags: ["ألوان", "تصميم", "وصول"], generationType: "design", aiModel: "Claude", category: "design" },
  { title: "مصمم خطوط عربية رقمية", titleEn: "Arabic Digital Typography Designer", description: "برومبت لتصميم واختيار خطوط عربية رقمية مناسبة للمشاريع", descriptionEn: "Design and select Arabic digital fonts", tags: ["خطوط", "عربي", "تايبوغرافي"], generationType: "design", aiModel: "ChatGPT", category: "design" },
  { title: "مصمم تجربة مستخدم موبايل", titleEn: "Mobile UX Designer", description: "برومبت لتصميم تجارب مستخدم ممتازة لتطبيقات الجوال", descriptionEn: "Design excellent mobile user experiences", tags: ["موبايل", "UX", "تطبيقات"], generationType: "design", aiModel: "Claude", category: "design" },
  { title: "مصمم نظام تصميم شامل", titleEn: "Design System Creator", description: "برومبت لإنشاء نظام تصميم شامل مع مكونات قابلة لإعادة الاستخدام", descriptionEn: "Create comprehensive design systems with reusable components", tags: ["نظام", "مكونات", "تصميم"], generationType: "design", aiModel: "ChatGPT", category: "design" },
  { title: "مصمم عروض بوربوينت احترافية", titleEn: "Professional PowerPoint Designer", description: "برومبت لتصميم شرائح عرض بوربوينت احترافية وجذابة بصرياً", descriptionEn: "Design professional visually appealing PowerPoint slides", tags: ["بوربوينت", "عروض", "تقديم"], generationType: "design", aiModel: "Gemini", category: "business" },
  { title: "مصمم تغليف منتجات", titleEn: "Product Packaging Designer", description: "برومبت لتصميم تغليف منتجات جذاب ومبتكر يعزز المبيعات", descriptionEn: "Design attractive innovative product packaging", tags: ["تغليف", "منتجات", "تصميم"], generationType: "design", aiModel: "Midjourney", category: "design" },
  { title: "مصمم واجهات داشبورد", titleEn: "Dashboard Interface Designer", description: "برومبت لتصميم لوحات تحكم (داشبورد) احترافية لعرض البيانات", descriptionEn: "Design professional data dashboards", tags: ["داشبورد", "بيانات", "لوحة"], generationType: "design", aiModel: "ChatGPT", category: "design" },
  { title: "مصمم موشن جرافيك", titleEn: "Motion Graphics Designer", description: "برومبت لتصميم مفاهيم موشن جرافيك احترافية للفيديوهات والإعلانات", descriptionEn: "Design professional motion graphics concepts", tags: ["موشن", "جرافيك", "فيديو"], generationType: "design", aiModel: "Claude", category: "design" },
  { title: "مصمم تجربة مستخدم e-commerce", titleEn: "E-commerce UX Designer", description: "برومبت لتصميم تجربة تسوق إلكتروني سلسة تزيد معدل التحويل", descriptionEn: "Design smooth e-commerce shopping experiences", tags: ["تجارة", "UX", "تسوق"], generationType: "design", aiModel: "ChatGPT", category: "design" },
  { title: "مصمم رسوم متحركة للويب", titleEn: "Web Animation Designer", description: "برومبت لتصميم رسوم متحركة وتأثيرات بصرية جذابة للمواقع", descriptionEn: "Design web animations and visual effects", tags: ["رسوم", "متحركة", "ويب"], generationType: "design", aiModel: "Copilot", category: "design" },
  { title: "مصمم هوية بصرية متكاملة", titleEn: "Complete Visual Identity Designer", description: "برومبت لتصميم هوية بصرية متكاملة تشمل الشعار والألوان والخطوط", descriptionEn: "Design complete visual identity with logo, colors, fonts", tags: ["هوية", "بصرية", "علامة"], generationType: "design", aiModel: "Midjourney", category: "design" },
  { title: "مصمم بطاقات أعمال احترافية", titleEn: "Professional Business Card Designer", description: "برومبت لتصميم بطاقات أعمال احترافية ومبتكرة", descriptionEn: "Design professional innovative business cards", tags: ["بطاقات", "أعمال", "تصميم"], generationType: "design", aiModel: "DALL·E", category: "business" },
  { title: "مصمم واجهات SaaS", titleEn: "SaaS Interface Designer", description: "برومبت لتصميم واجهات منصات SaaS سهلة الاستخدام ومتقدمة", descriptionEn: "Design user-friendly advanced SaaS interfaces", tags: ["SaaS", "واجهات", "منصات"], generationType: "design", aiModel: "ChatGPT", category: "design" },
  { title: "مصمم قوالب بريد إلكتروني", titleEn: "Email Template Designer", description: "برومبت لتصميم قوالب بريد إلكتروني احترافية ومتجاوبة", descriptionEn: "Design professional responsive email templates", tags: ["بريد", "قوالب", "تصميم"], generationType: "design", aiModel: "Gemini", category: "marketing" },
  { title: "مصمم خرائط تطبيقات", titleEn: "App Sitemap and Flow Designer", description: "برومبت لتصميم خرائط تدفق وهيكل تطبيقات الويب والموبايل", descriptionEn: "Design app flow maps and information architecture", tags: ["خرائط", "تدفق", "هيكل"], generationType: "design", aiModel: "Claude", category: "design" },
  { title: "مصمم مواد طباعية", titleEn: "Print Material Designer", description: "برومبت لتصميم مواد طباعية احترافية (بروشورات، فلايرات، كتالوجات)", descriptionEn: "Design professional print materials", tags: ["طباعة", "بروشور", "مطبوعات"], generationType: "design", aiModel: "Midjourney", category: "design" },
  { title: "مصمم واجهات ألعاب", titleEn: "Game Interface Designer", description: "برومبت لتصميم واجهات ألعاب فيديو جذابة وسهلة الاستخدام", descriptionEn: "Design attractive user-friendly game interfaces", tags: ["ألعاب", "واجهات", "تصميم"], generationType: "design", aiModel: "ChatGPT", category: "design" },
  { title: "مصمم أيقونات SVG مخصصة", titleEn: "Custom SVG Icon Designer", description: "برومبت لتصميم مجموعات أيقونات SVG مخصصة ومتناسقة", descriptionEn: "Design custom consistent SVG icon sets", tags: ["أيقونات", "SVG", "تصميم"], generationType: "design", aiModel: "Copilot", category: "design" },
  { title: "مصمم تجربة واقع معزز", titleEn: "AR Experience Designer", description: "برومبت لتصميم تجارب واقع معزز مبتكرة للتطبيقات التجارية", descriptionEn: "Design innovative AR experiences for business", tags: ["واقع معزز", "AR", "ابتكار"], generationType: "design", aiModel: "Claude", category: "design" },
];

// ─── Helper Functions ─────────────────────────────────────────────

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function generateFullContent(title: string, genType: string): string {
  if (genType === "image") {
    return `[SUBJECT] in ${title} style, [STYLE] rendering, [COLOR_PALETTE] color palette, highly detailed, professional quality, 8k resolution --ar [ASPECT_RATIO]`;
  }
  return `أنت ${title} محترف. ساعدني في [المهمة] المتعلقة بـ [الموضوع]. الجمهور المستهدف هو [الجمهور]. استخدم أسلوب [النبرة] مع التركيز على [الهدف_الرئيسي]. قدم [عدد_النقاط] نقاط رئيسية مع أمثلة عملية.`;
}

function generateInstructions(genType: string): string {
  if (genType === "image") {
    return "1. استبدل [SUBJECT] بالموضوع المطلوب\n2. اختر [STYLE] المناسب (digital painting, watercolor, 3D render)\n3. حدد [COLOR_PALETTE] (warm, cool, monochrome, vibrant)\n4. اختر [ASPECT_RATIO] (16:9, 1:1, 9:16)";
  }
  return "1. استبدل [المهمة] بالمهمة المحددة\n2. حدد [الموضوع] بدقة\n3. عرّف [الجمهور] المستهدف\n4. اختر [النبرة] المناسبة (رسمي، ودي، حماسي)\n5. حدد [الهدف_الرئيسي] و[عدد_النقاط] المطلوبة";
}

function generateExampleOutputs(title: string): string[] {
  return [
    `مثال 1: نتيجة استخدام ${title} لمشروع تجاري صغير`,
    `مثال 2: نتيجة استخدام ${title} لحملة تسويقية`,
    `مثال 3: نتيجة استخدام ${title} لمحتوى تعليمي`,
    `مثال 4: نتيجة استخدام ${title} لعلامة تجارية ناشئة`,
  ];
}

function generateExamplePrompts(genType: string): Record<string, string>[] {
  if (genType === "image") {
    return [
      { SUBJECT: "مسجد عصري", STYLE: "digital painting", COLOR_PALETTE: "warm", ASPECT_RATIO: "16:9" },
      { SUBJECT: "سوق تقليدي", STYLE: "watercolor", COLOR_PALETTE: "vibrant", ASPECT_RATIO: "1:1" },
      { SUBJECT: "صحراء ذهبية", STYLE: "3D render", COLOR_PALETTE: "warm", ASPECT_RATIO: "16:9" },
      { SUBJECT: "مدينة مستقبلية", STYLE: "concept art", COLOR_PALETTE: "cool", ASPECT_RATIO: "16:9" },
    ];
  }
  return [
    { المهمة: "كتابة مقال", الموضوع: "التسويق الرقمي", الجمهور: "رواد أعمال", النبرة: "احترافي", الهدف_الرئيسي: "زيادة المبيعات", عدد_النقاط: "5" },
    { المهمة: "إنشاء خطة", الموضوع: "إطلاق منتج جديد", الجمهور: "فريق العمل", النبرة: "رسمي", الهدف_الرئيسي: "تنظيم الإطلاق", عدد_النقاط: "7" },
    { المهمة: "تحليل بيانات", الموضوع: "أداء المبيعات", الجمهور: "الإدارة", النبرة: "تحليلي", الهدف_الرئيسي: "تحسين الأداء", عدد_النقاط: "4" },
    { المهمة: "كتابة تقرير", الموضوع: "اتجاهات السوق", الجمهور: "مستثمرين", النبرة: "موضوعي", الهدف_الرئيسي: "اتخاذ قرارات", عدد_النقاط: "6" },
  ];
}

// ─── Seed Function ────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding database with 100 marketplace prompts...");

  // Clear existing seed data
  console.log("Clearing previous seed data...");
  await db.execute(sql`DELETE FROM reviews WHERE prompt_id IN (SELECT id FROM prompts WHERE seller_id LIKE 'seed-seller-%')`);
  await db.execute(sql`DELETE FROM favorites WHERE prompt_id IN (SELECT id FROM prompts WHERE seller_id LIKE 'seed-seller-%')`);
  await db.execute(sql`DELETE FROM order_items WHERE prompt_id IN (SELECT id FROM prompts WHERE seller_id LIKE 'seed-seller-%')`);
  await db.execute(sql`DELETE FROM prompts WHERE seller_id LIKE 'seed-seller-%'`);
  // Also clean up legacy seed prompts without sellerId
  await db.execute(sql`DELETE FROM reviews WHERE prompt_id IN (SELECT id FROM prompts WHERE seller_id IS NULL)`);
  await db.execute(sql`DELETE FROM favorites WHERE prompt_id IN (SELECT id FROM prompts WHERE seller_id IS NULL)`);
  await db.execute(sql`DELETE FROM order_items WHERE prompt_id IN (SELECT id FROM prompts WHERE seller_id IS NULL)`);
  await db.execute(sql`DELETE FROM prompts WHERE seller_id IS NULL`);
  await db.execute(sql`DELETE FROM seller_profiles WHERE user_id LIKE 'seed-seller-%'`);

  // Ensure categories exist
  console.log("Upserting categories...");
  const categoryValues = [
    { slug: "gpt", name: "ChatGPT", nameEn: "ChatGPT", icon: "MessageSquare", count: 234 },
    { slug: "midjourney", name: "Midjourney", nameEn: "Midjourney", icon: "Image", count: 189 },
    { slug: "dalle", name: "DALL·E", nameEn: "DALL·E", icon: "Palette", count: 156 },
    { slug: "business", name: "الأعمال", nameEn: "Business", icon: "Briefcase", count: 298 },
    { slug: "education", name: "التعليم", nameEn: "Education", icon: "GraduationCap", count: 167 },
    { slug: "marketing", name: "التسويق", nameEn: "Marketing", icon: "TrendingUp", count: 203 },
    { slug: "writing", name: "الكتابة", nameEn: "Writing", icon: "PenTool", count: 245 },
    { slug: "design", name: "التصميم", nameEn: "Design", icon: "Sparkles", count: 178 },
  ];
  for (const cat of categoryValues) {
    await db
      .insert(categories)
      .values(cat)
      .onConflictDoUpdate({ target: categories.slug, set: { name: cat.name, nameEn: cat.nameEn, icon: cat.icon, count: cat.count } });
  }

  // Seed seller profiles
  console.log("Upserting 10 seller profiles...");
  for (const seller of sellers) {
    await db
      .insert(sellerProfiles)
      .values({
        userId: seller.id,
        displayName: seller.name,
        avatar: sellerAvatar(seller.name),
        bio: seller.bio,
        country: seller.country,
      })
      .onConflictDoUpdate({
        target: sellerProfiles.userId,
        set: {
          displayName: seller.name,
          avatar: sellerAvatar(seller.name),
          bio: seller.bio,
          country: seller.country,
        },
      });
  }

  // Build 100 prompts
  console.log("Inserting 100 prompts...");
  // Sales ranges per seller to create non-trivial tier distribution:
  // Sellers 0,1 = Gold (high sales), 2,3,4,5 = Silver (mid sales), 6,7,8,9 = Bronze (low sales)
  const salesRanges: [number, number][] = [
    [40, 60],   // seller 0: Gold (high per-prompt sales × 10 prompts = 400-600)
    [35, 55],   // seller 1: Gold
    [12, 18],   // seller 2: Silver (120-180 total)
    [15, 22],   // seller 3: Silver
    [10, 16],   // seller 4: Silver
    [13, 20],   // seller 5: Silver
    [3, 8],     // seller 6: Bronze (<100 total)
    [4, 9],     // seller 7: Bronze
    [2, 6],     // seller 8: Bronze
    [5, 10],    // seller 9: Bronze
  ];

  const reviewRanges: [number, number][] = [
    [15, 30], [20, 35], [8, 15], [10, 18],
    [5, 12], [12, 20], [2, 6], [3, 8], [1, 5], [4, 10],
  ];

  const promptValues = promptData.map((p, i) => {
    const sellerIdx = i % sellers.length;
    const seller = sellers[sellerIdx];
    const createdAt = daysAgo(randomInt(1, 30));

    return {
      title: p.title,
      titleEn: p.titleEn,
      description: p.description,
      descriptionEn: p.descriptionEn,
      price: randomFloat(1.99, 29.99),
      category: p.category,
      aiModel: p.aiModel,
      generationType: p.generationType,
      rating: randomFloat(3.0, 5.0, 1),
      reviewsCount: randomInt(reviewRanges[sellerIdx][0], reviewRanges[sellerIdx][1]),
      sales: randomInt(salesRanges[sellerIdx][0], salesRanges[sellerIdx][1]),
      thumbnail: `https://picsum.photos/seed/${i + 1}/400/300`,
      sellerId: seller.id,
      sellerName: seller.name,
      sellerAvatar: sellerAvatar(seller.name),
      sellerRating: seller.rating,
      tags: p.tags,
      difficulty: difficulties[i % 2],
      samples: [
        `مثال على استخدام ${p.title} في مشروع حقيقي`,
        `نموذج نتائج ${p.title} مع إعدادات مخصصة`,
      ],
      fullContent: generateFullContent(p.title, p.generationType),
      instructions: generateInstructions(p.generationType),
      exampleOutputs: generateExampleOutputs(p.title),
      examplePrompts: generateExamplePrompts(p.generationType),
      status: "approved",
      createdAt,
      updatedAt: createdAt,
    };
  });

  // Insert in batches of 25 to avoid query size limits
  for (let i = 0; i < promptValues.length; i += 25) {
    await db.insert(prompts).values(promptValues.slice(i, i + 25));
  }

  // Seed testimonials (upsert-safe)
  console.log("Upserting testimonials...");
  await db.execute(sql`DELETE FROM testimonials`);
  await db.insert(testimonials).values([
    {
      name: "محمد السعيد",
      role: "مسوق رقمي",
      content: "وجدت البرومبتات التي أحتاجها لتطوير عملي. جودة عالية وأسعار معقولة!",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=%D9%85%D8%AD%D9%85%D8%AF&backgroundColor=ffdfbf",
      rating: 5,
    },
    {
      name: "فاطمة الحربي",
      role: "مصممة جرافيك",
      content: "منصة رائعة للعثور على برومبتات Midjourney المميزة. وفرت علي الكثير من الوقت.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=%D9%81%D8%A7%D8%B7%D9%85%D8%A9&backgroundColor=ffdfbf",
      rating: 5,
    },
    {
      name: "أحمد الخطيب",
      role: "كاتب محتوى",
      content: "بفضل البرومبتات من هذا السوق، أصبحت كتابتي أكثر احترافية وإبداعاً.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=%D8%A3%D8%AD%D9%85%D8%AF&backgroundColor=ffdfbf",
      rating: 5,
    },
  ]);

  console.log("✅ Seeding complete!");
  console.log("  - 8 categories");
  console.log("  - 10 seller profiles (2 Gold, 4 Silver, 4 Bronze)");
  console.log("  - 100 prompts (across 10 sellers, 7 AI models, 5 types)");
  console.log("  - 3 testimonials");

  await client.end();
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
