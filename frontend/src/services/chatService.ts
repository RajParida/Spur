import { apiClient } from './apiClient';
import { Chat, Message, SendMessageRequest } from '@/types';

class ChatService {
  /**
   * Create or get existing chat with a friend
   */
  async getOrCreateChat(friendId: string, statusId?: string): Promise<Chat> {
    const response = await apiClient.post<Chat>('/chats', {
      friendId,
      statusId,
    });
    return response;
  }

  /**
   * Get all active chats for current user
   */
  async getChats(): Promise<Chat[]> {
    const response = await apiClient.get<Chat[]>('/chats');
    return response;
  }

  /**
   * Get messages for a specific chat
   */
  async getMessages(chatId: string, limit = 50): Promise<Message[]> {
    const response = await apiClient.get<Message[]>(
      `/chats/${chatId}/messages?limit=${limit}`
    );
    return response;
  }

  /**
   * Send a message
   */
  async sendMessage(chatId: string, request: SendMessageRequest): Promise<Message> {
    const response = await apiClient.post<Message>(
      `/chats/${chatId}/messages`,
      request
    );
    return response;
  }

  /**
   * Get chat details
   */
  async getChat(chatId: string): Promise<Chat> {
    const response = await apiClient.get<Chat>(`/chats/${chatId}`);
    return response;
  }

  /**
   * Delete/archive a chat
   */
  async deleteChat(chatId: string): Promise<void> {
    await apiClient.delete(`/chats/${chatId}`);
  }
}

export const chatService = new ChatService();
