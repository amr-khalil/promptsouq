import { Loader2 } from "lucide-react";

export default function ResetPasswordLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}
