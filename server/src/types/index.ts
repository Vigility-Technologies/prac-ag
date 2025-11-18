import { Request } from "express";

export interface User {
  id: string;
  email: string;
  password: string;
  role: "admin" | "member";
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface Bid {
  id: string;
  bid_number: string;
  gem_bid_id: string;
  category_name: string;
  category_id: string;
  quantity: number | null;
  end_date: string | null;
  department: string | null;
  status: "available" | "rejected" | "considered" | "in-progress" | "submitted";
  assigned_to?: string | null;
  assigned_user_name?: string | null;
  due_date?: string | null;
  submitted_doc_link?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "admin" | "member";
  };
}
