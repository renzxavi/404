// src/types/index.ts
export type Category = "FOOD" | "TECH" | "BEAUTY" | "FASHION" | "HOME" | "SPORT" | "OTHER";
export type ProductStatus = 1 | 2;

export interface Product {
  id: string;
  name: string;
  description: string;
  category: Category;
  country: string;
  status: ProductStatus;
  image_url?: string;
  image_color: string;
  demand: number;
  target_market: string;
  created_by?: string;
  created_at: string;
}

export interface Vote {
  id: string;
  product_id: string;
  user_id: string | null;
  session_id: string;
  value: 1 | -1 | 2; // 1=quiero, -1=paso, 2=lo necesito
  weight: number;
}

export interface Comment {
  id: string;
  product_id: string;
  user_id: string;
  body: string;
  summary?: string;
  tags: string[];
  phase: ProductStatus;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  country: string;
  role: "user" | "admin";
  created_at: string;
}