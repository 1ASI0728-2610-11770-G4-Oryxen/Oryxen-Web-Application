import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CommunityPost, Comment, LikeResponse } from '@/community/domain/model/community.entity';
import { communityService } from '@/community/infrastructure/community.service';
import { billingService } from '@/billing/infrastructure/billing.service';

export const useCommunityStore = defineStore('community', () => {
  const posts = ref<CommunityPost[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const pageSize = ref(20);
  const hasMore = ref(true);
  const isPremium = ref(false);
  const subscriptionChecked = ref(false);

  async function checkSubscription(): Promise<boolean> {
    if (subscriptionChecked.value) return isPremium.value;
    try {
      const sub = await billingService.getCurrentSubscription();
      isPremium.value = sub.plan.toLowerCase() === 'premium';
      subscriptionChecked.value = true;
      return isPremium.value;
    } catch {
      isPremium.value = false;
      subscriptionChecked.value = true;
      return false;
    }
  }

  async function fetchFeed(reset = false): Promise<void> {
    loading.value = true;
    error.value = null;

    if (reset) {
      currentPage.value = 1;
      posts.value = [];
      hasMore.value = true;
    }

    try {
      const feed = await communityService.getFeed(currentPage.value, pageSize.value);
      if (feed.length < pageSize.value) {
        hasMore.value = false;
      }
      if (reset) {
        posts.value = feed;
      } else {
        posts.value = [...posts.value, ...feed];
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load community feed';
    } finally {
      loading.value = false;
    }
  }

  async function loadMore(): Promise<void> {
    currentPage.value++;
    await fetchFeed(false);
  }

  async function createPost(title: string, content: string, image?: File): Promise<CommunityPost | null> {
    try {
      const post = await communityService.createPost(title, content, image);
      posts.value = [post, ...posts.value];
      return post;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to create post';
      return null;
    }
  }

  async function addComment(postId: string, content: string): Promise<Comment | null> {
    try {
      const comment = await communityService.addComment(postId, { content });
      const post = posts.value.find(p => p.id === postId);
      if (post) {
        post.comments = [...post.comments, comment];
      }
      return comment;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to add comment';
      return null;
    }
  }

  async function toggleLike(postId: string): Promise<LikeResponse | null> {
    try {
      const result = await communityService.toggleLike(postId);
      const post = posts.value.find(p => p.id === postId);
      if (post) {
        post.likesCount = result.likesCount;
        post.likedByCurrentUser = result.likedByCurrentUser;
      }
      return result;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to toggle like';
      return null;
    }
  }

  return {
    posts,
    loading,
    error,
    currentPage,
    pageSize,
    hasMore,
    isPremium,
    subscriptionChecked,
    checkSubscription,
    fetchFeed,
    loadMore,
    createPost,
    addComment,
    toggleLike,
  };
});
