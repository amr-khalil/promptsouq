import type { categories, freePromptAccess, orders, orderItems, prompts, reviews, sellerProfiles, testimonials } from "@/db/schema";

type OrderRow = typeof orders.$inferSelect;
type OrderItemRow = typeof orderItems.$inferSelect;
type PromptRow = typeof prompts.$inferSelect;
type FreePromptAccessRow = typeof freePromptAccess.$inferSelect;
type SellerProfileRow = typeof sellerProfiles.$inferSelect;
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
    gallery: row.gallery,
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
    isFree: row.price === 0,
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

export function mapFreeAccessRow(row: { freeAccess: FreePromptAccessRow; prompt: PromptRow }) {
  return {
    id: row.prompt.id,
    title: row.prompt.title,
    titleEn: row.prompt.titleEn,
    thumbnail: row.prompt.thumbnail,
    aiModel: row.prompt.aiModel,
    category: row.prompt.category,
    seller: {
      name: row.prompt.sellerName,
      avatar: row.prompt.sellerAvatar,
      rating: row.prompt.sellerRating,
    },
    accessedAt: row.freeAccess.accessedAt.toISOString(),
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

// ─── Seller-Related Mappers ──────────────────────────────────────

export function mapSellerPromptRow(row: PromptRow) {
  return {
    id: row.id,
    title: row.title,
    titleEn: row.titleEn,
    aiModel: row.aiModel,
    generationType: row.generationType,
    status: row.status,
    price: row.price,
    sales: row.sales,
    thumbnail: row.thumbnail,
    rejectionReason: row.rejectionReason ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapAdminPromptRow(row: PromptRow) {
  return {
    id: row.id,
    title: row.title,
    titleEn: row.titleEn,
    description: row.description,
    descriptionEn: row.descriptionEn,
    price: row.price,
    category: row.category,
    aiModel: row.aiModel,
    generationType: row.generationType,
    modelVersion: row.modelVersion,
    maxTokens: row.maxTokens,
    temperature: row.temperature,
    difficulty: row.difficulty,
    tags: row.tags,
    thumbnail: row.thumbnail,
    fullContent: row.fullContent ?? undefined,
    instructions: row.instructions ?? undefined,
    exampleOutputs: row.exampleOutputs,
    examplePrompts: row.examplePrompts,
    seller: {
      id: row.sellerId,
      name: row.sellerName,
      avatar: row.sellerAvatar,
    },
    status: row.status,
    rejectionReason: row.rejectionReason ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapSellerProfileRow(row: SellerProfileRow) {
  return {
    hasAccount: !!row.stripeAccountId,
    chargesEnabled: row.chargesEnabled,
    payoutsEnabled: row.payoutsEnabled,
    detailsSubmitted: row.detailsSubmitted,
    isFullyOnboarded: row.chargesEnabled && row.payoutsEnabled,
  };
}

// ─── Seller Leaderboard & Storefront Mappers ────────────────────

export function computeSellerTier(totalSales: number): string {
  if (totalSales >= 500) return "ذهبي";
  if (totalSales >= 100) return "فضي";
  return "برونزي";
}

interface TopPrompt {
  title: string;
  sales: number;
}

interface SellerLeaderboardRow {
  userId: string;
  displayName: string;
  avatar: string;
  bio: string | null;
  country: string | null;
  totalSales: number;
  totalReviews: number;
  avgRating: number;
  promptCount: number;
  topCategories: string[];
  topPrompts?: TopPrompt[];
}

export function mapSellerLeaderboardRow(row: SellerLeaderboardRow) {
  return {
    userId: row.userId,
    displayName: row.displayName,
    avatar: row.avatar,
    bio: row.bio,
    country: row.country,
    totalSales: row.totalSales,
    totalReviews: row.totalReviews,
    avgRating: Number(Number(row.avgRating).toFixed(1)),
    promptCount: row.promptCount,
    tier: computeSellerTier(row.totalSales),
    topCategories: row.topCategories,
    topPrompts: row.topPrompts ?? [],
  };
}

interface SellerStorefrontRow extends SellerLeaderboardRow {
  totalFavorites: number;
  joinedAt: Date;
}

export function mapSellerStorefrontRow(row: SellerStorefrontRow) {
  return {
    ...mapSellerLeaderboardRow(row),
    totalFavorites: row.totalFavorites,
    joinedAt: row.joinedAt.toISOString(),
  };
}

// ─── Admin & Seller Dashboard Mappers ────────────────────────────

export function mapAdminOrderRow(row: OrderRow & { itemCount: number }) {
  return {
    id: row.id,
    buyerId: row.userId,
    amountTotal: row.amountTotal,
    currency: row.currency,
    status: row.status,
    itemCount: row.itemCount,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapAdminOrderDetailRow(
  order: OrderRow,
  items: (OrderItemRow & { promptTitle: string; sellerId: string | null; sellerName: string })[],
) {
  return {
    id: order.id,
    buyerId: order.userId,
    stripePaymentIntentId: order.stripePaymentIntentId,
    amountTotal: order.amountTotal,
    currency: order.currency,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    items: items.map((item) => ({
      id: item.id,
      promptId: item.promptId,
      promptTitle: item.promptTitle,
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      priceAtPurchase: item.priceAtPurchase,
      commissionRate: item.commissionRate,
      sellerPayoutAmount: item.sellerPayoutAmount,
      sellerStripeAccountId: item.sellerStripeAccountId,
    })),
  };
}

export function mapSellerEarningRow(
  row: {
    orderId: string;
    promptId: string;
    promptTitle: string;
    saleDate: Date;
    priceAtPurchase: number;
    commissionRate: number | null;
    sellerPayoutAmount: number | null;
  },
  payoutsEnabled: boolean,
) {
  const net = row.sellerPayoutAmount ?? 0;
  const commission = row.priceAtPurchase - net;
  return {
    orderId: row.orderId,
    promptId: row.promptId,
    promptTitle: row.promptTitle,
    saleDate: row.saleDate.toISOString(),
    priceAtPurchase: row.priceAtPurchase,
    commissionRate: row.commissionRate ?? 0,
    commissionAmount: commission,
    netAmount: net,
    payoutStatus: payoutsEnabled ? "paid" : "pending",
  };
}

export function mapSellerProfileEditRow(row: SellerProfileRow) {
  return {
    userId: row.userId,
    displayName: row.displayName,
    avatar: row.avatar,
    bio: row.bio,
    country: row.country,
    stripeAccountId: row.stripeAccountId,
    chargesEnabled: row.chargesEnabled,
    payoutsEnabled: row.payoutsEnabled,
    detailsSubmitted: row.detailsSubmitted,
    totalEarnings: row.totalEarnings,
    totalSales: row.totalSales,
    createdAt: row.createdAt.toISOString(),
  };
}
