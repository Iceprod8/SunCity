export interface FeedComment {
  id: string;
  author: string;
  text: string;
  at: string;
}

export interface FeedLikeRecord {
  id: string | number;
  itemId: string;
  userId: string | number;
  createdAt: string;
}

export interface FeedCommentRecord extends FeedComment {
  itemId: string;
  userId: string | number;
}

export interface ItemEngagement {
  likes: number;
  liked: boolean;
  comments: FeedComment[];
}