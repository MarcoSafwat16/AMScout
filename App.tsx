import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Page, User, Post, Comment, Message, Product, CartItem, ProductVariant, UserStories, Story, Reaction, Notification } from './types';
import AppNavBar from './components/BottomNavBar';
import Feed from './components/Feed';
import Header from './components/Header';
import Composer from './components/Composer';
import Profile from './components/Profile';
import { mockPosts as initialMockPosts, mockUserStories as initialMockUserStories, mockGroupChatMessages, mockUserStickers, mockProducts as initialMockProducts, mockNotifications as initialMockNotifications } from './hooks/useMockData';
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
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from "firebase/firestore";


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
  const [posts, setPosts] = useState<Post[]>(initialMockPosts);
  const [commentingOnPost, setCommentingOnPost] = useState<Post | null>(null);
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set(['u2', 'u3']));
  const [promoText, setPromoText] = useState("✨ Welcome to the new AMScout! Follow your favorite creators and discover amazing content. ✨");
  const [groupChatMessages, setGroupChatMessages] = useState<Message[]>(mockGroupChatMessages);
  const [userStickers, setUserStickers] = useState<string[]>(mockUserStickers);
  const [isStickerCreatorOpen, setIsStickerCreatorOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialMockNotifications);

  // Stories State
  const [userStories, setUserStories] = useState<UserStories[]>(initialMockUserStories);
  const [viewingStoriesOfUser, setViewingStoriesOfUser] = useState<UserStories | null>(null);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  
  // E-commerce & Admin state
  const [products, setProducts] = useState<Product[]>(initialMockProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [viewedProductId, setViewedProductId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductComposerOpen, setIsProductComposerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [dashboardPosition, setDashboardPosition] = useState({ x: window.innerWidth / 2 - 250, y: 100 });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            setCurrentUser({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
            console.error("User data not found in Firestore.");
            setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
        try {
            const usersCollection = collection(db, "users");
            const userSnapshot = await getDocs(usersCollection);
            const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(userList);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };
    fetchUsers();
  }, [currentUser]); // Refetch users when auth state changes (e.g., new user signs up)


  const topUsers = useMemo(() => {
    return [...users]
        .sort((a, b) => (b.points || 0) - (a.points || 0))
        .slice(0, 3)
        .map(u => u.id);
  }, [users]);

  const handleUpdateUserPoints = useCallback((userId: string, pointsToAdd: number) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, points: (u.points || 0) + pointsToAdd } : u));
  }, []);

  // --- Start Auth Handlers ---
  const handleLogout = () => {
    signOut(auth).catch(error => console.error("Logout failed", error));
  }
  // --- End Auth Handlers ---


  // --- Start Story Handlers ---
  const handleViewStories = useCallback((userStoriesToShow: UserStories) => {
    if (!currentUser) return;
    setViewingStoriesOfUser(userStoriesToShow);
    setUserStories(prev => prev.map(us => us.user.id === userStoriesToShow.user.id ? {...us, hasUnseen: false} : us));
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
  
  const handleAddStory = useCallback((imageDataUrl: string) => {
     if (!currentUser) return;
     const newStory: Story = {
       id: `s${Date.now()}`,
       contentUrl: imageDataUrl,
       contentType: 'image',
       duration: 5,
       timestamp: new Date(),
       comments: [],
       reactions: [],
     };

     setUserStories(prev => {
       const currentUserStoriesIndex = prev.findIndex(us => us.user.id === currentUser.id);
       if (currentUserStoriesIndex > -1) {
         const updatedStories = [...prev];
         const currentUserStories = updatedStories[currentUserStoriesIndex];
         updatedStories[currentUserStoriesIndex] = {
           ...currentUserStories,
           stories: [...currentUserStories.stories, newStory],
           hasUnseen: false, 
         };
         return updatedStories;
       } else {
         const newUserStory: UserStories = {
            user: currentUser,
            stories: [newStory],
            hasUnseen: false,
         };
         return [newUserStory, ...prev];
       }
     });
     
     handleCloseStoryCreator();
     const updatedUserStories = userStories.find(us => us.user.id === currentUser.id);
     const stories = updatedUserStories ? [...updatedUserStories.stories, newStory] : [newStory];
     setViewingStoriesOfUser({ user: currentUser, stories, hasUnseen: false });

  }, [currentUser, userStories]);

  const handleAddStoryComment = useCallback((storyId: string, commentText: string, authorId: string) => {
    if (!currentUser) return;
    const newComment: Omit<Comment, 'replies' | 'likes'> = {
      id: `sc${Date.now()}`,
      user: currentUser,
      text: commentText,
    };

    let updatedViewingUserStories: UserStories | null = null;

    const updatedUserStories = userStories.map(userStory => {
      const storyIndex = userStory.stories.findIndex(s => s.id === storyId);
      if (storyIndex > -1) {
        const updatedStories = [...userStory.stories];
        const targetStory = updatedStories[storyIndex];
        updatedStories[storyIndex] = {
          ...targetStory,
          comments: [...(targetStory.comments || []), newComment as Comment],
        };
        const finalUserStory = { ...userStory, stories: updatedStories };
        if (userStory.user.id === viewingStoriesOfUser?.user.id) {
            updatedViewingUserStories = finalUserStory;
        }
        return finalUserStory;
      }
      return userStory;
    });

    setUserStories(updatedUserStories);
    if(updatedViewingUserStories) {
        setViewingStoriesOfUser(updatedViewingUserStories);
    }
    
    handleUpdateUserPoints(authorId, 5);
  }, [currentUser, userStories, viewingStoriesOfUser?.user.id, handleUpdateUserPoints]);
  
  const handleAddStoryReaction = useCallback((storyId: string, authorId: string) => {
    if (!currentUser) return;
    const newReaction: Reaction = { user: currentUser, type: 'like' };
    
    let updatedViewingUserStories: UserStories | null = null;

    const updatedUserStories = userStories.map(userStory => {
      const storyIndex = userStory.stories.findIndex(s => s.id === storyId);
      if (storyIndex > -1) {
        const updatedStories = [...userStory.stories];
        const targetStory = updatedStories[storyIndex];
        
        const existingReaction = targetStory.reactions?.find(r => r.user.id === currentUser.id);
        if (existingReaction) return userStory;
        
        updatedStories[storyIndex] = {
          ...targetStory,
          reactions: [...(targetStory.reactions || []), newReaction],
        };

        const finalUserStory = { ...userStory, stories: updatedStories };
        if (userStory.user.id === viewingStoriesOfUser?.user.id) {
            updatedViewingUserStories = finalUserStory;
        }
        
        handleUpdateUserPoints(authorId, 2);
        
        return finalUserStory;
      }
      return userStory;
    });

    setUserStories(updatedUserStories);
    if(updatedViewingUserStories) {
        setViewingStoriesOfUser(updatedViewingUserStories);
    }
  }, [currentUser, userStories, viewingStoriesOfUser?.user.id, handleUpdateUserPoints]);

  // --- End Story Handlers ---
  
  // --- Start Admin Handlers ---
  const handleToggleAdmin = (userId: string) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u));
  };

  const handleToggleBlock = (userId: string) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
  };
  
  const handleToggleMute = (userId: string) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, isMuted: !u.isMuted } : u));
  };

  const handleAdminUpdateUserPoints = (userId: string, newPoints: number) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, points: Math.max(0, newPoints) } : u));
  };
  
  const handleDeleteChatMessage = (messageId: string) => {
    setGroupChatMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const handleDeletePost = (postId: string) => {
    if(window.confirm('Are you sure you want to delete this content?')) {
        setPosts(prev => prev.filter(p => p.id !== postId));
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

  const handleAddProduct = (productData: Omit<Product, 'id' | 'seller'>) => {
    if (!currentUser) return;
    const newProduct: Product = {
        ...productData,
        id: `prod${Date.now()}`,
        seller: currentUser,
    };
    setProducts(prev => [newProduct, ...prev]);
    handleCloseProductComposer();
  };

  const handleUpdateProduct = (productId: string, productData: Omit<Product, 'id' | 'seller'>) => {
    if (!currentUser) return;
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...productData, seller: currentUser } : p));
    handleCloseProductComposer();
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
        setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleUpdatePromoText = (newText: string) => {
    setPromoText(newText);
  };
  // --- End Admin Handlers ---

  // Shop Handlers
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


  const handleToggleFollow = useCallback((userIdToToggle: string) => {
    setFollowedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userIdToToggle)) {
        newSet.delete(userIdToToggle);
      } else {
        newSet.add(userIdToToggle);
      }
      return newSet;
    });
  }, []);
  
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


  const handleAddPost = useCallback((caption: string, mediaFile: File | null, taggedUsernames: string[]) => {
    if (!currentUser) return;
    let imageUrl: string | undefined = undefined;
    let videoUrl: string | undefined = undefined;

    if (mediaFile) {
        const url = URL.createObjectURL(mediaFile);
        if (mediaFile.type.startsWith('image/')) {
            imageUrl = url;
        } else if (mediaFile.type.startsWith('video/')) {
            videoUrl = url;
        }
    }
    
    const taggedUsers = users.filter(user => taggedUsernames.includes(user.username));

    const newPost: Post = {
      id: `p${Date.now()}`,
      author: currentUser,
      caption,
      imageUrl,
      videoUrl,
      taggedUsers,
      likes: 0,
      reposts: 0,
      comments: [],
      timestamp: 'Just now',
      type: 'post',
    };

    setPosts(prevPosts => [newPost, ...prevPosts]);
    closeComposer();
    setActivePage(Page.Home);
  }, [currentUser, closeComposer, users]);

  const handleAddReel = useCallback((videoFile: File, caption: string, taggedUsernames: string[]) => {
     if (!currentUser) return;
     const videoUrl = URL.createObjectURL(videoFile);
     const taggedUsers = users.filter(user => user.username.toLowerCase().includes(user.username.toLowerCase()));

     const newReel: Post = {
        id: `r${Date.now()}`,
        author: currentUser,
        caption,
        videoUrl,
        taggedUsers,
        likes: 0,
        reposts: 0,
        comments: [],
        timestamp: 'Just now',
        type: 'reel',
     };

     setPosts(prevPosts => [newReel, ...prevPosts]);
     closeReelComposer();
     setIsReelsViewerOpen(true);
  }, [currentUser, closeReelComposer, users]);


  const handleRepost = useCallback((postToRepost: Post) => {
    if (!currentUser) return;
    setPosts(prevPosts => {
        const updatedPosts = prevPosts.map(p => {
           const originalPost = p.originalPost || p;
           if (originalPost.id === postToRepost.id) {
               return { ...p, reposts: p.reposts + 1 };
           }
           return p;
        });
        
        const newRepost: Post = {
          id: `p${Date.now()}`,
          author: currentUser,
          caption: '', // Simple repost
          likes: 0,
          reposts: 0,
          comments: [],
          timestamp: 'Just now',
          originalPost: postToRepost,
        };
        return [newRepost, ...updatedPosts];
    });
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
    setViewedProfileId(null);
    setActivePage(page);
  }, []);

  const handleOpenComments = useCallback((post: Post) => {
    setCommentingOnPost(post);
  }, []);

  const handleCloseComments = useCallback(() => {
    setCommentingOnPost(null);
  }, []);

  const handleAddComment = useCallback((postId: string, text: string, parentId?: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: `c${Date.now()}`,
      user: currentUser,
      text,
      likes: 0,
      replies: [],
    };

    const addReplyToComment = (comments: Comment[], pId: string): Comment[] => {
      return comments.map(comment => {
        if (comment.id === pId) {
          return { ...comment, replies: [newComment, ...(comment.replies || [])] };
        }
        if (comment.replies && comment.replies.length > 0) {
          return { ...comment, replies: addReplyToComment(comment.replies, pId) };
        }
        return comment;
      });
    };

    setPosts(currentPosts => currentPosts.map(p => {
      if (p.id === postId) {
        const updatedComments = parentId ? addReplyToComment(p.comments, parentId) : [newComment, ...p.comments];
        const updatedPost = { ...p, comments: updatedComments };
        setCommentingOnPost(updatedPost);
        return updatedPost;
      }
      return p;
    }));
  }, [currentUser]);

  const handleSendMessage = useCallback((messageContent: Omit<Message, 'sender' | 'id' | 'timestamp'>) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: `m${Date.now()}`,
      sender: currentUser,
      ...messageContent,
      timestamp: new Date(),
    };
    setGroupChatMessages(prevMessages => [...prevMessages, newMessage]);
  }, [currentUser]);

  const handleCreateSticker = useCallback((stickerDataUrl: string) => {
    setUserStickers(prev => [stickerDataUrl, ...prev]);
    setIsStickerCreatorOpen(false);
  }, []);


  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
        const aIsFollowed = followedUserIds.has(a.author.id);
        const bIsFollowed = followedUserIds.has(b.author.id);
        if (aIsFollowed && !bIsFollowed) return -1;
        if (!aIsFollowed && bIsFollowed) return 1;
        return 0; 
    });
  }, [posts, followedUserIds]);

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
            <Feed posts={sortedPosts} onViewProfile={handleViewProfile} currentUserId={currentUser.id} onCommentClick={handleOpenComments} onRepost={handleRepost} followedUserIds={followedUserIds} onToggleFollow={handleToggleFollow} topUsers={topUsers} />
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
        return <Profile users={users} posts={posts} viewedProfileId={viewedProfileId} currentUserId={currentUser.id} onGoBack={handleGoHome} onViewProfile={handleViewProfile} onCommentClick={handleOpenComments} onRepost={handleRepost} followedUserIds={followedUserIds} onToggleFollow={handleToggleFollow} topUsers={topUsers} onLogout={handleLogout} />;
      case Page.Messages:
        return <ChatScreen messages={groupChatMessages} currentUser={currentUser} onSendMessage={handleSendMessage} onGoBack={handleGoHome} userStickers={userStickers} onOpenStickerCreator={() => setIsStickerCreatorOpen(true)} allUsers={users} topUsers={topUsers} />;
      case Page.Shop:
        return <ShopScreen products={filteredProducts} onProductClick={handleViewProduct} onCartClick={handleOpenCart} cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)} currentUser={currentUser} onAddProduct={() => handleOpenProductComposer(null)} categories={allCategories} activeCategory={activeShopCategory} onSelectCategory={setActiveShopCategory} />;
      default:
        return <Header onNotificationClick={() => {}} onSearchClick={() => {}}/>;
    }
  };

  return (
    <div className="app-container bg-transparent min-h-screen">
      <AppNavBar 
          activePage={activePage} 
          setActivePage={handleSetActivePage} 
          onComposeClick={openChoiceModal}
          currentUser={currentUser}
      />
      
      <main className="app-main-content w-full">
        {renderContent()}
      </main>

      {/* MODALS & OVERLAYS */}
       {isStoryCreatorOpen && <StoryCreator onClose={handleCloseStoryCreator} onStoryCreated={handleAddStory} />}
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
          followedUserIds={followedUserIds}
          onToggleFollow={handleToggleFollow}
          topUsers={topUsers}
        />
      )}
      {isChoiceModalOpen && <CreationChoiceModal onClose={closeChoiceModal} onSelectPost={openComposer} onSelectReel={openReelComposer} />}
      {isComposerOpen && <Composer onClose={closeComposer} onPostSubmit={handleAddPost} allUsers={users} currentUser={currentUser} />}
      {isReelComposerOpen && <ReelComposer onClose={closeReelComposer} onReelSubmit={handleAddReel} allUsers={users} currentUser={currentUser} />}
      {commentingOnPost && 
        <CommentSheet 
            post={commentingOnPost} 
            onClose={handleCloseComments}
            onAddComment={handleAddComment}
            currentUser={currentUser}
            followedUserIds={followedUserIds}
            onToggleFollow={handleToggleFollow}
        />
      }
      
      {/* Persistent UI */}
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