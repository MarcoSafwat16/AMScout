export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  dateOfBirth: string;
  phoneNumber: string;
  gender: 'male' | 'female';
  team: 'cubs' | 'brownies' | 'scouts' | 'guides' | 'venturers' | 'rangers' | 'rovers' | 'leaders';
  isAdmin?: boolean;
  isOnline?: boolean;
  isBlocked?: boolean;
  isMuted?: boolean; // "View-only" ban
  points?: number;
  following?: string[];
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  text: string;
  likes?: number;
  replies?: Comment[];
}

export interface Post {
  id: string;
  authorId: string;
  author: User;
  imageUrl?: string;
  videoUrl?: string;
  caption: string;
  likes: number;
  reposts: number;
  comments: Comment[];
  timestamp: any; // Can be Date or Firebase Timestamp
  originalPost?: Post;
  taggedUsers?: User[];
  type?: 'post' | 'reel';
  likedBy?: User[];
}

export interface Reaction {
  userId: string;
  user: User;
  type: 'like';
}

export interface Story {
  id:string;
  contentUrl: string;
  contentType: 'image' | 'video';
  duration: number; // in seconds
  timestamp: Date;
  comments?: Comment[];
  reactions?: Reaction[];
}

export interface UserStories {
  userId: string;
  user: User;
  stories: Story[];
  hasUnseen: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  sender: User;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  stickerUrl?: string;
  timestamp: Date;
}

export interface ProductVariant {
  type: string; // e.g., 'Size', 'Color'
  value: string; // e.g., 'L', 'Red'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  sellerId: string;
  seller: User;
  category: string;
  variants: {
    [key: string]: string[]; // e.g., { "Size": ["S", "M", "L"], "Color": ["Red", "Blue"] }
  };
}

export interface CartItem {
  cartItemId: string; // Unique ID for this cart entry, e.g., `prod1_Size_L`
  product: Product;
  quantity: number;
  selectedVariant: ProductVariant;
}

export interface Notification {
    id: string;
    type: 'like' | 'comment' | 'follow';
    userId: string;
    user: User; // The user who performed the action
    post?: Post; // The post that was liked or commented on
    timestamp: string;
}

export enum Page {
  Home = 'Home',
  Reels = 'Reels',
  Shop = 'Shop',
  Profile = 'Profile',
  Search = 'Search',
  Messages = 'Messages',
  Notifications = 'Notifications',
}
