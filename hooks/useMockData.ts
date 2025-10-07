import { Post, UserStories, User, Message, Product, Notification } from '../types';

// These users are only for seeding mock posts and stories.
// The main `users` array in the app will be populated from Firestore.
const mockAuthor1: User = { id: 'u1', username: 'ScoutMaster', fullName: 'John Doe', email: 'john@example.com', avatarUrl: 'https://picsum.photos/seed/u1/100', dateOfBirth: '1990-01-01', phoneNumber: '1234567890', gender: 'male', team: 'leaders', points: 1250, isAdmin: true, isOnline: true };
const mockAuthor2: User = { id: 'u2', username: 'AriaArt', fullName: 'Aria Smith', email: 'aria@example.com', avatarUrl: 'https://picsum.photos/seed/u2/100', dateOfBirth: '1995-05-10', phoneNumber: '0987654321', gender: 'female', team: 'rangers', points: 8900, isOnline: true };
const mockAuthor3: User = { id: 'u3', username: 'TechExplorer', fullName: 'Kenji Tanaka', email: 'kenji@example.com', avatarUrl: 'https://picsum.photos/seed/u3/100', dateOfBirth: '1998-11-20', phoneNumber: '1122334455', gender: 'male', team: 'rovers', points: 5600 };

export const mockUsers: User[] = [];

export const mockPosts: Post[] = [
    { id: 'p1', author: mockAuthor2, imageUrl: 'https://picsum.photos/seed/p1/600/800', caption: 'Just finished this new piece! What do you all think? #art #digitalart', likes: 1200, reposts: 250, comments: [], timestamp: '2h ago', type: 'post' },
    { id: 'r1', author: mockAuthor3, videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', caption: 'Exploring the city at night. The views are just breathtaking! 🌃 #cityscape #tech', likes: 3400, reposts: 500, comments: [], timestamp: '5h ago', type: 'reel', likedBy: [mockAuthor1, mockAuthor2] },
    { id: 'p2', author: mockAuthor1, caption: 'Just a reminder to all scouts: our weekly meeting is this Friday at 7 PM. Be prepared!', likes: 58, reposts: 12, comments: [], timestamp: '1d ago', type: 'post' }
];

export const mockUserStories: UserStories[] = [
    { user: mockAuthor2, stories: [{ id: 's1', contentUrl: 'https://picsum.photos/seed/s1/1080/1920', contentType: 'image', duration: 5, timestamp: new Date(Date.now() - 3600000 * 2), comments: [], reactions:[] }], hasUnseen: true },
    { user: mockAuthor3, stories: [{ id: 's2', contentUrl: 'https://picsum.photos/seed/s2/1080/1920', contentType: 'image', duration: 5, timestamp: new Date(Date.now() - 3600000 * 4), comments: [], reactions:[] }], hasUnseen: true },
    { user: mockAuthor1, stories: [{ id: 's3', contentUrl: 'https://picsum.photos/seed/s3/1080/1920', contentType: 'image', duration: 5, timestamp: new Date(Date.now() - 3600000 * 8), comments: [], reactions:[] }], hasUnseen: false }
];

export const mockGroupChatMessages: Message[] = [
    { id: 'm1', sender: mockAuthor2, text: 'Hey everyone, how\'s it going?', timestamp: new Date(Date.now() - 60000 * 5) },
    { id: 'm2', sender: mockAuthor3, text: 'Doing great! Just wrapped up a project.', timestamp: new Date(Date.now() - 60000 * 4) },
    { id: 'm3', sender: mockAuthor1, text: 'Welcome to the global chat!', timestamp: new Date(Date.now() - 60000 * 3) }
];

export const mockUserStickers: string[] = [
    'https://picsum.photos/seed/sticker1/128',
    'https://picsum.photos/seed/sticker2/128',
];

export const mockProducts: Product[] = [
    { id: 'prod1', name: 'Official Scout T-Shirt', description: 'High-quality cotton t-shirt with official AMScout logo.', price: 24.99, imageUrls: ['https://picsum.photos/seed/prod1/400'], seller: mockAuthor1, category: 'Shirts', variants: { "Size": ["S", "M", "L", "XL"] } },
    { id: 'prod2', name: 'Ranger Hiking Boots', description: 'Durable and waterproof boots for any adventure.', price: 89.99, imageUrls: ['https://picsum.photos/seed/prod2/400'], seller: mockAuthor1, category: 'Shoes', variants: { "Size": ["8", "9", "10", "11"] } },
];

export const mockNotifications: Notification[] = [
    { id: 'n1', type: 'like', user: mockAuthor2, post: mockPosts[2], timestamp: '3h ago' },
    { id: 'n2', type: 'follow', user: mockAuthor3, timestamp: '1d ago' },
    { id: 'n3', type: 'comment', user: mockAuthor1, post: mockPosts[0], timestamp: '2d ago' },
];