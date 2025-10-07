import React from 'react';
import { Product, User } from '../types';
import CartIcon from './icons/CartIcon';
import AddIcon from './icons/AddIcon';

interface ShopScreenProps {
  products: Product[];
  onProductClick: (productId: string) => void;
  onCartClick: () => void;
  cartItemCount: number;
  currentUser: User;
  onAddProduct: () => void;
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ products, onProductClick, onCartClick, cartItemCount, currentUser, onAddProduct, categories, activeCategory, onSelectCategory }) => {
  return (
    <div className="w-full text-white">
      <header className="p-4 flex justify-between items-center sticky top-0 bg-[#1C1C1E]/80 backdrop-blur-sm z-10">
        <h1 className="text-xl font-bold">AMS Shop</h1>
        <div className="flex items-center gap-2">
            {currentUser.isAdmin && (
                <button onClick={onAddProduct} className="p-2 rounded-full hover:bg-gray-800" title="Add New Product">
                    <AddIcon className="w-6 h-6" />
                </button>
            )}
            <button onClick={onCartClick} className="relative p-2 rounded-full hover:bg-gray-800">
                <CartIcon className="w-6 h-6" />
                {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center ring-2 ring-[#1C1C1E]">
                    {cartItemCount}
                    </span>
                )}
            </button>
        </div>
      </header>

      <nav className="px-4 py-2 border-b border-gray-800">
        <div className="flex space-x-2 overflow-x-auto no-scrollbar">
            {categories.map(category => (
                <button 
                    key={category}
                    onClick={() => onSelectCategory(category)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full flex-shrink-0 transition-colors ${activeCategory === category ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'}`}
                >
                    {category}
                </button>
            ))}
        </div>
      </nav>

      <div className="p-4 grid grid-cols-2 gap-4">
        {products.map(product => (
          <div key={product.id} onClick={() => onProductClick(product.id)} className="bg-zinc-800 rounded-lg overflow-hidden cursor-pointer group">
            <div className="aspect-square bg-zinc-700">
              <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm truncate">{product.name}</h3>
              <p className="text-blue-400 font-bold mt-1">${product.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopScreen;
