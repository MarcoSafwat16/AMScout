

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Page, User, Post, Comment, Message, Product, CartItem, ProductVariant, UserStories, Story, Reaction, Notification } from './types';
import AppNavBar from './components/BottomNavBar';
import Feed from './components/Feed';
import Header from './components/Header';
import Composer from './components/Composer';
import Profile from './components/Profile';
import StoryTray from './components/StoryTray';
import CommentSheet from './components/CommentSheet';
import CreationChoiceModal from './components/CreationChoiceModal';
import ReelComposer from './components/ReelComposer';
import ReelsViewer from './components/ReelsViewer';
import PromoBanner from './components/PromoBanner';
import ChatScreen from './components/ChatScreen';
import StickerCreator from './components/StickerCreator';
import ShopScreen from './components/ShopScreen';
import ProductDetailModal from './components/ProductDetailModal';
import CartScreen from './components/CartScreen';
import AdminDashboard from './components/AdminDashboard';
import ProductComposer from './components/ProductComposer';
import DashboardIcon from './components/icons/DashboardIcon';
import StoryViewer from './components/StoryViewer';
import StoryCreator from './components/StoryCreator';
import SearchScreen from './components/PlaceholderScreen';
import NotificationsScreen from './components/ChatListScreen';
import LoginScreen from './components/LoginScreen';
import SignUpScreen from './components/SignUpScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import EditProfileScreen from './components/EditProfileScreen';
import { auth, db, storage } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, addDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, writeBatch, query, orderBy, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';

type AuthPage = 'login' | 'signup' | 'forgotPassword';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  
  const [users, setUsers] = useState<User[]>([]);
  const [activePage, setActivePage] = useState<Page>(Page.Home);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isReelComposerOpen, setIsReelComposerOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isReelsViewerOpen, setIsReelsViewerOpen] = useState(false);
  const [viewedProfileId, setViewedProfileId] = useState<string | null>(null);
  
  // Firestore-backed state
  const [posts, setPosts] = useState<Post[]>([]);
  const [userStories, setUserStories] = useState<UserStories[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [groupChatMessages, setGroupChatMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [commentingOnPost, setCommentingOnPost] = useState<Post | null>(null);
  const [promoText, setPromoText] = useState("");
  const [userStickers, setUserStickers] = useState<string[]>([]);
  const [isStickerCreatorOpen, setIsStickerCreatorOpen] = useState(false);
  
  // Stories State
  const [viewingStoriesOfUser, setViewingStoriesOfUser] = useState<UserStories | null>(null);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  
  // E-commerce, Admin & Profile state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [viewedProductId, setViewedProductId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductComposerOpen, setIsProductComposerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [dashboardPosition, setDashboardPosition] = useState({ x: window.innerWidth / 2 - 300, y: 100 });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Start Data Fetching & Presence ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        // Set user online
        await updateDoc(userDocRef, { isOnline: true, lastSeen: serverTimestamp() }).catch(e => console.error("Failed to set user online:", e));

        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setCurrentUser({ id: doc.id, ...doc.data() } as User);
          } else {
            console.error("Current user data not found in Firestore.");
            setCurrentUser(null);
          }
        });
        setIsLoading(false);
        return () => unsubscribeUser();
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);
  
  useEffect(() => {
    if (!currentUser) return;

    const userStatusDocRef = doc(db, "users", currentUser.id);

    const handleVisibilityChange = () => {
        if (!auth.currentUser) return;
        if (document.visibilityState === 'hidden') {
            updateDoc(userStatusDocRef, { isOnline: false, lastSeen: serverTimestamp() });
        } else {
            updateDoc(userStatusDocRef, { isOnline: true, lastSeen: serverTimestamp() });
        }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Set offline on unload
    window.addEventListener('beforeunload', () => {
        if (auth.currentUser) {
           updateDoc(userStatusDocRef, { isOnline: false, lastSeen: serverTimestamp() });
        }
    });

    return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
}, [currentUser]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(userList);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const configRef = doc(db, "settings", "appConfig");
    const unsubscribe = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        setPromoText(doc.data().promoBannerText || "");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!users.length) return;

    const usersMap = new Map(users.map(u => [u.id, u]));
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const postsList = snapshot.docs.map(doc => {
        const data = doc.data();
        const author = usersMap.get(data.authorId);
        const hydratedComments = (data.comments || []).map((c: any) => ({
          ...c,
          user: usersMap.get(c.userId)
        }));
        return { id: doc.id, ...data, author, comments: hydratedComments } as Post;
      });
      setPosts(postsList.filter(p => p.author));
    });

    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
        const productsList = snapshot.docs.map(doc => {
            const data = doc.data();
            return { id: doc.id, ...data, seller: usersMap.get(data.sellerId) } as Product;
        });
        setProducts(productsList.filter(p => p.seller));
    });

    const chatQuery = query(collection(db, "groupChat"), orderBy("timestamp", "asc"));
    const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
        const messagesList = snapshot.docs.map(doc => {
            const data = doc.data();
            return { id: doc.id, ...data, timestamp: data.timestamp?.toDate(), sender: usersMap.get(data.senderId) } as Message;
        });
        setGroupChatMessages(messagesList.filter(m => m.sender));
    });
    
    const unsubscribeStories = onSnapshot(collection(db, "userStories"), (snapshot) => {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const storiesList = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            const user = usersMap.get(docSnap.id);
            if (!user) return null;
            const validStories = (data.stories || []).filter((story: any) => story.timestamp?.toDate() > twentyFourHoursAgo);
            if (validStories.length === 0) return null;
            return {
                userId: docSnap.id,
                user,
                stories: validStories.map((s: any) => ({ ...s, timestamp: s.timestamp.toDate() })),
                hasUnseen: true, // Placeholder for unseen logic
            } as UserStories;
        }).filter((s): s is UserStories => s !== null);
        setUserStories(storiesList);
    });

    return () => {
      unsubscribePosts();
      unsubscribeProducts();
      unsubscribeChat();
      unsubscribeStories();
    };
  }, [users]);
  // --- End Data Fetching ---

  const { topUsers, onlineUsersCount } = useMemo(() => {
    const sorted = [...users].sort((a, b) => (b.points || 0) - (a.points || 0));
    const top = sorted.slice(0, 3).map(u => u.id);
    const online = users.filter(u => u.isOnline).length;
    return { topUsers: top, onlineUsersCount: online };
  }, [users]);

  const handleUpdateUserPoints = useCallback(async (userId: string, pointsToAdd: number) => {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
          const currentPoints = userDoc.data().points || 0;
          await updateDoc(userRef, { points: currentPoints + pointsToAdd });
      }
  }, []);

  const handleLogout = async () => {
    if (currentUser) {
        await updateDoc(doc(db, "users", currentUser.id), { isOnline: false, lastSeen: serverTimestamp() });
    }
    signOut(auth).catch(error => console.error("Logout failed", error));
  }
  
  const handleViewStories = useCallback((userStoriesToShow: UserStories) => {
    if (!currentUser) return;
    setViewingStoriesOfUser(userStoriesToShow);
  }, [currentUser]);

  const handleCloseStoryViewer = useCallback(() => setViewingStoriesOfUser(null), []);
  
  const handleStoryNavigation = (direction: 'next' | 'prev') => {
    if (!viewingStoriesOfUser) return;
    const currentIndex = userStories.findIndex(us => us.user.id === viewingStoriesOfUser.user.id);
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if(nextIndex >= 0 && nextIndex < userStories.length) {
       handleViewStories(userStories[nextIndex]);
    } else {
       handleCloseStoryViewer();
    }
  };
  
  const handleOpenStoryCreator = () => setIsStoryCreatorOpen(true);
  const handleCloseStoryCreator = () => setIsStoryCreatorOpen(false);
  
  const handleAddStory = useCallback(async (imageDataUrl: string) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
        const storyFileRef = ref(storage, `stories/${currentUser.id}/${Date.now()}.jpg`);
        const snapshot = await uploadString(storyFileRef, imageDataUrl, 'data_url');
        const downloadURL = await getDownloadURL(snapshot.ref);

        const newStory = {
            id: `s_${Date.now()}`,
            contentUrl: downloadURL,
            contentType: 'image',
            duration: 7, // 7 seconds
            timestamp: serverTimestamp(),
        };
        const storyDocRef = doc(db, "userStories", currentUser.id);
        const docSnap = await getDoc(storyDocRef);
        if (docSnap.exists()) {
            await updateDoc(storyDocRef, { stories: arrayUnion(newStory) });
        } else {
            await setDoc(storyDocRef, { stories: [newStory] });
        }
        handleCloseStoryCreator();
    } catch (error) {
        console.error("Error adding story:", error);
        alert("Failed to post story. Please check your connection and try again.");
    } finally {
        setIsSubmitting(false);
    }
  }, [currentUser]);

  const handleAddStoryComment = useCallback((storyId: string, commentText: string, authorId: string) => {
    console.log("Adding story comment to Firestore is not yet implemented.");
    handleUpdateUserPoints(authorId, 5);
  }, [handleUpdateUserPoints]);
  
  const handleAddStoryReaction = useCallback((storyId: string, authorId: string) => {
    console.log("Adding story reaction to Firestore is not yet implemented.");
    handleUpdateUserPoints(authorId, 2);
  }, [handleUpdateUserPoints]);
  
  const handleUpdateProfile = async (updatedData: Partial<User>) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
        const dataToSave = { ...updatedData };

        if (dataToSave.avatarUrl && dataToSave.avatarUrl.startsWith('data:')) {
          const avatarRef = ref(storage, `avatars/${currentUser.id}`);
          const snapshot = await uploadString(avatarRef, dataToSave.avatarUrl, 'data_url');
          dataToSave.avatarUrl = await getDownloadURL(snapshot.ref);
        }
        
        const userRef = doc(db, "users", currentUser.id);
        await updateDoc(userRef, dataToSave);
        setIsEditProfileOpen(false);
    } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleToggleAdmin = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    await updateDoc(doc(db, "users", userId), { isAdmin: !user.isAdmin });
  };

  const handleToggleBlock = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    await updateDoc(doc(db, "users", userId), { isBlocked: !user.isBlocked });
  };
  
  const handleToggleMute = async (userId: string) => {
     const user = users.find(u => u.id === userId);
    if (!user) return;
    await updateDoc(doc(db, "users", userId), { isMuted: !user.isMuted });
  };

  const handleAdminUpdateUserPoints = async (userId: string, newPoints: number) => {
    await updateDoc(doc(db, "users", userId), { points: Math.max(0, newPoints) });
  };
  
  const handleDeleteChatMessage = async (messageId: string) => {
    await deleteDoc(doc(db, "groupChat", messageId));
  };

  const handleDeletePost = async (postId: string) => {
    if(window.confirm('Are you sure you want to delete this content permanently?')) {
        await deleteDoc(doc(db, "posts", postId));
    }
  }

  const handleOpenProductComposer = (product: Product | null) => {
    setEditingProduct(product);
    setIsProductComposerOpen(true);
  };
  const handleCloseProductComposer = () => {
    setEditingProduct(null);
    setIsProductComposerOpen(false);
  };

  const handleAddProduct = async (productData: Omit<Product, 'id' | 'seller'>) => {
    if (!currentUser) return;
    await addDoc(collection(db, "products"), { ...productData, sellerId: currentUser.id });
    handleCloseProductComposer();
  };

  const handleUpdateProduct = async (productId: string, productData: Omit<Product, 'id' | 'seller'>) => {
    if (!currentUser) return;
    await updateDoc(doc(db, "products", productId), { ...productData, sellerId: currentUser.id });
    handleCloseProductComposer();
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
        await deleteDoc(doc(db, "products", productId));
    }
  };

  const handleUpdatePromoText = async (newText: string) => {
    const configRef = doc(db, "settings", "appConfig");
    try {
        await setDoc(configRef, { promoBannerText: newText }, { merge: true });
    } catch (error) {
        console.error("Failed to update promo text:", error);
        alert("Could not save the announcement. Please check the connection.");
    }
  };

  const handleViewProduct = useCallback((productId: string) => setViewedProductId(productId), []);
  const handleCloseProduct = useCallback(() => setViewedProductId(null), []);
  const handleOpenCart = useCallback(() => setIsCartOpen(true), []);
  const handleCloseCart = useCallback(() => setIsCartOpen(false), []);

  const handleAddToCart = useCallback((productToAdd: Product, selectedVariant: ProductVariant) => {
    setCart(prevCart => {
      const cartItemId = `${productToAdd.id}_${selectedVariant.type}_${selectedVariant.value}`;
      const existingItem = prevCart.find(item => item.cartItemId === cartItemId);
      if (existingItem) {
        return prevCart.map(item => item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prevCart, { product: productToAdd, quantity: 1, selectedVariant, cartItemId }];
    });
  }, []);

  const handleRemoveFromCart = useCallback((cartItemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
  }, []);

  const handleUpdateCartQuantity = useCallback((cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
        handleRemoveFromCart(cartItemId);
        return;
    }
    setCart(prevCart => prevCart.map(item => item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item));
  }, [handleRemoveFromCart]);

  const handleCheckout = useCallback(() => {
    if (cart.length === 0) return;
    alert(`Checkout complete! (This is a mock action)`);
    setCart([]);
    setIsCartOpen(false);
  }, [cart]);

  const handleToggleFollow = useCallback(async (userIdToToggle: string) => {
    if (!currentUser) return;
    const userDocRef = doc(db, "users", currentUser.id);
    const isFollowing = currentUser.following?.includes(userIdToToggle);
    await updateDoc(userDocRef, {
      following: isFollowing ? arrayRemove(userIdToToggle) : arrayUnion(userIdToToggle)
    });
  }, [currentUser]);
  
  const openChoiceModal = useCallback(() => setIsChoiceModalOpen(true), []);
  const closeChoiceModal = useCallback(() => setIsChoiceModalOpen(false), []);
  
  const openComposer = useCallback(() => {
    closeChoiceModal();
    setIsComposerOpen(true);
  }, [closeChoiceModal]);
  const closeComposer = useCallback(() => setIsComposerOpen(false), []);

  const openReelComposer = useCallback(() => {
    closeChoiceModal();
    setIsReelComposerOpen(true);
  }, [closeChoiceModal]);
  const closeReelComposer = useCallback(() => setIsReelComposerOpen(false), []);


  const handleAddPost = useCallback(async (caption: string, mediaFile: File | null, taggedUsernames: string[]) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
        let imageUrl: string | undefined = undefined;
        let videoUrl: string | undefined = undefined;
        
        if (mediaFile) {
            const mediaRef = ref(storage, `posts/${currentUser.id}/${Date.now()}_${mediaFile.name}`);
            const snapshot = await uploadBytes(mediaRef, mediaFile);
            const downloadURL = await getDownloadURL(snapshot.ref);
            if (mediaFile.type.startsWith('image/')) imageUrl = downloadURL;
            else if (mediaFile.type.startsWith('video/')) videoUrl = downloadURL;
        }

        const taggedUsers = users.filter(user => taggedUsernames.includes(user.username));
        const newPost = {
          authorId: currentUser.id,
          caption,
          imageUrl,
          videoUrl,
          taggedUsers: taggedUsers.map(u => u.id),
          likes: 0,
          reposts: 0,
          comments: [],
          timestamp: serverTimestamp(),
          type: 'post',
        };
        await addDoc(collection(db, "posts"), newPost);
        closeComposer();
        setActivePage(Page.Home);
    } catch (error) {
        console.error("Error creating post:", error);
        alert("Failed to create post. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  }, [currentUser, closeComposer, users]);

  const handleAddReel = useCallback(async (videoFile: File, caption: string, taggedUsernames: string[]) => {
     if (!currentUser) return;
     setIsSubmitting(true);
     try {
         const mediaRef = ref(storage, `reels/${currentUser.id}/${Date.now()}_${videoFile.name}`);
         const snapshot = await uploadBytes(mediaRef, videoFile);
         const videoUrl = await getDownloadURL(snapshot.ref);

         const taggedUsers = users.filter(user => taggedUsernames.includes(user.username));
         const newReel = {
            authorId: currentUser.id,
            caption,
            videoUrl,
            taggedUsers: taggedUsers.map(u => u.id),
            likes: 0,
            reposts: 0,
            comments: [],
            timestamp: serverTimestamp(),
            type: 'reel',
         };
         await addDoc(collection(db, "posts"), newReel);
         closeReelComposer();
         setIsReelsViewerOpen(true);
     } catch (error) {
        console.error("Error creating reel:", error);
        alert("Failed to create reel. Please try again.");
     } finally {
        setIsSubmitting(false);
     }
  }, [currentUser, closeReelComposer, users]);


  const handleRepost = useCallback((postToRepost: Post) => {
    if (!currentUser) return;
    console.log("Reposting to Firestore is not yet implemented.");
  }, [currentUser]);

  const handleViewProfile = useCallback((userId: string) => {
    setIsReelsViewerOpen(false);
    handleCloseStoryViewer();
    setViewedProfileId(userId);
    setActivePage(Page.Profile);
  }, [handleCloseStoryViewer]);
  
  const handleGoHome = useCallback(() => {
    setViewedProfileId(null);
    setActivePage(Page.Home)
  }, []);

  const handleSetActivePage = useCallback((page: Page) => {
    if (page === Page.Reels) {
      setIsReelsViewerOpen(true);
      return;
    }
    if (page === Page.Messages) {
        setIsReelsViewerOpen(false);
    }
    setViewedProfileId(null);
    setActivePage(page);
  }, []);

  const handleOpenComments = useCallback((post: Post) => {
    setCommentingOnPost(post);
  }, []);

  const handleCloseComments = useCallback(() => {
    setCommentingOnPost(null);
  }, []);

  const handleAddComment = useCallback(async (postId: string, text: string, parentId?: string) => {
    if (!currentUser) return;
    const newComment: Omit<Comment, 'user'|'replies'> = {
      id: `c${Date.now()}`,
      userId: currentUser.id,
      text,
      likes: 0,
    };
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, { comments: arrayUnion(newComment) });
  }, [currentUser]);

  const handleSendMessage = useCallback(async (messageContent: { text?: string; stickerUrl?: string; mediaFile?: File }) => {
    if (!currentUser) return;
    const newMessageData: { senderId: string, timestamp: any, text?: string, stickerUrl?: string, imageUrl?: string, videoUrl?: string } = {
      senderId: currentUser.id,
      timestamp: serverTimestamp(),
    };
    
    if (messageContent.text) newMessageData.text = messageContent.text;
    if (messageContent.stickerUrl) newMessageData.stickerUrl = messageContent.stickerUrl;
    
    if (messageContent.mediaFile) {
        const file = messageContent.mediaFile;
        const mediaRef = ref(storage, `chat/${currentUser.id}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(mediaRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        if (file.type.startsWith('image/')) newMessageData.imageUrl = downloadURL;
        else if (file.type.startsWith('video/')) newMessageData.videoUrl = downloadURL;
    }
    
    await addDoc(collection(db, "groupChat"), newMessageData);
  }, [currentUser]);

  const handleCreateSticker = useCallback((stickerDataUrl: string) => {
    setUserStickers(prev => [stickerDataUrl, ...prev]);
    setIsStickerCreatorOpen(false);
  }, []);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
        const aIsFollowed = currentUser?.following?.includes(a.author.id);
        const bIsFollowed = currentUser?.following?.includes(b.author.id);
        if (aIsFollowed && !bIsFollowed) return -1;
        if (!aIsFollowed && bIsFollowed) return 1;
        const aTimestamp = a.timestamp?.seconds || 0;
        const bTimestamp = b.timestamp?.seconds || 0;
        return bTimestamp - aTimestamp;
    });
  }, [posts, currentUser]);

  const reels = useMemo(() => posts.filter(p => p.type === 'reel'), [posts]);
  
  const viewedProduct = useMemo(() => {
    if (!viewedProductId) return null;
    return products.find(p => p.id === viewedProductId);
  }, [viewedProductId, products]);
  
  const allCategories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);
  const [activeShopCategory, setActiveShopCategory] = useState('All');
  const filteredProducts = useMemo(() => {
      if(activeShopCategory === 'All') return products;
      return products.filter(p => p.category === activeShopCategory);
  }, [products, activeShopCategory]);

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    );
  }

  if (!currentUser) {
    let pageContent;
    switch (authPage) {
        case 'signup':
            pageContent = <SignUpScreen onSwitchToLogin={() => setAuthPage('login')} users={users}/>;
            break;
        case 'forgotPassword':
            pageContent = <ForgotPasswordScreen onSwitchToLogin={() => setAuthPage('login')} />;
            break;
        case 'login':
        default:
            pageContent = <LoginScreen onSwitchToSignUp={() => setAuthPage('signup')} onSwitchToForgotPassword={() => setAuthPage('forgotPassword')} />;
            break;
    }
    return (
        <div className="auth-container min-h-screen flex items-center justify-center p-4">
            {pageContent}
        </div>
    );
  }

  const renderContent = () => {
    switch (activePage) {
      case Page.Home:
        return <>
            <Header onNotificationClick={() => setActivePage(Page.Notifications)} onSearchClick={() => setActivePage(Page.Search)} />
            <StoryTray userStories={userStories} onViewStories={handleViewStories} currentUser={currentUser} onAddStory={handleOpenStoryCreator} topUsers={topUsers}/>
            <PromoBanner text={promoText} />
            <Feed posts={sortedPosts} onViewProfile={handleViewProfile} currentUser={currentUser} onCommentClick={handleOpenComments} onRepost={handleRepost} onToggleFollow={handleToggleFollow} topUsers={topUsers} />
        </>;
      case Page.Search:
        return <>
            <Header onNotificationClick={() => setActivePage(Page.Notifications)} onSearchClick={() => setActivePage(Page.Search)} />
            <SearchScreen users={users} posts={posts} onViewProfile={handleViewProfile} />
        </>;
       case Page.Notifications:
        return <>
            <Header onNotificationClick={() => setActivePage(Page.Notifications)} onSearchClick={() => setActivePage(Page.Search)} />
            <NotificationsScreen notifications={notifications} onViewProfile={handleViewProfile} />
        </>;
      case Page.Profile:
        return <Profile users={users} posts={posts} viewedProfileId={viewedProfileId} currentUser={currentUser} onGoBack={handleGoHome} onViewProfile={handleViewProfile} onCommentClick={handleOpenComments} onRepost={handleRepost} onToggleFollow={handleToggleFollow} topUsers={topUsers} onLogout={handleLogout} onEditProfile={() => setIsEditProfileOpen(true)} />;
      case Page.Messages:
        return <ChatScreen messages={groupChatMessages} currentUser={currentUser} onSendMessage={handleSendMessage} onGoBack={handleGoHome} userStickers={userStickers} onOpenStickerCreator={() => setIsStickerCreatorOpen(true)} allUsers={users} topUsers={topUsers} onlineMembersCount={onlineUsersCount} />;
      case Page.Shop:
        return <ShopScreen products={filteredProducts} onProductClick={handleViewProduct} onCartClick={handleOpenCart} cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)} currentUser={currentUser} onAddProduct={() => handleOpenProductComposer(null)} categories={allCategories} activeCategory={activeShopCategory} onSelectCategory={setActiveShopCategory} />;
      default:
        return <Header onNotificationClick={() => {}} onSearchClick={() => {}}/>;
    }
  };

  return (
    <div className="app-container bg-transparent min-h-screen">
      {activePage !== Page.Messages && 
        <AppNavBar 
            activePage={activePage} 
            setActivePage={handleSetActivePage} 
            onComposeClick={openChoiceModal}
            currentUser={currentUser}
        />
      }
      
      <main className="app-main-content w-full pb-20 md:pb-0">
        {renderContent()}
      </main>

      {isEditProfileOpen && <EditProfileScreen currentUser={currentUser} onClose={() => setIsEditProfileOpen(false)} onSave={handleUpdateProfile} isSubmitting={isSubmitting} />}
      {isStoryCreatorOpen && <StoryCreator onClose={handleCloseStoryCreator} onStoryCreated={handleAddStory} isSubmitting={isSubmitting} />}
       {viewingStoriesOfUser && (
        <StoryViewer 
            userStories={viewingStoriesOfUser}
            currentUser={currentUser}
            onClose={handleCloseStoryViewer}
            onNextUser={() => handleStoryNavigation('next')}
            onPrevUser={() => handleStoryNavigation('prev')}
            onViewProfile={handleViewProfile}
            onAddComment={handleAddStoryComment}
            onAddReaction={handleAddStoryReaction}
        />
       )}
      {isAdminDashboardOpen && (
          <AdminDashboard 
            position={dashboardPosition}
            setPosition={setDashboardPosition}
            onClose={() => setIsAdminDashboardOpen(false)}
            products={products} 
            users={users}
            chatMessages={groupChatMessages}
            posts={posts}
            onEditProduct={handleOpenProductComposer}
            onDeleteProduct={handleDeleteProduct}
            onDeletePost={handleDeletePost}
            onToggleAdmin={handleToggleAdmin}
            onToggleBlock={handleToggleBlock}
            onToggleMute={handleToggleMute}
            onUpdateUserPoints={handleAdminUpdateUserPoints}
            onDeleteChatMessage={handleDeleteChatMessage}
            onUpdatePromoText={handleUpdatePromoText}
        />
      )}
      {isCartOpen && <CartScreen cart={cart} onClose={handleCloseCart} onUpdateQuantity={handleUpdateCartQuantity} onRemoveItem={handleRemoveFromCart} onCheckout={handleCheckout} />}
      {viewedProduct && <ProductDetailModal product={viewedProduct} onClose={handleCloseProduct} onAddToCart={handleAddToCart} />}
      {isStickerCreatorOpen && <StickerCreator onClose={() => setIsStickerCreatorOpen(false)} onStickerCreated={handleCreateSticker} />}
      {isProductComposerOpen && <ProductComposer 
          onClose={handleCloseProductComposer} 
          onSave={editingProduct ? (data) => handleUpdateProduct(editingProduct.id, data) : handleAddProduct}
          productToEdit={editingProduct} 
        />
      }
      {isReelsViewerOpen && (
        <ReelsViewer
          reels={reels}
          onClose={() => setIsReelsViewerOpen(false)}
          onViewProfile={handleViewProfile}
          onCommentClick={handleOpenComments}
          onRepost={handleRepost}
          currentUser={currentUser}
          onToggleFollow={handleToggleFollow}
          topUsers={topUsers}
        />
      )}
      {isChoiceModalOpen && <CreationChoiceModal onClose={closeChoiceModal} onSelectPost={openComposer} onSelectReel={openReelComposer} />}
      {isComposerOpen && <Composer onClose={closeComposer} onPostSubmit={handleAddPost} allUsers={users} currentUser={currentUser} isSubmitting={isSubmitting} />}
      {isReelComposerOpen && <ReelComposer onClose={closeReelComposer} onReelSubmit={handleAddReel} allUsers={users} currentUser={currentUser} isSubmitting={isSubmitting} />}
      {commentingOnPost && 
        <CommentSheet 
            post={commentingOnPost} 
            onClose={handleCloseComments}
            onAddComment={handleAddComment}
            currentUser={currentUser}
            onToggleFollow={handleToggleFollow}
        />
      }
      
      {currentUser.isAdmin && (
         <button
            onClick={() => setIsAdminDashboardOpen(prev => !prev)}
            className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center text-black shadow-lg hover:bg-yellow-400 active:bg-yellow-600 transition-all transform hover:scale-105 active:scale-95"
            aria-label="Open Admin Dashboard"
         >
             <DashboardIcon className="w-7 h-7" filled={false}/>
         </button>
      )}
    </div>
  );
};

export default App;
