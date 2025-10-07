import { Post, UserStories, User, Message, Product, Notification } from '../types';

// These users are only for potential seeding scripts or legacy components.
// The main `users` array in the app will be populated from Firestore.
const mockAuthor1: User = { id: 'u1', username: 'ScoutMaster', fullName: 'John Doe', email: 'john@example.com', avatarUrl: 'https://picsum.photos/seed/u1/100', dateOfBirth: '1990-01-01', phoneNumber: '1234567890', gender: 'male', team: 'leaders', points: 1250, isAdmin: true, isOnline: true };
const mockAuthor2: User = { id: 'u2', username: 'AriaArt', fullName: 'Aria Smith', email: 'aria@example.com', avatarUrl: 'https://picsum.photos/seed/u2/100', dateOfBirth: '1995-05-10', phoneNumber: '0987654321', gender: 'female', team: 'rangers', points: 8900, isOnline: true };
const mockAuthor3: User = { id: 'u3', username: 'TechExplorer', fullName: 'Kenji Tanaka', email: 'kenji@example.com', avatarUrl: 'https://picsum.photos/seed/u3/100', dateOfBirth: '1998-11-20', phoneNumber: '1122334455', gender: 'male', team: 'rovers', points: 5600 };

export const mockUsers: User[] = [];

// All data is now fetched from Firestore. These arrays are kept empty.
export const mockPosts: Post[] = [];
export const mockUserStories: UserStories[] = [];
export const mockGroupChatMessages: Message[] = [];
export const mockUserStickers: string[] = [];
export const mockProducts: Product[] = [];
export const mockNotifications: Notification[] = [];
