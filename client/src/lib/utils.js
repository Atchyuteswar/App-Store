import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getFileUrl(filePath) {
  if (!filePath) return "";
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return `${base}/uploads/${filePath}`;
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
