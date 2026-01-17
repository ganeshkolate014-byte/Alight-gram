export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

export interface Project {
  id: string; // Document ID
  title: string;
  description: string;
  genre: string; // New field
  xmlContent: string;
  videoUrl: string; // Cloudinary URL
  visibility: 'public' | 'private';
  ownerId: string;
  ownerName: string;
  ownerPhoto?: string;
  createdAt: number; // Timestamp
  likes: number;
  likedBy: string[]; // Array of user IDs who liked
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto: string;
  timestamp: number;
}

export type ViewState = 'feed' | 'my-projects' | 'profile';