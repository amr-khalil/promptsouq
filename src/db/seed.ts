import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories } from "./schema/categories";
import { prompts } from "./schema/prompts";
import { reviews } from "./schema/reviews";
import { testimonials } from "./schema/testimonials";
import { sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

async function seed() {
  console.log("🌱 Seeding database...");

  // Truncate all tables (reviews first for FK constraints)
  console.log("Truncating tables...");
  await db.execute(sql`TRUNCATE reviews, favorites, prompts, categories, testimonials RESTART IDENTITY CASCADE`);

  // Seed categories
  console.log("Seeding categories...");
  await db.insert(categories).values([
    { slug: "gpt", name: "ChatGPT", nameEn: "ChatGPT", icon: "MessageSquare", count: 234 },
    { slug: "midjourney", name: "Midjourney", nameEn: "Midjourney", icon: "Image", count: 189 },
    { slug: "dalle", name: "DALL·E", nameEn: "DALL·E", icon: "Palette", count: 156 },
    { slug: "business", name: "الأعمال", nameEn: "Business", icon: "Briefcase", count: 298 },
    { slug: "education", name: "التعليم", nameEn: "Education", icon: "GraduationCap", count: 167 },
    { slug: "marketing", name: "التسويق", nameEn: "Marketing", icon: "TrendingUp", count: 203 },
    { slug: "writing", name: "الكتابة", nameEn: "Writing", icon: "PenTool", count: 245 },
    { slug: "design", name: "التصميم", nameEn: "Design", icon: "Sparkles", count: 178 },
  ]);

  // Seed prompts (UUIDs auto-generated)
  console.log("Seeding prompts...");
  const insertedPrompts = await db.insert(prompts).values([
    {
      title: "برومبت كتابة محتوى تسويقي احترافي",
      titleEn: "Professional Marketing Content Writer",
      description: "برومبت متقدم لكتابة محتوى تسويقي جذاب يزيد من التحويلات والمبيعات. مثالي لكتابة إعلانات، منشورات وسائل التواصل، ورسائل البريد الإلكتروني.",
      descriptionEn: "Advanced prompt for writing engaging marketing content that increases conversions and sales.",
      price: 29.99,
      category: "marketing",
      aiModel: "ChatGPT",
      rating: 4.8,
      reviewsCount: 124,
      sales: 567,
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
      sellerName: "أحمد محمود",
      sellerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      sellerRating: 4.9,
      tags: ["تسويق", "محتوى", "إعلانات", "SEO"],
      difficulty: "متقدم",
      samples: ["مثال على محتوى تسويقي لمنتج تقني...", "مثال على إعلان جذاب لخدمة رقمية..."],
      fullContent: "أنت كاتب محتوى تسويقي محترف. اكتب [نوع_المحتوى] عن [الموضوع] يستهدف [الجمهور_المستهدف]. استخدم أسلوب [النبرة] مع التركيز على [الفائدة_الرئيسية]. يجب أن يتضمن المحتوى عنوان جذاب، مقدمة مشوقة، 3-5 نقاط رئيسية، ودعوة لاتخاذ إجراء.",
      instructions: "1. استبدل [نوع_المحتوى] بالنوع المطلوب (إعلان، منشور، بريد إلكتروني)\n2. حدد [الموضوع] بدقة\n3. عرّف [الجمهور_المستهدف] (مثال: رواد أعمال، طلاب)\n4. اختر [النبرة] المناسبة (رسمي، ودي، حماسي)\n5. حدد [الفائدة_الرئيسية] التي تريد إبرازها",
    },
    {
      title: "مولد صور فنية بأسلوب عربي",
      titleEn: "Arabic Style Artistic Image Generator",
      description: "برومبت لتوليد صور فنية رائعة بأسلوب عربي وإسلامي. مثالي للمصممين والفنانين الذين يبحثون عن إلهام بصري.",
      descriptionEn: "Generate stunning artistic images with Arabic and Islamic style.",
      price: 39.99,
      category: "midjourney",
      aiModel: "Midjourney",
      rating: 4.9,
      reviewsCount: 89,
      sales: 423,
      thumbnail: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800",
      sellerName: "فاطمة الزهراء",
      sellerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      sellerRating: 5.0,
      tags: ["فن", "تصميم", "عربي", "midjourney"],
      difficulty: "مبتدئ",
      samples: ["صورة لزخارف إسلامية معاصرة...", "صورة لمدينة عربية مستقبلية..."],
      fullContent: "[SUBJECT] in traditional Arabic art style, intricate geometric patterns, gold and deep blue color palette, [MEDIUM] rendering, [LIGHTING] lighting, highly detailed, 8k resolution --ar [ASPECT_RATIO] --style raw",
      instructions: "1. استبدل [SUBJECT] بالموضوع المطلوب (مسجد، قصر، سوق)\n2. اختر [MEDIUM] (digital painting, watercolor, oil painting)\n3. حدد [LIGHTING] (golden hour, dramatic, soft ambient)\n4. اختر [ASPECT_RATIO] (16:9 للمناظر، 1:1 للمربع، 9:16 للعمودي)",
    },
    {
      title: "مساعد كتابة الأبحاث الأكاديمية",
      titleEn: "Academic Research Writing Assistant",
      description: "برومبت شامل لمساعدة الطلاب والباحثين في كتابة الأبحاث الأكاديمية بجودة عالية. يساعد في التنظيم، الصياغة، والمراجع.",
      descriptionEn: "Comprehensive prompt for helping students and researchers write high-quality academic papers.",
      price: 24.99,
      category: "education",
      aiModel: "ChatGPT",
      rating: 4.7,
      reviewsCount: 156,
      sales: 789,
      thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800",
      sellerName: "د. محمد العلي",
      sellerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      sellerRating: 4.8,
      tags: ["تعليم", "أبحاث", "أكاديمي", "كتابة"],
      difficulty: "متقدم",
      samples: [],
    },
    {
      title: "مولد شعارات وهوية تجارية",
      titleEn: "Logo and Brand Identity Generator",
      description: "برومبت لإنشاء أفكار شعارات احترافية وهوية تجارية متكاملة. مثالي للمشاريع الناشئة والشركات الصغيرة.",
      descriptionEn: "Generate professional logo ideas and complete brand identity.",
      price: 34.99,
      category: "design",
      aiModel: "DALL·E",
      rating: 4.6,
      reviewsCount: 98,
      sales: 345,
      thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800",
      sellerName: "سارة أحمد",
      sellerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      sellerRating: 4.7,
      tags: ["تصميم", "شعار", "هوية", "برندنق"],
      difficulty: "مبتدئ",
      samples: [],
    },
    {
      title: "استراتيجي خطة عمل شاملة",
      titleEn: "Comprehensive Business Plan Strategist",
      description: "برومبت لإنشاء خطط عمل احترافية وشاملة لأي نوع من المشاريع. يشمل التحليل المالي، السوقي، والتنفيذي.",
      descriptionEn: "Create professional comprehensive business plans for any type of project.",
      price: 49.99,
      category: "business",
      aiModel: "ChatGPT",
      rating: 4.9,
      reviewsCount: 67,
      sales: 234,
      thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
      sellerName: "خالد البشير",
      sellerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      sellerRating: 4.9,
      tags: ["أعمال", "خطة", "استراتيجية", "تمويل"],
      difficulty: "متقدم",
      samples: [],
    },
    {
      title: "كاتب قصص وروايات إبداعية",
      titleEn: "Creative Story and Novel Writer",
      description: "برومبت متخصص في كتابة القصص والروايات الإبداعية بأسلوب أدبي راقي. مثالي للكتاب والمؤلفين.",
      descriptionEn: "Specialized prompt for writing creative stories and novels with refined literary style.",
      price: 27.99,
      category: "writing",
      aiModel: "ChatGPT",
      rating: 4.8,
      reviewsCount: 143,
      sales: 678,
      thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
      sellerName: "ليلى حسن",
      sellerAvatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100",
      sellerRating: 4.8,
      tags: ["كتابة", "قصص", "رواية", "إبداع"],
      difficulty: "مبتدئ",
      samples: [],
    },
    {
      title: "محلل بيانات ومخططات بيانية",
      titleEn: "Data Analyst and Chart Generator",
      description: "برومبت لتحليل البيانات وإنشاء تقارير ومخططات بيانية احترافية. مثالي لمحللي البيانات وأصحاب القرار.",
      descriptionEn: "Analyze data and create professional reports and charts.",
      price: 44.99,
      category: "business",
      aiModel: "ChatGPT",
      rating: 4.7,
      reviewsCount: 76,
      sales: 289,
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
      sellerName: "عمر الشمري",
      sellerAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100",
      sellerRating: 4.8,
      tags: ["بيانات", "تحليل", "تقارير", "أعمال"],
      difficulty: "متقدم",
      samples: [],
    },
    {
      title: "مصمم واجهات مستخدم UI/UX",
      titleEn: "UI/UX Designer Prompt",
      description: "برومبت لتوليد أفكار تصميم واجهات مستخدم احترافية وتجربة مستخدم متميزة. يشمل نصائح وأفضل الممارسات.",
      descriptionEn: "Generate professional UI/UX design ideas with best practices.",
      price: 36.99,
      category: "design",
      aiModel: "ChatGPT",
      rating: 4.6,
      reviewsCount: 92,
      sales: 412,
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
      sellerName: "نور الدين",
      sellerAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100",
      sellerRating: 4.7,
      tags: ["تصميم", "UI", "UX", "واجهات"],
      difficulty: "متقدم",
      samples: [],
    },
  ]).returning({ id: prompts.id });

  const firstPromptId = insertedPrompts[0].id;

  // Seed reviews (all assigned to first prompt)
  console.log("Seeding reviews...");
  await db.insert(reviews).values([
    {
      promptId: firstPromptId,
      userId: "seed-user-1",
      userName: "عبدالله محمد",
      userAvatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100",
      rating: 5,
      date: "2026-02-05",
      comment: "برومبت رائع جداً! ساعدني في تحسين محتوى التسويق بشكل كبير.",
    },
    {
      promptId: firstPromptId,
      userId: "seed-user-2",
      userName: "منى العتيبي",
      userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
      rating: 4,
      date: "2026-02-03",
      comment: "جيد جداً، لكن كنت أتمنى أن يكون هناك المزيد من الأمثلة.",
    },
    {
      promptId: firstPromptId,
      userId: "seed-user-3",
      userName: "سعيد الأحمدي",
      userAvatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100",
      rating: 5,
      date: "2026-01-28",
      comment: "ممتاز! يستحق السعر. البائع محترف ومتعاون.",
    },
  ]);

  // Seed testimonials
  console.log("Seeding testimonials...");
  await db.insert(testimonials).values([
    {
      name: "محمد السعيد",
      role: "مسوق رقمي",
      content: "وجدت البرومبتات التي أحتاجها لتطوير عملي. جودة عالية وأسعار معقولة!",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100",
      rating: 5,
    },
    {
      name: "فاطمة الحربي",
      role: "مصممة جرافيك",
      content: "منصة رائعة للعثور على برومبتات Midjourney المميزة. وفرت علي الكثير من الوقت.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100",
      rating: 5,
    },
    {
      name: "أحمد الخطيب",
      role: "كاتب محتوى",
      content: "بفضل البرومبتات من هذا السوق، أصبحت كتابتي أكثر احترافية وإبداعاً.",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
      rating: 5,
    },
  ]);

  console.log("✅ Seeding complete!");
  console.log("  - 8 categories");
  console.log("  - 8 prompts");
  console.log("  - 3 reviews");
  console.log("  - 3 testimonials");

  await client.end();
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
