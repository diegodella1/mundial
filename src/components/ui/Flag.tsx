"use client";
import { codeToFlag } from "@/lib/flags";

interface FlagProps {
  code: string; // FIFA 3-letter code
  size?: "sm" | "md" | "lg" | "xl";
}

// Size classes
const SIZES = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-4xl",
};

export default function Flag({ code, size = "md" }: FlagProps) {
  const flag = codeToFlag(code);
  return (
    <span
      className={`${SIZES[size]} leading-none inline-flex items-center`}
      role="img"
      aria-label={code}
    >
      {flag}
    </span>
  );
}
