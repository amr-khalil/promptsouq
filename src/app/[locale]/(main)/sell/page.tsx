"use client";

import { InlineSuccess } from "@/components/sell/InlineSuccess";
import { PayoutStep } from "@/components/sell/PayoutStep";
import { PromptDetailsStep } from "@/components/sell/PromptDetailsStep";
import { PromptFileStep } from "@/components/sell/PromptFileStep";
import { StepIndicator } from "@/components/sell/StepIndicator";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  createPromptSubmissionSchema,
  type PromptSubmission,
} from "@/lib/schemas/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const STORAGE_KEY = "promptsouq-sell-draft";

// Field groups for validation (named by content, not step number)
const detailsFields: (keyof PromptSubmission)[] = [
  "generationType",
  "aiModel",
  "title",
  "description",
  "isFree",
  "price",
  "category",
  "difficulty",
  "tags",
];

const contentFields: (keyof PromptSubmission)[] = [
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
  price: 4,
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
  examplePrompts: [{ variables: {} }],
  imageGenerationType: undefined,
};

interface SellFormDraft {
  formData: PromptSubmission;
  currentStep: number;
  paymentActivated: boolean;
  savedAt: string;
}

function loadDraft(): SellFormDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SellFormDraft;
  } catch {
    return null;
  }
}

function saveDraft(
  formData: PromptSubmission,
  currentStep: number,
  paymentActivated: boolean,
) {
  try {
    const draft: SellFormDraft = {
      formData,
      currentStep,
      paymentActivated,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage errors
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export default function SellPage() {
  const { t } = useTranslation("sell");
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedPromptId, setSubmittedPromptId] = useState<string | null>(null);
  const [paymentActivated, setPaymentActivated] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(isEditMode);

  const schema = useMemo(
    () => createPromptSubmissionSchema(t as (key: string) => string),
    [t],
  );

  const form = useForm<PromptSubmission>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const isFree = form.watch("isFree");

  // Paid: 3 steps (Payment → Details → Content). Free: 2 steps (Details → Content).
  const submitStep = isFree ? 2 : 3;

  // Restore draft from localStorage and check payment status on mount (skip in edit mode)
  useEffect(() => {
    if (isEditMode) {
      setPaymentLoading(false);
      return;
    }
    const draft = loadDraft();

    if (isFree) {
      // Free flow: restore draft if available
      if (draft) {
        form.reset(draft.formData);
        setCurrentStep(draft.currentStep);
      }
      setPaymentLoading(false);
      return;
    }

    let cancelled = false;
    async function checkPayment() {
      try {
        const res = await fetch("/api/connect/status");
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        const activated = json.data?.isFullyOnboarded ?? false;
        setPaymentActivated(activated);

        if (draft) {
          form.reset(draft.formData);
          // Restore step, but clamp to step 2+ if payment activated
          setCurrentStep(activated ? Math.max(draft.currentStep, 2) : 1);
        } else if (activated) {
          setCurrentStep(2);
        }
      } catch {
        // Default: not activated, stay on step 1
      } finally {
        if (!cancelled) setPaymentLoading(false);
      }
    }
    checkPayment();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Edit mode: fetch prompt data and populate form
  useEffect(() => {
    if (!isEditMode || !editId) return;
    let cancelled = false;
    async function fetchPromptForEdit() {
      setEditLoading(true);
      try {
        const res = await fetch(`/api/seller/prompts/${editId}`);
        if (!res.ok) {
          toast.error(t("toast.uploadError"));
          return;
        }
        const json = await res.json();
        if (cancelled) return;
        const p = json.data;
        form.reset({
          title: p.title ?? "",
          titleEn: p.titleEn ?? "",
          description: p.description ?? "",
          descriptionEn: p.descriptionEn ?? "",
          isFree: p.isFree ?? p.price === 0,
          price: p.price ?? 0,
          category: p.category ?? "",
          aiModel: p.aiModel ?? "",
          generationType: p.generationType ?? "text",
          modelVersion: p.modelVersion ?? "",
          maxTokens: p.maxTokens ?? null,
          temperature: p.temperature ?? null,
          difficulty: p.difficulty ?? "مبتدئ",
          tags: p.tags ?? [],
          thumbnail: p.thumbnail ?? "",
          fullContent: p.fullContent ?? "",
          instructions: p.instructions ?? "",
          exampleOutputs: p.exampleOutputs?.length ? p.exampleOutputs : ["", "", "", ""],
          examplePrompts: p.examplePrompts?.length ? p.examplePrompts : [{ variables: {} }],
          imageGenerationType: undefined,
        });
        // In edit mode, skip payment step and start on details
        setPaymentActivated(true);
        setPaymentLoading(false);
        setCurrentStep(p.isFree || p.price === 0 ? 1 : 2);
      } catch {
        toast.error(t("toast.connectionError"));
      } finally {
        if (!cancelled) setEditLoading(false);
      }
    }
    fetchPromptForEdit();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, isEditMode]);

  const handlePaymentActivated = useCallback(() => {
    setPaymentActivated(true);
    setCurrentStep(2);
  }, []);

  const submitPrompt = async () => {
    const valid = await form.trigger();
    if (!valid) {
      toast.error(t("toast.reviewFields"));
      return;
    }

    setSubmitting(true);
    try {
      const data = form.getValues();
      const url = isEditMode ? `/api/seller/prompts/${editId}` : "/api/prompts";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? t("toast.uploadError"));
        return;
      }

      if (!isEditMode) clearDraft();
      setSubmittedPromptId(json.data?.id ?? "");
      toast.success(isEditMode ? t("toast.updateSuccess") : t("toast.uploadSuccess"));
    } catch {
      toast.error(t("toast.connectionError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (isFree) {
      // Free flow: Step 1 (Details) → Step 2 (Content/Submit)
      if (currentStep === 1) {
        const valid = await form.trigger(detailsFields);
        if (!valid) return;
        if (!isEditMode) saveDraft(form.getValues(), 2, paymentActivated);
        setCurrentStep(2);
      } else if (currentStep === 2) {
        const valid = await form.trigger(contentFields);
        if (!valid) {
          toast.error(t("toast.reviewFileFields"));
          return;
        }
        await submitPrompt();
      }
    } else {
      // Paid flow: Step 1 (Payment) → Step 2 (Details) → Step 3 (Content/Submit)
      if (currentStep === 1) {
        if (!paymentActivated) return;
        if (!isEditMode) saveDraft(form.getValues(), 2, paymentActivated);
        setCurrentStep(2);
      } else if (currentStep === 2) {
        const valid = await form.trigger(detailsFields);
        if (!valid) return;
        if (form.getValues("price") < 1) {
          form.setError("price", { message: t("toast.minPrice") });
          return;
        }
        if (!isEditMode) saveDraft(form.getValues(), 3, paymentActivated);
        setCurrentStep(3);
      } else if (currentStep === 3) {
        const valid = await form.trigger(contentFields);
        if (!valid) {
          toast.error(t("toast.reviewFileFields"));
          return;
        }
        await submitPrompt();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      if (!isEditMode) saveDraft(form.getValues(), currentStep - 1, paymentActivated);
      setCurrentStep(currentStep - 1);
    }
  };

  // Re-verify payment status when entering step 3 (paid flow)
  const [paymentRecheckLoading, setPaymentRecheckLoading] = useState(false);
  useEffect(() => {
    if (isFree || currentStep !== 3) return;
    let cancelled = false;
    async function recheck() {
      setPaymentRecheckLoading(true);
      try {
        const res = await fetch("/api/connect/status");
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (cancelled) return;
        setPaymentActivated(json.data?.isFullyOnboarded ?? false);
      } catch {
        // Keep existing state
      } finally {
        if (!cancelled) setPaymentRecheckLoading(false);
      }
    }
    recheck();
    return () => { cancelled = true; };
  }, [currentStep, isFree]);

  const handleSellAnother = () => {
    form.reset(defaultValues);
    clearDraft();
    setSubmittedPromptId(null);
    setCurrentStep(isFree ? 1 : paymentActivated ? 2 : 1);
  };

  const handleGoToPaymentSetup = useCallback(() => {
    setCurrentStep(1);
  }, []);

  // Submitted state — show inline success
  if (submittedPromptId !== null) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-lg border bg-card p-6">
          <InlineSuccess
            promptId={submittedPromptId}
            onSellAnother={handleSellAnother}
          />
        </div>
      </div>
    );
  }

  // Determine step content based on flow type
  const renderStepContent = () => {
    if (isFree) {
      if (currentStep === 1) return <PromptDetailsStep form={form} />;
      if (currentStep === 2) return <PromptFileStep form={form} />;
    } else {
      if (currentStep === 2) return <PromptDetailsStep form={form} />;
      if (currentStep === 3) return <PromptFileStep form={form} paymentActivated={paymentActivated} paymentLoading={paymentRecheckLoading} onGoToPaymentSetup={handleGoToPaymentSetup} />;
    }
    return null;
  };

  // Whether current step renders inside the <Form> wrapper
  const isFormStep = isFree ? true : currentStep > 1;

  // Minimum step the user can go back to
  const minStep = isFree ? 1 : 1;

  // Show nav buttons (not on payment step unless activated — PayoutStep has its own CTA)
  const showNav = !paymentLoading && (isFree || currentStep > 1 || paymentActivated);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">
          {isEditMode ? t("header.editTitle") : t("header.title")}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode ? t("header.editSubtitle") : t("header.subtitle")}
        </p>
      </div>

      <div className="mb-8">
        <StepIndicator
          currentStep={currentStep}
          isFree={isFree}
          paymentActivated={paymentActivated}
        />
      </div>

      <div className="rounded-lg border bg-card p-6">
        {/* Payment step (Step 1 for paid) — rendered outside the Form */}
        {!isFree && currentStep === 1 && (
          <PayoutStep onPaymentActivated={handlePaymentActivated} />
        )}

        {/* Form-based steps */}
        {isFormStep && (
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()}>
              {renderStepContent()}
            </form>
          </Form>
        )}

        {/* Navigation buttons */}
        {showNav && (
          <div className="mt-6 flex justify-between">
            {currentStep > minStep ? (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 me-2" />
                {t("nav.back")}
              </Button>
            ) : (
              <div />
            )}

            <Button onClick={handleNext} disabled={submitting || (currentStep === 1 && !isFree && !paymentActivated)}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin me-2" />}
              {currentStep === submitStep ? t("nav.submit") : t("nav.next")}
              {!submitting && currentStep < submitStep && (
                <ArrowRight className="h-4 w-4 ms-2" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
