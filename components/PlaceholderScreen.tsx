
import React, { useState, useMemo } from 'react';
import { User, Post } from '../types';
import SearchIcon from './icons/SearchIcon';
import PostComponent from './Post'; // Assuming a simplified post view for search results

interface SearchScreenProps {
  users: User[];
  posts: Post[];
  onViewProfile: (userId: string) => void;
}

const Leaderboard: React.FC<{ users: User[], onViewProfile: (userId: string) => void }> = ({ users, onViewProfile }) => {
    const sortedUsers = [...users].sort((a, b) => (b.points || 0) - (a.points || 0));
    const topThree = sortedUsers.slice(0, 3);
    const others = sortedUsers.slice(3, 10);

    const rankColors = ['border-yellow-400', 'border-gray-400', 'border-amber-600'];

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Top Creators</h2>
            <div className="space-y-3">
            {topThree.map((user, index) => (
                <div key={user.id} className="bg-zinc-800 p-3 rounded-lg flex items-center gap-4 border-l-4" style={{ borderColor: rankColors[index].split('-')[1] }}>
                <span className="font-bold text-lg w-6 text-center">{index + 1}</span>
                <img src={user.avatarUrl} alt={user.username} className={`w-12 h-12 rounded-full border-2 ${rankColors[index]}`} />
                <div className="flex-1">
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-sm text-yellow-400 font-mono">{(user.points || 0).toLocaleString()} PTS</p>
                </div>
                <button onClick={() => onViewProfile(user.id)} className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    View
                </button>
                </div>
            ))}
            {others.map((user, index) => (
                <div key={user.id} className="bg-zinc-800/50 p-3 rounded-lg flex items-center gap-4">
                <span className="font-semibold text-md w-6 text-center text-gray-400">{index + 4}</span>
                <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-xs text-gray-400 font-mono">{(user.points || 0).toLocaleString()} PTS</p>
                </div>
                <button onClick={() => onViewProfile(user.id)} className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    View
                </button>
                </div>
            ))}
            </div>
      </div>
    );
}

const SearchScreen: React.FC<SearchScreenProps> = ({ users, posts, onViewProfile }) => {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    const lowercasedQuery = query.toLowerCase().trim();
    if (!lowercasedQuery) {
      return null;
    }

    const filteredUsers = users.filter(user =>
      user.username.toLowerCase().includes(lowercasedQuery)
    );

    const filteredPosts = posts.filter(post =>
      post.caption.toLowerCase().includes(lowercasedQuery) ||
      (post.originalPost && post.originalPost.caption.toLowerCase().includes(lowercasedQuery))
    );

    return { users: filteredUsers, posts: filteredPosts };
  }, [query, users, posts]);

  return (
    <div className="w-full text-white min-h-screen">
      <div className="p-4 sticky top-0 bg-[#1C1C1E]/80 backdrop-blur-sm z-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Search creators and posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 pl-10 text-sm focus:ring-2 focus:ring-[#0c3a99] focus:outline-none"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {searchResults ? (
        <div className="p-4 space-y-6">
          {searchResults.users.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3">People</h3>
              <div className="space-y-2">
                {searchResults.users.map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded-lg">
                    <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full"/>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{user.username}</p>
                      <p className="text-xs text-gray-400">@{user.username.toLowerCase()}</p>
                    </div>
                    <button onClick={() => onViewProfile(user.id)} className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchResults.posts.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3">Posts</h3>
              <div className="space-y-2">
                {searchResults.posts.map(post => (
                    <div key={post.id} className="bg-zinc-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <img src={post.author.avatarUrl} alt={post.author.username} className="w-6 h-6 rounded-full" />
                            <span className="text-xs font-semibold">{post.author.username}</span>
                        </div>
                        <p className="text-sm mt-2 line-clamp-2">{post.caption || post.originalPost?.caption}</p>
                    </div>
                ))}
              </div>
            </div>
          )}
          
          {searchResults.users.length === 0 && searchResults.posts.length === 0 && (
             <div className="text-center py-16 text-gray-500">
                <p className="font-semibold">No results found for "{query}"</p>
                <p className="text-sm">Try searching for something else.</p>
            </div>
          )}

        </div>
      ) : (
        <Leaderboard users={users} onViewProfile={onViewProfile} />
      )}
    </div>
  );
};

export default SearchScreen;
