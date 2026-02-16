"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useMemo, useState } from "react";

interface PromptEditorProps {
  initialPrompt: string;
  onChange: (value: string) => void;
}

export function PromptEditor({ initialPrompt, onChange }: PromptEditorProps) {
  // Parse variable names from the initial prompt
  const variableNames = useMemo(() => {
    const matches = initialPrompt.match(/\[([^\]]+)\]/g);
    if (!matches) return [];
    const names = matches.map((m) => m.slice(1, -1));
    return [...new Set(names)];
  }, [initialPrompt]);

  // Track previous initialPrompt to detect changes during render
  const [prevPrompt, setPrevPrompt] = useState(initialPrompt);

  // Track variable values
  const [variableValues, setVariableValues] = useState<
    Record<string, string>
  >(() => Object.fromEntries(variableNames.map((name) => [name, ""])));

  // Track the current textarea text
  const [text, setText] = useState(initialPrompt);

  // Reset state when initialPrompt changes (during render, no effect needed)
  if (prevPrompt !== initialPrompt) {
    setPrevPrompt(initialPrompt);
    setVariableValues(
      Object.fromEntries(variableNames.map((name) => [name, ""]))
    );
    setText(initialPrompt);
  }

  // Reconstruct text from initial prompt template + variable values
  const reconstructText = useCallback(
    (values: Record<string, string>) => {
      let result = initialPrompt;
      for (const [name, value] of Object.entries(values)) {
        if (value) {
          result = result.replaceAll(`[${name}]`, value);
        }
      }
      return result;
    },
    [initialPrompt]
  );

  // When a variable value changes, update text and notify parent
  const handleVariableChange = useCallback(
    (name: string, value: string) => {
      const newValues = { ...variableValues, [name]: value };
      setVariableValues(newValues);
      const newText = reconstructText(newValues);
      setText(newText);
      onChange(newText);
    },
    [variableValues, reconstructText, onChange]
  );

  // When the textarea is edited directly
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setText(newText);
      onChange(newText);
    },
    [onChange]
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Variable inputs section */}
      {variableNames.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-right">المتغيرات:</p>
          <div className="flex flex-wrap gap-2">
            {variableNames.map((name) => (
              <div
                key={name}
                className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2"
              >
                <Badge variant="secondary">{name}</Badge>
                <Input
                  dir="rtl"
                  className="h-7 w-40 text-sm"
                  placeholder={`أدخل ${name}`}
                  value={variableValues[name] ?? ""}
                  onChange={(e) => handleVariableChange(name, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main textarea */}
      <Textarea
        dir="rtl"
        className="min-h-[200px] font-mono text-sm text-right"
        value={text}
        onChange={handleTextChange}
      />
    </div>
  );
}
