import { DEFAULT_STUDENT_IMAGE } from "./constants";

export function getStudentImageUrl(url) {
  if (!url) return DEFAULT_STUDENT_IMAGE;
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}${url.startsWith("/") ? "" : "/"}${url}`;
}