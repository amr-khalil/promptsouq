import type { categories, prompts, reviews, testimonials } from "@/db/schema";

type PromptRow = typeof prompts.$inferSelect;
type CategoryRow = typeof categories.$inferSelect;
type ReviewRow = typeof reviews.$inferSelect;
type TestimonialRow = typeof testimonials.$inferSelect;

export function mapPromptRow(row: PromptRow) {
  return {
    id: row.id.toString(),
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

export function mapReviewRow(row: ReviewRow) {
  return {
    id: row.id.toString(),
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
