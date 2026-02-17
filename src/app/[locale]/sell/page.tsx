"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ConfirmationStep } from "@/components/sell/ConfirmationStep";
import { PayoutStep } from "@/components/sell/PayoutStep";
import { PromptDetailsStep } from "@/components/sell/PromptDetailsStep";
import { PromptFileStep } from "@/components/sell/PromptFileStep";
import { StepIndicator } from "@/components/sell/StepIndicator";
import { promptSubmissionSchema, type PromptSubmission } from "@/lib/schemas/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const STORAGE_KEY = "promptsouq-sell-draft";

const step1Fields: (keyof PromptSubmission)[] = [
  "generationType",
  "aiModel",
  "title",
  "description",
  "isFree",
  "price",
  "category",
  "difficulty",
  "tags",
  "thumbnail",
];

const step2Fields: (keyof PromptSubmission)[] = [
  "fullContent",
  "exampleOutputs",
  "examplePrompts",
];

const defaultValues: PromptSubmission = {
  title: "",
  titleEn: "",
  description: "",
  descriptionEn: "",
  isFree: false,
  price: 0,
  category: "",
  aiModel: "",
  generationType: "text",
  modelVersion: "",
  maxTokens: null,
  temperature: null,
  difficulty: "مبتدئ",
  tags: [],
  thumbnail: "",
  fullContent: "",
  instructions: "",
  exampleOutputs: ["", "", "", ""],
  examplePrompts: [{}, {}, {}, {}],
};

function loadDraft(): PromptSubmission | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PromptSubmission;
  } catch {
    return null;
  }
}

function saveDraft(data: PromptSubmission) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export default function SellPage() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<PromptSubmission>({
    resolver: zodResolver(promptSubmissionSchema),
    defaultValues,
  });

  // Restore draft and step when returning from Stripe onboarding (paid flow only)
  useEffect(() => {
    const step = searchParams.get("step");
    if (step === "3") {
      const draft = loadDraft();
      if (draft) {
        form.reset(draft);
      }
      setCurrentStep(3);
    }
  }, [searchParams, form]);

  // Save draft whenever moving to step 3 (before potential Stripe redirect)
  const saveCurrentDraft = useCallback(() => {
    saveDraft(form.getValues());
  }, [form]);

  const isFree = form.watch("isFree");

  // For free prompts: step 1 → step 2 → submit → confirmation (step 3)
  // For paid prompts: step 1 → step 2 → step 3 (payout) → submit → confirmation (step 4)
  const confirmationStep = isFree ? 3 : 4;
  const submitStep = isFree ? 2 : 3;

  const submitPrompt = async () => {
    const valid = await form.trigger();
    if (!valid) {
      toast.error("يرجى مراجعة جميع الحقول المطلوبة");
      return;
    }

    setSubmitting(true);
    try {
      const data = form.getValues();
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error?.message ?? "حدث خطأ في رفع البرومبت");
        return;
      }

      clearDraft();
      setCurrentStep(confirmationStep);
      toast.success("تم رفع البرومبت بنجاح!");
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const valid = await form.trigger(step1Fields);
      if (!valid) return;
      // Manual price check for paid prompts (superRefine doesn't run on partial trigger)
      if (!form.getValues("isFree") && form.getValues("price") < 1.99) {
        form.setError("price", { message: "الحد الأدنى للسعر 1.99$" });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const valid = await form.trigger(step2Fields);
      if (!valid) {
        toast.error("يرجى مراجعة حقول ملف البرومبت");
        return;
      }
      if (isFree) {
        // Free: submit directly after step 2
        await submitPrompt();
      } else {
        saveCurrentDraft();
        setCurrentStep(3);
      }
    } else if (currentStep === 3 && !isFree) {
      // Paid: submit after payout step
      await submitPrompt();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    form.reset(defaultValues);
    clearDraft();
    setCurrentStep(1);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">بيع برومبت</h1>
        <p className="text-muted-foreground">
          شارك إبداعاتك وابدأ في كسب المال من البرومبتات الخاصة بك
        </p>
      </div>

      <div className="mb-8">
        <StepIndicator currentStep={currentStep} isFree={isFree} />
      </div>

      <div className="rounded-lg border bg-card p-6">
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()}>
            {currentStep === 1 && <PromptDetailsStep form={form} />}
            {currentStep === 2 && <PromptFileStep form={form} />}
          </form>
        </Form>

        {currentStep === 3 && !isFree && <PayoutStep />}
        {currentStep === confirmationStep && <ConfirmationStep onReset={handleReset} />}

        {currentStep < confirmationStep && (
          <div className="mt-6 flex justify-between">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                <ArrowRight className="h-4 w-4 me-2" />
                رجوع
              </Button>
            ) : (
              <div />
            )}

            <Button onClick={handleNext} disabled={submitting}>
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              )}
              {currentStep === submitStep ? "رفع البرومبت" : "التالي"}
              {!submitting && currentStep < submitStep && (
                <ArrowLeft className="h-4 w-4 ms-2" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
