import { apiClient } from '@/services/httpClient';
import type { CommunityPost, Comment, LikeResponse, CreateCommentPayload } from '@/community/domain/model/community.entity';

export class CommunityService {
  async getFeed(page = 1, pageSize = 20): Promise<CommunityPost[]> {
    const { data } = await apiClient.get('/community/feed', { params: { page, pageSize } });
    return data;
  }

  async getPost(postId: string): Promise<CommunityPost> {
    const { data } = await apiClient.get(`/community/posts/${postId}`);
    return data;
  }

  async createPost(title: string, content: string, image?: File): Promise<CommunityPost> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }
    const { data } = await apiClient.post('/community/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }

  async addComment(postId: string, payload: CreateCommentPayload): Promise<Comment> {
    const { data } = await apiClient.post(`/community/posts/${postId}/comments`, payload);
    return data;
  }

  async toggleLike(postId: string): Promise<LikeResponse> {
    const { data } = await apiClient.post(`/community/posts/${postId}/likes`);
    return data;
  }
}

export const communityService = new CommunityService();
