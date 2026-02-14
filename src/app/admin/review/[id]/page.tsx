import { db } from "@/db";
import { prompts } from "@/db/schema";
import { checkAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { AdminReviewActions } from "./AdminReviewActions";

export default async function AdminReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { isAdmin, userId } = await checkAdmin();
  if (!userId || !isAdmin) {
    redirect("/");
  }

  const { id } = await params;

  const rows = await db
    .select()
    .from(prompts)
    .where(eq(prompts.id, id))
    .limit(1);

  if (rows.length === 0) {
    notFound();
  }

  const prompt = rows[0];
  const examplePrompts = (prompt.examplePrompts ?? []) as Record<string, string>[];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">مراجعة البرومبت</h1>
        <p className="text-muted-foreground">
          تقديم بواسطة {prompt.sellerName} &#183;{" "}
          {prompt.createdAt.toLocaleDateString("ar", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Info */}
        <section className="rounded-lg border p-6 space-y-4">
          <h2 className="text-xl font-semibold">معلومات أساسية</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <span className="text-sm text-muted-foreground">العنوان</span>
              <p className="font-medium">{prompt.title}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">العنوان بالإنجليزية</span>
              <p className="font-medium" dir="ltr">{prompt.titleEn}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">السعر</span>
              <p className="font-medium">${prompt.price}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">التصنيف</span>
              <p className="font-medium">{prompt.category}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">نموذج AI</span>
              <p className="font-medium">{prompt.aiModel}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">نوع المحتوى</span>
              <p className="font-medium">{prompt.generationType ?? "—"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">مستوى الصعوبة</span>
              <p className="font-medium">{prompt.difficulty}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">إصدار النموذج</span>
              <p className="font-medium">{prompt.modelVersion ?? "—"}</p>
            </div>
          </div>

          <div>
            <span className="text-sm text-muted-foreground">الوصف</span>
            <p className="mt-1">{prompt.description}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">الوصف بالإنجليزية</span>
            <p className="mt-1" dir="ltr">{prompt.descriptionEn}</p>
          </div>

          {prompt.tags.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">الوسوم</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {prompt.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Prompt Template */}
        <section className="rounded-lg border p-6 space-y-4">
          <h2 className="text-xl font-semibold">قالب البرومبت</h2>
          <pre
            className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap overflow-x-auto"
            dir="ltr"
          >
            {prompt.fullContent}
          </pre>

          {prompt.maxTokens && (
            <p className="text-sm text-muted-foreground">
              الحد الأقصى للتوكنز: {prompt.maxTokens}
            </p>
          )}
          {prompt.temperature !== null && (
            <p className="text-sm text-muted-foreground">
              الحرارة: {prompt.temperature}
            </p>
          )}
        </section>

        {/* Example Outputs */}
        {prompt.exampleOutputs && prompt.exampleOutputs.length > 0 && (
          <section className="rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">أمثلة المخرجات</h2>
            {prompt.exampleOutputs.map((output, i) => (
              <div key={i} className="rounded-md bg-muted p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  مثال {i + 1}
                </p>
                <p className="text-sm whitespace-pre-wrap" dir="ltr">
                  {output}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Example Prompts */}
        {examplePrompts.length > 0 && (
          <section className="rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">أمثلة المتغيرات</h2>
            {examplePrompts.map((vars, i) => (
              <div key={i} className="rounded-md bg-muted p-4">
                <p className="text-xs text-muted-foreground mb-2">
                  مثال {i + 1}
                </p>
                <div className="space-y-1">
                  {Object.entries(vars).map(([key, value]) => (
                    <p key={key} className="text-sm">
                      <span className="font-medium text-primary">[{key}]</span>
                      {" → "}
                      <span>{value}</span>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Instructions */}
        {prompt.instructions && (
          <section className="rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">تعليمات الاستخدام</h2>
            <p className="whitespace-pre-wrap">{prompt.instructions}</p>
          </section>
        )}

        {/* Admin Actions: Edit, Delete, Review */}
        <AdminReviewActions
          promptId={prompt.id}
          currentStatus={prompt.status}
          initialData={{
            title: prompt.title,
            description: prompt.description,
            price: prompt.price,
            category: prompt.category,
            aiModel: prompt.aiModel,
            difficulty: prompt.difficulty,
            tags: prompt.tags,
          }}
        />
      </div>
    </div>
  );
}
