import { apiClient } from './apiClient';
import { Status, CreateStatusRequest, ApiResponse } from '@/types';

class StatusService {
  /**
   * Create a new status
   */
  async createStatus(request: CreateStatusRequest): Promise<Status> {
    const response = await apiClient.post<Status>('/statuses', request);
    return response;
  }

  /**
   * Get current user's active status
   */
  async getActiveStatus(): Promise<Status | null> {
    try {
      const response = await apiClient.get<Status>('/statuses/me');
      return response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get visible friend statuses (double-blind feed)
   */
  async getFeed(): Promise<Status[]> {
    const response = await apiClient.get<Status[]>('/statuses/feed');
    return response;
  }

  /**
   * Get all statuses for a specific user
   */
  async getStatusesByUser(userId: string): Promise<Status[]> {
    const response = await apiClient.get<Status[]>(`/statuses/user/${userId}`);
    return response;
  }

  /**
   * Expire a status early
   */
  async expireStatus(statusId: string): Promise<void> {
    await apiClient.delete(`/statuses/${statusId}`);
  }

  /**
   * Get status details
   */
  async getStatus(statusId: string): Promise<Status> {
    const response = await apiClient.get<Status>(`/statuses/${statusId}`);
    return response;
  }
}

export const statusService = new StatusService();
