import type { categories, prompts, reviews, testimonials } from "@/db/schema";

type PromptRow = typeof prompts.$inferSelect;
type CategoryRow = typeof categories.$inferSelect;
type ReviewRow = typeof reviews.$inferSelect;
type TestimonialRow = typeof testimonials.$inferSelect;

interface PurchaseRow {
  prompt: PromptRow;
  purchasedAt: Date;
  priceAtPurchase: number;
}

export function mapPromptRow(row: PromptRow) {
  return {
    id: row.id,
    title: row.title,
    titleEn: row.titleEn,
    description: row.description,
    descriptionEn: row.descriptionEn,
    price: row.price,
    category: row.category,
    aiModel: row.aiModel,
    rating: row.rating,
    reviews: row.reviewsCount,
    sales: row.sales,
    thumbnail: row.thumbnail,
    seller: {
      name: row.sellerName,
      avatar: row.sellerAvatar,
      rating: row.sellerRating,
    },
    tags: row.tags,
    difficulty: row.difficulty,
    samples: row.samples,
    fullContent: row.fullContent ?? undefined,
    instructions: row.instructions ?? undefined,
  };
}

export function mapCategoryRow(row: CategoryRow) {
  return {
    id: row.slug,
    name: row.name,
    nameEn: row.nameEn,
    icon: row.icon,
    count: row.count,
  };
}

export function mapPurchaseRow(row: PurchaseRow) {
  return {
    id: row.prompt.id,
    title: row.prompt.title,
    titleEn: row.prompt.titleEn,
    thumbnail: row.prompt.thumbnail,
    aiModel: row.prompt.aiModel,
    price: row.prompt.price,
    category: row.prompt.category,
    seller: {
      name: row.prompt.sellerName,
      avatar: row.prompt.sellerAvatar,
    },
    purchasedAt: row.purchasedAt.toISOString(),
    priceAtPurchase: row.priceAtPurchase,
  };
}

export function mapReviewRow(row: ReviewRow) {
  return {
    id: row.id.toString(),
    promptId: row.promptId,
    userId: row.userId,
    userName: row.userName,
    userAvatar: row.userAvatar,
    rating: row.rating,
    date: row.date,
    comment: row.comment,
  };
}

export function mapTestimonialRow(row: TestimonialRow) {
  return {
    id: row.id.toString(),
    name: row.name,
    role: row.role,
    content: row.content,
    avatar: row.avatar,
    rating: row.rating,
  };
}
