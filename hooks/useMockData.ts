
import { Post, UserStories, User, Message, Product, Notification } from '../types';

export const mockUsers: User[] = [
  { 
    id: 'u1', 
    username: 'AMScout_Official', 
    fullName: 'Admin Scout',
    email: 'admin@amscout.com', 
    phoneNumber: '1234567890',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    team: 'leaders',
    avatarUrl: 'https://picsum.photos/seed/u1/100', 
    isAdmin: true, 
    isOnline: true, 
    points: 99999 
  },
  { 
    id: 'u2', 
    username: 'Aria', 
    fullName: 'Aria Smith',
    email: 'aria@example.com', 
    phoneNumber: '2345678901',
    dateOfBirth: '1998-05-15',
    gender: 'female',
    team: 'rangers',
    avatarUrl: 'https://picsum.photos/seed/u2/100', 
    isOnline: true, 
    points: 1250 
  },
  { 
    id: 'u3', 
    username: 'LeoSynth', 
    fullName: 'Leo Synth',
    email: 'leo@example.com', 
    phoneNumber: '3456789012',
    dateOfBirth: '2000-11-20',
    gender: 'male',
    team: 'rovers',
    avatarUrl: 'https://picsum.photos/seed/u3/100', 
    isOnline: false, 
    points: 800 
  },
  { 
    id: 'u4', 
    username: 'CyberGamer', 
    fullName: 'Cyber Gamer',
    email: 'gamer@example.com', 
    phoneNumber: '4567890123',
    dateOfBirth: '1995-07-30',
    gender: 'male',
    team: 'venturers',
    avatarUrl: 'https://picsum.photos/seed/u4/100', 
    isOnline: true, 
    points: 2500, 
    isMuted: true 
  },
  { 
    id: 'u5', 
    username: 'NovaArt', 
    fullName: 'Nova Art',
    email: 'nova@example.com', 
    phoneNumber: '5678901234',
    dateOfBirth: '1999-03-10',
    gender: 'female',
    team: 'guides',
    avatarUrl: 'https://picsum.photos/seed/u5/100', 
    isOnline: false, 
    points: 5000 
  },
  { 
    id: 'u6', 
    username: 'TechWizard', 
    fullName: 'Tech Wizard',
    email: 'wiz@example.com', 
    phoneNumber: '6789012345',
    dateOfBirth: '2002-09-05',
    gender: 'male',
    team: 'scouts',
    avatarUrl: 'https://picsum.photos/seed/u6/100', 
    isOnline: false, 
    points: 300, 
    isBlocked: true 
  },
];

const basePosts: Post[] = [
  {
    id: 'p0',
    author: mockUsers[0],
    imageUrl: 'https://picsum.photos/seed/p0/600/400',
    caption: 'Welcome to AMScout! This is your feed. Follow other creators to see their posts here.',
    likes: 42,
    reposts: 5,
    comments: [],
    timestamp: '1m ago',
    type: 'post',
  },
  {
    id: 'p1',
    author: mockUsers[1],
    imageUrl: 'https://picsum.photos/seed/p1/600/800',
    caption: 'Exploring the neon-lit streets tonight. The city has its own kind of magic. ✨ #cyberpunk #citylights',
    likes: 1337,
    reposts: 102,
    comments: [
      { 
        id: 'c1', 
        user: mockUsers[2], 
        text: 'Looks amazing! I need to visit.', 
        likes: 15,
        replies: [
          { id: 'r1', user: mockUsers[1], text: 'You should! It was even better in person.', likes: 2 },
          { id: 'r2', user: mockUsers[3], text: 'Definitely on my list!', likes: 4 }
        ]
      },
      { id: 'c2', user: mockUsers[4], text: 'Great shot! 📸', likes: 8 },
    ],
    timestamp: '2h ago',
    taggedUsers: [mockUsers[2], mockUsers[4]],
    type: 'post',
  },
   {
    id: 'p7',
    author: mockUsers[5],
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    caption: 'Testing out the new Reels feature! #reels #video',
    likes: 450,
    reposts: 12,
    comments: [],
    timestamp: '2h ago',
    type: 'reel',
    taggedUsers: [mockUsers[1], mockUsers[2]], // Tagging Aria and LeoSynth
    likedBy: [mockUsers[1], mockUsers[2], mockUsers[3], mockUsers[4], mockUsers[0]], // Add users who liked it
  },
  {
    id: 'p4',
    author: mockUsers[3],
    caption: 'Just hit a new high score on "Galaxy Raiders"! 🚀 The final boss was intense, but my new plasma cannon build shredded through it. Anyone else playing? Drop your usernames! #gaming #highscore #pcgaming',
    likes: 589,
    reposts: 43,
    comments: [
       { id: 'c4', user: mockUsers[5], text: 'Nice one! I\'m still stuck on level 8.', likes: 3 },
    ],
    timestamp: '3h ago',
    type: 'post',
  },
  {
    id: 'p2',
    author: mockUsers[2],
    imageUrl: 'https://picsum.photos/seed/p2/600/750',
    caption: 'New track just dropped! Link in bio. Let me know what you think. 🎶 #newmusic #synthwave',
    likes: 854,
    reposts: 98,
    comments: [
       { id: 'c3', user: mockUsers[1], text: 'Fire! 🔥', likes: 22 },
    ],
    timestamp: '5h ago',
    type: 'post',
  },
  {
    id: 'p3',
    author: mockUsers[4],
    imageUrl: 'https://picsum.photos/seed/p3/600/600',
    caption: 'Just finished this digital painting. Inspired by classic sci-fi novels. What worlds should I create next? 🎨🚀',
    likes: 2048,
    reposts: 312,
    comments: [],
    timestamp: '1d ago',
    type: 'post',
  },
];

export const mockPosts: Post[] = [
  ...basePosts,
  {
    id: 'p5',
    author: mockUsers[0],
    caption: '',
    likes: 0,
    reposts: 0,
    comments: [],
    timestamp: '10m ago',
    originalPost: basePosts.find(p => p.id === 'p2'),
  },
  {
    id: 'p6',
    author: mockUsers[3],
    caption: 'This city aesthetic is exactly what I imagine for the world of "Galaxy Raiders 2". Incredible inspiration!',
    likes: 29,
    reposts: 3,
    comments: [],
    timestamp: '1h ago',
    originalPost: basePosts.find(p => p.id === 'p1'),
  },
];


export const mockUserStories: UserStories[] = [
  {
    user: mockUsers[1], // Aria
    hasUnseen: true,
    stories: [
      { id: 's1-1', contentUrl: 'https://picsum.photos/seed/s1-1/1080/1920', contentType: 'image', duration: 5, timestamp: new Date(Date.now() - 1000 * 60 * 15), comments: [], reactions: [] },
      { id: 's1-2', contentUrl: 'https://picsum.photos/seed/s1-2/1080/1920', contentType: 'image', duration: 5, timestamp: new Date(Date.now() - 1000 * 60 * 10), comments: [], reactions: [] },
    ]
  },
  {
    user: mockUsers[2], // LeoSynth
    hasUnseen: true,
    stories: [
      { id: 's2-1', contentUrl: 'https://picsum.photos/seed/s2-1/1080/1920', contentType: 'image', duration: 7, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), comments: [], reactions: [] },
    ]
  },
  {
    user: mockUsers[4], // NovaArt
    hasUnseen: false,
    stories: [
      { id: 's4-1', contentUrl: 'https://picsum.photos/seed/s4-1/1080/1920', contentType: 'image', duration: 5, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), comments: [], reactions: [] },
      { id: 's4-2', contentUrl: 'https://picsum.photos/seed/s4-2/1080/1920', contentType: 'image', duration: 5, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7), comments: [], reactions: [] },
      { id: 's4-3', contentUrl: 'https://picsum.photos/seed/s4-3/1080/1920', contentType: 'image', duration: 5, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), comments: [], reactions: [] },
    ]
  }
];

export const mockGroupChatMessages: Message[] = [
    { id: 'gm1', sender: mockUsers[1], text: 'Hey everyone, welcome to the global chat!', timestamp: new Date(Date.now() - 1000 * 60 * 10) },
    { id: 'gm2', sender: mockUsers[2], text: 'This is cool! A place for all of us to connect.', timestamp: new Date(Date.now() - 1000 * 60 * 9) },
    { id: 'gm3', sender: mockUsers[3], text: 'Anyone playing the new "Galaxy Raiders" update?', timestamp: new Date(Date.now() - 1000 * 60 * 8) },
    { id: 'gm4', sender: mockUsers[4], imageUrl: 'https://picsum.photos/seed/p3/400/300', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: 'gm5', sender: mockUsers[4], text: 'Just sharing some art I made.', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: 'gm6', sender: mockUsers[0], text: 'Amazing work, @NovaArt! Remember to be respectful in the chat, everyone.', timestamp: new Date(Date.now() - 1000 * 60 * 2) },
];

export const mockUserStickers: string[] = [
    'https://picsum.photos/seed/sticker1/128',
    'https://picsum.photos/seed/sticker2/128',
    'https://picsum.photos/seed/sticker3/128',
];

export const mockProducts: Product[] = [
  {
    id: 'prod4',
    name: 'Official AMScout Hoodie',
    description: 'Stay comfortable while you create. This premium, soft-touch hoodie features a minimalist embroidered AMScout logo. Available in all sizes.',
    price: 65.00,
    imageUrls: ['https://picsum.photos/seed/prod4a/500', 'https://picsum.photos/seed/prod4b/500', 'https://picsum.photos/seed/prod4c/500'],
    seller: mockUsers[0],
    category: 'Shirts',
    variants: {
        "Size": ["S", "M", "L", "XL", "XXL"],
    },
  },
  {
    id: 'prod7',
    name: 'AMScout Classic Tee',
    description: 'A classic, high-quality t-shirt with the AMScout logo printed on the chest. Made from 100% ring-spun cotton for maximum comfort.',
    price: 28.00,
    imageUrls: ['https://picsum.photos/seed/prod7a/500', 'https://picsum.photos/seed/prod7b/500'],
    seller: mockUsers[0],
    category: 'Shirts',
    variants: {
        "Size": ["S", "M", "L", "XL"],
    },
  },
  {
    id: 'prod8',
    name: 'Cybernetic Runner Shoes',
    description: 'Futuristic running shoes with a unique design, inspired by the neon-lit cityscapes. Lightweight and comfortable.',
    price: 150.00,
    imageUrls: ['https://picsum.photos/seed/prod8a/500', 'https://picsum.photos/seed/prod8b/500'],
    seller: mockUsers[3],
    category: 'Shoes',
    variants: {
        "Size": ["8", "9", "10", "11", "12"],
    },
  },
  {
    id: 'prod9',
    name: 'Synthwave Cargo Pants',
    description: 'Durable and stylish cargo pants with a retro-futuristic aesthetic. Multiple pockets for all your gear.',
    price: 85.00,
    imageUrls: ['https://picsum.photos/seed/prod9a/500'],
    seller: mockUsers[2],
    category: 'Pants',
    variants: {
        "Waist": ["30", "32", "34", "36"],
    },
  },
  {
    id: 'prod10',
    name: 'Creator Pin Set',
    description: 'A set of four exclusive enamel pins featuring designs for creators: a camera, a microphone, a paintbrush, and a keyboard.',
    price: 22.00,
    imageUrls: ['https://picsum.photos/seed/prod10a/500'],
    seller: mockUsers[0],
    category: 'Accessories',
    variants: {
        "Style": ["Enamel Pin"],
    },
  },
];

export const mockNotifications: Notification[] = [
    { id: 'n1', type: 'follow', user: mockUsers[2], timestamp: '5m ago' },
    { id: 'n2', type: 'like', user: mockUsers[4], post: mockPosts[2], timestamp: '15m ago' },
    { id: 'n3', type: 'comment', user: mockUsers[1], post: mockPosts[0], timestamp: '1h ago' },
    { id: 'n4', type: 'like', user: mockUsers[3], post: mockPosts[1], timestamp: '3h ago' },
    { id: 'n5', type: 'follow', user: mockUsers[5], timestamp: '1d ago' },
];