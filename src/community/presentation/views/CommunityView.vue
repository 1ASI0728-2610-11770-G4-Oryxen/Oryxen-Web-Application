<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCommunityStore } from '@/community/application/community.store';
import { useRouter } from 'vue-router';
import { env } from '@/config/env';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Dialog from 'primevue/dialog';
import FileUpload, { type FileUploadUploadEvent } from 'primevue/fileupload';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const { t } = useI18n();
const store = useCommunityStore();
const router = useRouter();
const toast = useToast();

const showCreateForm = ref(false);
const newTitle = ref('');
const newContent = ref('');
const selectedFile = ref<File | null>(null);
const submitting = ref(false);
const expandedComments = ref<Set<string>>(new Set());
const commentText = ref<Record<string, string>>({});
const showPremiumModal = ref(false);

onMounted(async () => {
  const premium = await store.checkSubscription();
  if (!premium) {
    showPremiumModal.value = true;
    return;
  }
  await store.fetchFeed(true);
});

function toggleComments(postId: string) {
  if (expandedComments.value.has(postId)) {
    expandedComments.value.delete(postId);
  } else {
    expandedComments.value.add(postId);
  }
}

function hasComments(postId: string): boolean {
  return expandedComments.value.has(postId);
}

async function handleCreatePost() {
  if (!newTitle.value.trim() || !newContent.value.trim()) return;
  submitting.value = true;
  const result = await store.createPost(newTitle.value, newContent.value, selectedFile.value ?? undefined);
  submitting.value = false;
  if (result) {
    newTitle.value = '';
    newContent.value = '';
    selectedFile.value = null;
    showCreateForm.value = false;
    toast.add({ severity: 'success', summary: t('community.toastPosted'), life: 3000 });
  } else {
    toast.add({ severity: 'error', summary: t('community.toastError'), life: 3000 });
  }
}

function onFileSelect(event: FileUploadUploadEvent) {
  selectedFile.value = event.files[0] as File;
}

async function handleAddComment(postId: string) {
  const text = commentText.value[postId]?.trim();
  if (!text) return;
  const result = await store.addComment(postId, text);
  if (result) {
    commentText.value[postId] = '';
  }
}

async function handleToggleLike(postId: string) {
  await store.toggleLike(postId);
}

function handleUpgrade() {
  showPremiumModal.value = false;
  router.push({ name: 'Pricing' });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function imageSrc(relativeUrl: string | null): string | undefined {
  if (!relativeUrl) return undefined;
  return relativeUrl.startsWith('http') ? relativeUrl : env.apiBaseUrl.replace(/\/api\/v1$/, '') + relativeUrl;
}
</script>

<template>
  <div class="community-container" role="feed" aria-label="Community Feed">
    <Toast />

    <Dialog
      v-model:visible="showPremiumModal"
      :header="t('community.premiumTitle')"
      :modal="true"
      :closable="false"
      :style="{ width: '480px' }"
    >
      <div class="premium-modal-content">
        <p>{{ t('community.premiumMessage') }}</p>
        <div class="premium-actions">
          <Button
            :label="t('community.upgradeNow')"
            icon="pi pi-crown"
            severity="success"
            @click="handleUpgrade"
          />
          <Button
            :label="t('community.goBack')"
            icon="pi pi-arrow-left"
            severity="secondary"
            text
            @click="router.push({ name: 'Dashboard' })"
          />
        </div>
      </div>
    </Dialog>

    <div class="community-header">
      <h1>{{ t('community.title') }}</h1>
      <Button
        v-if="store.isPremium"
        :label="t('community.newPost')"
        icon="pi pi-plus"
        @click="showCreateForm = !showCreateForm"
        :aria-expanded="showCreateForm"
        aria-haspopup="true"
      />
    </div>

    <div v-if="showCreateForm && store.isPremium" class="create-form" role="form" aria-label="Create post form">
      <Card>
        <template #content>
          <div class="form-group">
            <label for="post-title">{{ t('community.postTitle') }}</label>
            <InputText
              id="post-title"
              v-model="newTitle"
              :placeholder="t('community.postTitlePlaceholder')"
              fluid
              aria-required="true"
            />
          </div>
          <div class="form-group">
            <label for="post-content">{{ t('community.postContent') }}</label>
            <Textarea
              id="post-content"
              v-model="newContent"
              :placeholder="t('community.postContentPlaceholder')"
              rows="3"
              fluid
              aria-required="true"
            />
          </div>
          <div class="form-group">
            <label>{{ t('community.attachImage') }}</label>
            <FileUpload
              mode="basic"
              accept="image/*"
              :max-file-size="5_000_000"
              @upload="onFileSelect"
              :choose-label="t('community.chooseImage')"
            />
            <small v-if="selectedFile" class="file-name">{{ selectedFile.name }}</small>
          </div>
          <div class="form-actions">
            <Button
              :label="t('community.cancel')"
              severity="secondary"
              text
              @click="showCreateForm = false"
            />
            <Button
              :label="t('community.publish')"
              icon="pi pi-send"
              :loading="submitting"
              :disabled="!newTitle.trim() || !newContent.trim()"
              @click="handleCreatePost"
            />
          </div>
        </template>
      </Card>
    </div>

    <ProgressSpinner v-if="store.loading && store.posts.length === 0" />

    <Message
      v-if="store.error"
      severity="error"
      :closable="true"
      role="alert"
      @close="store.error = null"
    >
      {{ store.error }}
    </Message>

    <div v-if="!store.loading && store.posts.length === 0 && store.isPremium" class="empty-state">
      <p>{{ t('community.empty') }}</p>
    </div>

    <div class="post-list">
      <article
        v-for="post in store.posts"
        :key="post.id"
        class="post-card"
        :aria-label="`Post by ${post.authorName}: ${post.title}`"
      >
        <Card>
          <template #content>
            <div class="post-header">
              <div class="author-info">
                <strong class="author-name">{{ post.authorName }}</strong>
                <span class="post-date">{{ formatDate(post.createdAt) }}</span>
              </div>
              <Tag v-if="post.likesCount > 0" :value="`${post.likesCount} 👍`" severity="info" />
            </div>

            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-text">{{ post.content }}</p>

            <img
              v-if="post.imageUrl"
              :src="imageSrc(post.imageUrl)"
              :alt="t('community.postImageAlt', { title: post.title })"
              class="post-image"
              loading="lazy"
            />

            <div class="post-actions">
              <Button
                :label="post.likedByCurrentUser ? '❤️' : '🤍'"
                :severity="post.likedByCurrentUser ? 'danger' : 'secondary'"
                text
                :aria-pressed="post.likedByCurrentUser"
                :aria-label="post.likedByCurrentUser
                  ? $t('community.unlikeAria', { author: post.authorName })
                  : $t('community.likeAria', { author: post.authorName })"
                @click="handleToggleLike(post.id)"
              />
              <Button
                :label="t('community.commentsCount', { count: post.comments.length })"
                icon="pi pi-comment"
                severity="secondary"
                text
                :aria-expanded="hasComments(post.id)"
                aria-haspopup="true"
                @click="toggleComments(post.id)"
              />
            </div>

            <div v-if="hasComments(post.id)" class="comments-section">
              <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                <div class="comment-meta">
                  <strong>{{ comment.authorName }}</strong>
                  <small>{{ formatDate(comment.createdAt) }}</small>
                </div>
                <p class="comment-text">{{ comment.content }}</p>
              </div>

              <div class="add-comment">
                <InputText
                  v-model="commentText[post.id]"
                  :placeholder="t('community.commentPlaceholder')"
                  fluid
                  @keyup.enter="handleAddComment(post.id)"
                  aria-label="Add comment"
                />
                <Button
                  icon="pi pi-send"
                  severity="success"
                  text
                  :aria-label="t('community.sendComment')"
                  @click="handleAddComment(post.id)"
                />
              </div>
            </div>
          </template>
        </Card>
      </article>
    </div>

    <div v-if="store.hasMore && store.posts.length > 0" class="load-more">
      <Button
        :label="t('community.loadMore')"
        icon="pi pi-refresh"
        :loading="store.loading"
        @click="store.loadMore()"
      />
    </div>
  </div>
</template>

<style scoped>
.community-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.community-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.community-header h1 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.create-form {
  margin-bottom: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.file-name {
  color: var(--primary-green);
  font-size: var(--font-size-sm);
  margin-left: var(--spacing-sm);
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.post-card {
  transition: transform 0.15s ease;
}

.post-card:hover {
  transform: translateY(-1px);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  color: var(--text-primary);
  font-size: var(--font-size-base);
}

.post-date {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.post-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.post-text {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  line-height: 1.6;
  white-space: pre-wrap;
  margin-bottom: var(--spacing-md);
}

.post-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
}

.post-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-color);
}

.comments-section {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.comment-item {
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.comment-meta strong {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.comment-meta small {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.comment-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

.add-comment {
  display: flex;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
}

.premium-modal-content {
  text-align: center;
}

.premium-modal-content p {
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
}

.premium-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-xl);
}
</style>
