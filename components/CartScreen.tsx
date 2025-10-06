
import React from 'react';
import { CartItem } from '../types';
import CartIcon from './icons/CartIcon';

interface CartScreenProps {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onCheckout: () => void;
}

const CartScreen: React.FC<CartScreenProps> = ({ cart, onClose, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-[#1C1C1E] z-50 flex flex-col">
      <header className="p-4 flex items-center sticky top-0 bg-zinc-900/80 backdrop-blur-sm z-10">
        <button onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-bold text-lg mx-auto">My Cart</h1>
        <div className="w-6"></div>
      </header>
      
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <CartIcon className="w-16 h-16 text-gray-500" />
            <p className="font-semibold mt-2">Your cart is empty</p>
            <p className="text-sm">Find something nice in the shop!</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {cart.map(item => (
              <div key={item.cartItemId} className="flex items-center gap-4 bg-zinc-800 p-3 rounded-lg">
                <img src={item.product.imageUrls[0]} alt={item.product.name} className="w-20 h-20 object-cover rounded-md" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.product.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.selectedVariant.type}: {item.selectedVariant.value}</p>
                  <p className="text-blue-400 font-bold text-base mt-1">${item.product.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 border border-gray-600 rounded-md">
                    <button onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)} className="px-2 py-1">-</button>
                    <span className="px-2 text-sm">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)} className="px-2 py-1">+</button>
                  </div>
                   <button onClick={() => onRemoveItem(item.cartItemId)} className="text-xs text-red-400 hover:underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="p-4 border-t border-gray-700 bg-zinc-900">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400">Subtotal</span>
          <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
        </div>
        <button 
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
            Proceed to Checkout
        </button>
      </footer>
    </div>
  );
};

export default CartScreen;
