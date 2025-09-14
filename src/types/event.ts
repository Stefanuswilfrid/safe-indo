export interface Event {
  id: number;
  title: string;
  description: string;
  lat: number;
  lng: number;
  source: string;
  url?: string;
  verified: boolean;
  type: string;
  originalCreatedAt?: string; // Original creation time from source (TikTok, Twitter, etc.)
  createdAt: string;
  closureType?: string;
  reason?: string;
  severity?: string;
  affectedRoutes?: string[];
  alternativeRoutes?: string[];
  // Warning-specific fields
  tweetId?: string;
  extractedLocation?: string;
  confidenceScore?: number;
  socialMetrics?: {
    bookmarks: number;
    favorites: number;
    retweets: number;
    views: string;
    quotes: number;
    replies: number;
  };
  userInfo?: {
    created_at: string;
    followers_count: number;
    friends_count: number;
    favourites_count: number;
    verified: boolean;
  };
}



export interface ChatContext {
  currentView?: string;
  timeRange?: string;
  includeHoaxes?: boolean;
}

export interface WarningMarker {
  id: number;
  text: string;
  extractedLocation: string | null;
  lat: number | null;
  lng: number | null;
  confidenceScore: number | null;
  verified: boolean;
  createdAt: Date;
  tweetId: string;
  userInfo: Record<string, unknown>;
  views: string | number | null;
  retweets: number | null;
}

