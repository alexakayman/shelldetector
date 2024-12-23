import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(isoDateString: string | null | undefined): string {
  if (!isoDateString) return "N/A";

  try {
    const date = new Date(isoDateString);
    return date.toISOString().split("T")[0];
  } catch (error) {
    return "Invalid Date";
  }
}
