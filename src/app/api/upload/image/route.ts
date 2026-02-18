import { checkAuth } from "@/lib/auth";
import { getStorageClient } from "@/lib/supabase-storage";
import { NextRequest, NextResponse } from "next/server";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  const userId = await checkAuth();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Validation failed", details: { fieldErrors: { file: ["File is required"] } } },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Validation failed", details: { fieldErrors: { file: ["File exceeds 10 MB limit"] } } },
      { status: 400 },
    );
  }

  if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json(
      { error: "Validation failed", details: { fieldErrors: { file: ["File type not supported. Accepted: JPEG, PNG, GIF, WebP"] } } },
      { status: 400 },
    );
  }

  const ext = MIME_TO_EXT[file.type] ?? "bin";
  const path = `${userId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = getStorageClient();
    const { error } = await supabase.storage
      .from("prompt-images")
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error("[upload/image] Supabase storage error:", error);
      return NextResponse.json(
        { error: "Upload failed", message: error.message },
        { status: 500 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const url = `${supabaseUrl}/storage/v1/object/public/prompt-images/${path}`;

    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error("[upload/image] Unexpected error:", err);
    return NextResponse.json(
      { error: "Upload failed", message: err instanceof Error ? err.message : "Failed to upload image to storage" },
      { status: 500 },
    );
  }
}
