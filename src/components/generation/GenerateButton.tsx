"use client";

import { GenerationDialog } from "@/components/generation/GenerationDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";
import { useState } from "react";

interface GenerateButtonProps {
  promptId: string;
  promptContent: string;
  userOwnsPrompt: boolean;
  creditBalance: number;
}

export function GenerateButton({
  promptId,
  promptContent,
  userOwnsPrompt,
  creditBalance,
}: GenerateButtonProps) {
  const [open, setOpen] = useState(false);

  if (!userOwnsPrompt) return null;

  if (creditBalance === 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button size="lg" className="w-full" disabled>
                <Sparkles className="ml-2 size-5" />
                توليد
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>لا يوجد لديك رصيد كافٍ</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      <Button size="lg" className="w-full" onClick={() => setOpen(true)}>
        <Sparkles className="ml-2 size-5" />
        توليد
      </Button>
      <GenerationDialog
        open={open}
        onOpenChange={setOpen}
        promptId={promptId}
        promptContent={promptContent}
      />
    </>
  );
}
