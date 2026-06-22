export interface CommunityPost {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  content: string;
  imageUrl: string | null;
  likesCount: number;
  likedByCurrentUser: boolean;
  createdAt: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface LikeResponse {
  postId: string;
  likesCount: number;
  likedByCurrentUser: boolean;
}

export interface CreatePostPayload {
  title: string;
  content: string;
  image?: File;
}

export interface CreateCommentPayload {
  content: string;
}
