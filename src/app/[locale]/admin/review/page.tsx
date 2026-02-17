import { db } from "@/db";
import { prompts } from "@/db/schema";
import { checkAdmin } from "@/lib/auth";
import { asc, count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AdminReviewList } from "./AdminReviewList";

export default async function AdminReviewPage() {
  const { isAdmin, userId } = await checkAdmin();
  if (!userId || !isAdmin) {
    redirect("/");
  }

  const pendingPrompts = await db
    .select({
      id: prompts.id,
      title: prompts.title,
      titleEn: prompts.titleEn,
      aiModel: prompts.aiModel,
      generationType: prompts.generationType,
      price: prompts.price,
      sellerName: prompts.sellerName,
      sellerId: prompts.sellerId,
      thumbnail: prompts.thumbnail,
      status: prompts.status,
      createdAt: prompts.createdAt,
    })
    .from(prompts)
    .where(eq(prompts.status, "pending"))
    .orderBy(asc(prompts.createdAt))
    .limit(50);

  const [countRow] = await db
    .select({ count: count() })
    .from(prompts)
    .where(eq(prompts.status, "pending"));

  const serialized = pendingPrompts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">مراجعة البرومبتات</h1>
        <p className="text-muted-foreground">
          {countRow.count} برومبت في انتظار المراجعة
        </p>
      </div>

      <AdminReviewList initialPrompts={serialized} />
    </div>
  );
}
