// src/lib/categories.ts
export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  FOOD:    { bg: "#C8F000", text: "#000000" }, 
  BEAUTY:  { bg: "#FF70CD", text: "#000000" },
  TECH:    { bg: "#2563FF", text: "#ffffff" }, 
  HOME:    { bg: "#FF9500", text: "#000000" }, 
  FASHION: { bg: "#B39DDB", text: "#000000" }, 
  SPORT:   { bg: "#26C6A6", text: "#000000" },
  OTHER:   { bg: "#f5f0e8", text: "#000000" }, 
};

export function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.OTHER;
}