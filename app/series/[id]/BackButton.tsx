"use client"

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
    >
      <ChevronLeft className="w-4 h-4 mr-2" />
      Back
    </button>
  );
} 