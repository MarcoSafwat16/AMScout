
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Product, User, Message, Post } from '../types';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import BlockIcon from './icons/BlockIcon';
import MuteIcon from './icons/MuteIcon';
import CoinIcon from './icons/CoinIcon';

interface AdminDashboardProps {
    position: { x: number, y: number };
    setPosition: (pos: { x: number, y: number }) => void;
    onClose: () => void;
    products: Product[];
    users: User[];
    chatMessages: Message[];
    posts: Post[];
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (productId: string) => void;
    onDeletePost: (postId: string) => void;
    onToggleAdmin: (userId: string) => void;
    onToggleBlock: (userId: string) => void;
    onToggleMute: (userId: string) => void;
    onUpdateUserPoints: (userId: string, newPoints: number) => void;
    onDeleteChatMessage: (messageId: string) => void;
    onUpdatePromoText: (newText: string) => void;
}

type Tab = 'overview' | 'users' | 'content' | 'chat' | 'shop' | 'announcements';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-zinc-800/70 p-4 rounded-lg flex items-center gap-4">
        <div className="text-3xl p-2 bg-zinc-700/80 rounded-lg flex items-center justify-center h-12 w-12">{icon}</div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const { 
        position, setPosition, onClose,
        products, users, chatMessages, posts,
        onEditProduct, onDeleteProduct, onDeletePost, onToggleAdmin, onToggleBlock,
        onToggleMute, onUpdateUserPoints, onDeleteChatMessage, onUpdatePromoText
    } = props;

    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [promoText, setPromoText] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const dragStartOffset = useRef({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { onlineUsersCount, totalSales } = useMemo(() => {
        const onlineCount = users.filter(u => u.isOnline).length;
        const sales = (products.reduce((sum, p) => sum + p.price, 0) * 3.5).toFixed(2);
        return { onlineUsersCount: onlineCount, totalSales: sales };
    }, [users, products]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile) return;
        setIsDragging(true);
        dragStartOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        const newX = e.clientX - dragStartOffset.current.x;
        const newY = e.clientY - dragStartOffset.current.y;
        setPosition({ x: newX, y: newY });
    }, [isDragging, setPosition]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);


    const handleUpdatePoints = (user: User) => {
        const currentPoints = user.points || 0;
        const input = prompt(`Update points for ${user.username}:\nUse + or - to add/subtract (e.g., +100 or -50).`, currentPoints.toString());
        if (input === null) return;

        let newPoints = parseInt(input, 10);
        if (isNaN(newPoints)) {
            if (input.startsWith('+')) {
                newPoints = currentPoints + parseInt(input.substring(1), 10);
            } else if (input.startsWith('-')) {
                newPoints = currentPoints - parseInt(input.substring(1), 10);
            } else {
                alert('Invalid input. Please enter a number, or use + or - prefixes.');
                return;
            }
        }
        
        if (!isNaN(newPoints)) {
            onUpdateUserPoints(user.id, newPoints);
        } else {
             alert('Invalid input format.');
        }
    };

    const handlePromoUpdate = () => {
        if (promoText.trim()) {
            onUpdatePromoText(promoText);
            alert("Promotional banner updated!");
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StatCard title="Total Users" value={users.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                        <StatCard title="Online Now" value={onlineUsersCount} icon={<span className="block h-5 w-5 rounded-full bg-green-500"></span>} />
                        <StatCard title="Total Products" value={products.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} />
                        <StatCard title="Total Sales (Mock)" value={`$${totalSales}`} icon={<CoinIcon className="h-6 w-6" />} />
                     </div>
                );
            case 'users':
                return (
                     <div className="bg-zinc-800/70 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-700/80 text-xs uppercase">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">User</th>
                                        <th scope="col" className="px-4 py-3">Status</th>
                                        <th scope="col" className="px-4 py-3">Points</th>
                                        <th scope="col" className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className={`border-b border-zinc-700 ${user.isBlocked ? 'bg-red-900/30' : 'hover:bg-zinc-700/50'}`}>
                                            <th scope="row" className="px-4 py-3 font-medium whitespace-nowrap flex items-center gap-3">
                                                <div className="relative">
                                                    <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 object-cover rounded-full" />
                                                    {user.isOnline && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-zinc-800"></span>}
                                                </div>
                                                {user.username}
                                            </th>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {user.isAdmin && <span title="Admin" className="p-1 bg-yellow-500/20 rounded-full"><ShieldCheckIcon className="w-4 h-4 text-yellow-400"/></span>}
                                                    {user.isBlocked && <span title="Blocked" className="p-1 bg-red-500/20 rounded-full"><BlockIcon className="w-4 h-4 text-red-400"/></span>}
                                                    {user.isMuted && <span title="Muted" className="p-1 bg-orange-500/20 rounded-full"><MuteIcon className="w-4 h-4 text-orange-400"/></span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-mono">{user.points || 0}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <button onClick={() => onToggleAdmin(user.id)} className="font-medium text-yellow-400 hover:underline">Admin</button>
                                                    <button onClick={() => onToggleBlock(user.id)} className="font-medium text-red-400 hover:underline">Block</button>
                                                    <button onClick={() => onToggleMute(user.id)} className="font-medium text-orange-400 hover:underline">Mute</button>
                                                    <button onClick={() => handleUpdatePoints(user)} className="font-medium text-green-400 hover:underline">Points</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     </div>
                );
             case 'content':
                return (
                    <div className="bg-zinc-800/70 rounded-lg p-2 h-full flex flex-col">
                        <h3 className="text-md font-bold mb-2 px-2">Content Moderation</h3>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                           {posts.map(post => (
                                <div key={post.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-zinc-700/50">
                                    <div className="flex-shrink-0">
                                      {post.imageUrl && <img src={post.imageUrl} className="w-12 h-12 object-cover rounded-md bg-zinc-700" />}
                                      {post.videoUrl && <video src={post.videoUrl} className="w-12 h-12 object-cover rounded-md bg-zinc-700" />}
                                      {!post.imageUrl && !post.videoUrl && post.originalPost && <img src={post.originalPost.imageUrl} className="w-12 h-12 object-cover rounded-md bg-zinc-700" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-400">by @{post.author.username} • {post.type}</p>
                                        <p className="text-sm text-gray-200 truncate">{post.caption || (post.originalPost ? `Shared: ${post.originalPost.caption}`: '[No Caption]')}</p>
                                    </div>
                                    <button onClick={() => onDeletePost(post.id)} className="text-xs text-red-400 hover:underline bg-red-500/10 px-2 py-1 rounded-md">Delete</button>
                                </div>
                           ))}
                        </div>
                    </div>
                );
            case 'chat':
                return (
                    <div className="bg-zinc-800/70 rounded-lg p-2 h-full flex flex-col">
                        <h3 className="text-md font-bold mb-2 px-2">Global Chat Moderation</h3>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                           {chatMessages.map(msg => (
                                <div key={msg.id} className="flex items-start gap-2 p-1.5 rounded-md hover:bg-zinc-700/50">
                                    <img src={msg.sender.avatarUrl} alt={msg.sender.username} className="w-8 h-8 rounded-full flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline">
                                            <p className="font-semibold text-sm">{msg.sender.username}</p>
                                            <button onClick={() => onDeleteChatMessage(msg.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                                        </div>
                                        <p className="text-sm text-gray-300">{msg.text || (msg.imageUrl ? '[Image]' : '[Sticker]')}</p>
                                    </div>
                                </div>
                           ))}
                        </div>
                    </div>
                );
            case 'shop':
                return (
                     <div className="bg-zinc-800/70 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-700/80 text-xs uppercase">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Product Name</th>
                                        <th scope="col" className="px-4 py-3">Category</th>
                                        <th scope="col" className="px-4 py-3">Price</th>
                                        <th scope="col" className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product.id} className="border-b border-zinc-700 hover:bg-zinc-700/50">
                                            <th scope="row" className="px-4 py-3 font-medium whitespace-nowrap flex items-center gap-3">
                                                <img src={product.imageUrls[0]} alt={product.name} className="w-10 h-10 object-cover rounded-md" />
                                                {product.name}
                                            </th>
                                            <td className="px-4 py-3">{product.category}</td>
                                            <td className="px-4 py-3">${product.price.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => onEditProduct(product)} className="font-medium text-blue-400 hover:underline text-xs">Edit</button>
                                                    <button onClick={() => onDeleteProduct(product.id)} className="font-medium text-red-400 hover:underline text-xs">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                         {products.length === 0 && <p className="text-center p-8 text-gray-500">No products found. Add one from the Shop page.</p>}
                    </div>
                );
            case 'announcements':
                return (
                    <div className="bg-zinc-800/70 rounded-lg p-4">
                        <h3 className="text-md font-bold mb-2">Update Promo Banner</h3>
                        <p className="text-xs text-gray-400 mb-4">This text will scroll at the top of the main feed for all users.</p>
                        <textarea 
                            value={promoText}
                            onChange={(e) => setPromoText(e.target.value)}
                            rows={4}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-[#0c3a99] focus:outline-none"
                            placeholder="Enter new announcement text..."
                        />
                        <button onClick={handlePromoUpdate} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm">Update Banner</button>
                    </div>
                );
        }
    }

    return (
        <div 
            className="fixed inset-0 w-full h-full bg-zinc-900/80 backdrop-blur-lg flex flex-col z-50 text-white md:inset-auto md:w-[600px] md:max-w-[95vw] md:h-[75vh] md:border md:border-white/10 md:rounded-2xl md:shadow-2xl"
            style={isMobile ? {} : { top: position.y, left: position.x }}
        >
            <header 
                className={`p-3 flex justify-between items-center border-b border-gray-700 ${!isMobile ? 'cursor-move' : ''}`}
                onMouseDown={handleMouseDown}
            >
                <h1 className="text-lg font-bold">Admin Dashboard</h1>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </header>

            <div className="px-4 border-b border-gray-700">
                <nav className="flex space-x-2 overflow-x-auto no-scrollbar">
                    <button onClick={() => setActiveTab('overview')} className={`py-2 px-1 text-sm font-semibold ${activeTab === 'overview' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>Overview</button>
                    <button onClick={() => setActiveTab('users')} className={`py-2 px-1 text-sm font-semibold ${activeTab === 'users' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>Users</button>
                    <button onClick={() => setActiveTab('content')} className={`py-2 px-1 text-sm font-semibold ${activeTab === 'content' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>Content</button>
                    <button onClick={() => setActiveTab('chat')} className={`py-2 px-1 text-sm font-semibold ${activeTab === 'chat' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>Chat</button>
                    <button onClick={() => setActiveTab('shop')} className={`py-2 px-1 text-sm font-semibold ${activeTab === 'shop' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>Shop</button>
                    <button onClick={() => setActiveTab('announcements')} className={`py-2 px-1 text-sm font-semibold ${activeTab === 'announcements' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>Announcements</button>
                </nav>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
               {renderContent()}
            </div>
        </div>
    );
};

export default AdminDashboard;