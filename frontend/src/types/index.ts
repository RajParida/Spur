// Core API types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
}

export interface AuthResponse {
  jwt: string;
  user: AuthUser;
}

// Status types
export type StatusType = 'free_now' | 'free_tonight' | 'already_here';
export type EnergyLevel = 'low' | 'high';

export interface Status {
  id: string;
  userId: string;
  type: StatusType;
  energyLevel: EnergyLevel;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  location?: string;
  emoji?: string;
  contextText?: string;
}

export interface CreateStatusRequest {
  type: StatusType;
  energyLevel: EnergyLevel;
  durationMinutes: 60 | 180 | 720; // 1hr, 3hr, 12hr
  location?: string;
  emoji?: string;
  contextText?: string;
}

// User & Friendship types
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  location?: { city: string; country: string };
  createdAt: string;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export interface Friendship {
  id: string;
  userIdA: string;
  userIdB: string;
  status: FriendshipStatus;
  createdAt: string;
  acceptedAt?: string;
}

// Chat types
export interface Chat {
  id: string;
  userIdA: string;
  userIdB: string;
  friendId?: string; // Convenience for current user
  friendName?: string;
  friendAvatar?: string;
  triggeredByStatusId?: string;
  expiresAt: string;
  createdAt: string;
  lastMessageAt?: string;
  lastMessage?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  mediaUrls?: string[];
}

export interface SendMessageRequest {
  content: string;
  mediaUrls?: string[];
}

// Event types
export interface Event {
  id: string;
  creatorId: string;
  creatorName?: string;
  creatorAvatar?: string;
  title: string;
  location: string;
  spotsAvailable: number;
  spotsClaimed: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  hasClaimed?: boolean;
}

export interface CreateEventRequest {
  title: string;
  location: string;
  spotsAvailable: number;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
  relatedUserId?: string;
  relatedEntityId?: string;
}

// UI State types
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
