"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PromptSubmission } from "@/lib/schemas/api";
import { useEffect, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";

interface PromptFileStepProps {
  form: UseFormReturn<PromptSubmission>;
}

function extractVariables(template: string): string[] {
  const matches = template.match(/\[([^\]]+)\]/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.slice(1, -1)))];
}

export function PromptFileStep({ form }: PromptFileStepProps) {
  const fullContent = form.watch("fullContent");
  const variables = useMemo(() => extractVariables(fullContent ?? ""), [fullContent]);
  const tokenCount = (fullContent ?? "").length;

  // Initialize examplePrompts entries when variables change
  useEffect(() => {
    if (variables.length === 0) return;
    const current = form.getValues("examplePrompts");
    for (let i = 0; i < 4; i++) {
      for (const varName of variables) {
        if (current[i]?.[varName] === undefined) {
          form.setValue(`examplePrompts.${i}.${varName}`, "");
        }
      }
    }
  }, [variables, form]);

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="fullContent"
        render={({ field }) => (
          <FormItem>
            <FormLabel>قالب البرومبت</FormLabel>
            <FormControl>
              <Textarea
                placeholder="ضع أي متغيرات بين [أقواس مربعة]..."
                rows={8}
                dir="ltr"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                يجب أن يحتوي على متغير واحد على الأقل بين [أقواس مربعة]
              </span>
              <span dir="ltr">{tokenCount}/8,192 tokens</span>
            </div>
            {variables.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {variables.map((v) => (
                  <span
                    key={v}
                    className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary"
                  >
                    [{v}]
                  </span>
                ))}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="modelVersion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>إصدار النموذج</FormLabel>
              <FormControl>
                <Input
                  placeholder="مثال: 4.6 Opus"
                  dir="ltr"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxTokens"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الحد الأقصى للتوكنز</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={128000}
                  placeholder="4096"
                  dir="ltr"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val ? parseInt(val, 10) : null);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="temperature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الحرارة (Temperature)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  placeholder="0"
                  dir="ltr"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val ? parseFloat(val) : null);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <FormLabel className="text-base">أمثلة المخرجات (4 أمثلة)</FormLabel>
        {[0, 1, 2, 3].map((index) => (
          <FormField
            key={index}
            control={form.control}
            name={`exampleOutputs.${index}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">
                  مثال {index + 1}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="الصق مخرجات البرومبت هنا..."
                    rows={3}
                    dir="ltr"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>

      <div className="space-y-4">
        <FormLabel className="text-base">
          أمثلة البرومبت (قيم المتغيرات لكل مثال)
        </FormLabel>
        {[0, 1, 2, 3].map((exIndex) => (
          <div
            key={exIndex}
            className="rounded-lg border p-4 space-y-3"
          >
            <p className="text-sm font-medium text-muted-foreground">
              مثال {exIndex + 1}
            </p>
            {variables.length > 0 ? (
              variables.map((varName) => (
                <FormField
                  key={`${exIndex}-${varName}`}
                  control={form.control}
                  name={`examplePrompts.${exIndex}.${varName}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">[{varName}]</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`قيمة ${varName}...`}
                          {...field}
                          value={(field.value as string) ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                أضف متغيرات [بين أقواس] في القالب أعلاه أولاً
              </p>
            )}
          </div>
        ))}
      </div>

      <FormField
        control={form.control}
        name="instructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>تعليمات الاستخدام</FormLabel>
            <FormControl>
              <Textarea
                placeholder="نصائح أو أمثلة إضافية للمشتري حول كيفية استخدام البرومبت..."
                rows={4}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
