export interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  isActive?: boolean;
  isBanned?: boolean;
  isAdmin?: boolean;
  role?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface Token {
  tokenId?: string;
  _id?: string;
  id?: string;
  userId?: string;
  user?: User;
  username?: string;
  email?: string;
  createdAt?: string;
  expiresAt?: string;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
    lastUsed?: string;
  };
  [key: string]: unknown;
}

export interface SupportFeedbackItem {
  _id: string;
  userId?: string | null;
  email?: string;
  username?: string;
  message: string;
  origin?: string;
  referer?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface SupportFeedbackPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SupportFeedbackResponse {
  items: SupportFeedbackItem[];
  pagination: SupportFeedbackPagination;
}

export interface SupportFeedbackQuery {
  page?: number;
  limit?: number;
}
