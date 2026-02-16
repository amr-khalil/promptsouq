/**
 * Mock AI generation service.
 *
 * This module exposes a clean async interface so it can be swapped for real
 * AI API calls (OpenAI, Anthropic, Stability AI, etc.) without touching
 * consuming code.
 */

export type GenerationParams = {
  type: "text" | "image";
  model: string;
  prompt: string;
};

export type GenerationResult = {
  resultText: string | null;
  resultImageUrl: string | null;
};

export async function generateContent(
  params: GenerationParams,
): Promise<GenerationResult> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 500));

  if (params.type === "text") {
    const snippet = params.prompt.slice(0, 100);

    const resultText = [
      `هذا نص تجريبي تم توليده بواسطة نموذج ${params.model}. المحتوى المولد يعتمد على البرومبت المقدم: "${snippet}..."`,
      "",
      "يُعد الذكاء الاصطناعي التوليدي من أبرز التطورات التقنية في العصر الحديث، حيث يتيح للمستخدمين إنشاء محتوى متنوع يشمل النصوص والصور والأكواد البرمجية بناءً على توجيهات بسيطة. تعتمد هذه النماذج على بنى عصبية متقدمة تمت تدريبها على كميات هائلة من البيانات لفهم السياق وتوليد استجابات دقيقة.",
      "",
      "من خلال تحسين صياغة البرومبت، يمكن الحصول على نتائج أكثر دقة وملاءمة للاحتياجات المحددة. يُنصح بتقديم تعليمات واضحة ومحددة، وتضمين أمثلة عند الحاجة، وتحديد الأسلوب والنبرة المطلوبة للمخرجات النهائية.",
      "",
      "تتعدد مجالات استخدام البرومبتات لتشمل كتابة المقالات، وتلخيص المستندات، وترجمة النصوص، وتحليل البيانات، وإنشاء المحتوى التسويقي، وتطوير الأكواد البرمجية. كل مجال يتطلب أساليب مختلفة في صياغة التوجيهات للحصول على أفضل النتائج الممكنة.",
    ].join("\n");

    return { resultText, resultImageUrl: null };
  }

  // Image generation
  return {
    resultText: null,
    resultImageUrl:
      "https://placehold.co/1024x1024/1a1a2e/e2e8f0?text=AI+Generated+Image",
  };
}
