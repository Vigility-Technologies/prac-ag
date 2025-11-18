import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
  }) => api.post("/api/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
  logout: () => api.post("/api/auth/logout"),
  getMe: () => api.get("/api/auth/me"),
};

// Users API
export const usersAPI = {
  getMembers: () => api.get("/api/users/members"),
  bulkCreateMembers: (data: {
    members: Array<{ full_name: string; email: string }>;
    defaultPassword?: string;
  }) => api.post("/api/users/members/bulk", data),
};

// Bids API
export const bidsAPI = {
  fetchBids: (data: { csrfToken: string; endDate?: string }) =>
    api.post("/api/bids/fetch", data),
  getCategories: () => api.get("/api/bids/categories"),
  getAvailableBids: (category?: string) =>
    api.get("/api/bids/available", { params: { category } }),
  getMyBids: (category?: string) =>
    api.get("/api/bids/my-bids", { params: { category } }),
  assignBid: (
    bidId: string,
    data: { assignedTo: string; assignedUserName: string; dueDate?: string }
  ) => api.post(`/api/bids/${bidId}/assign`, data),
  updateBidStatus: (
    bidId: string,
    data: { status: string; submittedDocLink?: string }
  ) => api.patch(`/api/bids/${bidId}/status`, data),
  getStats: (category?: string) =>
    api.get("/api/bids/stats", { params: { category } }),
  downloadDocument: (gemBidId: string) =>
    api.get(`/api/bids/document/${gemBidId}`, { responseType: "blob" }),
};

export default api;
