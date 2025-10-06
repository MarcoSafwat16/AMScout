
import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../types';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, selectedVariant: ProductVariant) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };
  
  const handleAddToCartClick = () => {
      if (selectedVariant) {
        onAddToCart(product, selectedVariant);
        handleClose();
      }
  }

  const variantTypes = Object.keys(product.variants);

  return (
    <div className={`fixed inset-0 bg-black/60 z-50 flex items-end justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
      <div
        className={`bg-[#1C1C1E] w-full max-w-lg rounded-t-2xl p-4 transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'} max-h-[90vh] flex flex-col`}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-gray-700 rounded-full mx-auto mb-4 flex-shrink-0"></div>
        <div className="flex-grow overflow-y-auto no-scrollbar">
            <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden relative">
                <img src={product.imageUrls[mainImageIndex]} alt={product.name} className="w-full h-full object-cover"/>
                 {product.imageUrls.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                        {product.imageUrls.map((_, index) => (
                            <button key={index} onClick={() => setMainImageIndex(index)} className={`w-2 h-2 rounded-full ${index === mainImageIndex ? 'bg-white' : 'bg-white/50'}`}></button>
                        ))}
                    </div>
                )}
            </div>
            <div className="mt-4">
                <h2 className="text-2xl font-bold">{product.name}</h2>
                <p className="text-2xl font-bold text-blue-400 mt-1">${product.price.toFixed(2)}</p>
                
                {variantTypes.map(type => (
                    <div key={type} className="mt-4">
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">{type}</h3>
                        <div className="flex flex-wrap gap-2">
                            {product.variants[type].map(value => {
                                const isSelected = selectedVariant?.type === type && selectedVariant?.value === value;
                                return (
                                    <button 
                                        key={value}
                                        onClick={() => setSelectedVariant({ type, value })}
                                        className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${isSelected ? 'bg-white text-black border-white' : 'bg-transparent border-gray-600 hover:bg-zinc-700'}`}
                                    >
                                        {value}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
                
                <div className="flex items-center gap-2 mt-4 p-2 bg-zinc-800 rounded-lg">
                    <img src={product.seller.avatarUrl} alt={product.seller.username} className="w-8 h-8 rounded-full" />
                    <div>
                        <p className="text-xs text-gray-400">Sold by</p>
                        <p className="font-semibold text-sm">{product.seller.username}</p>
                    </div>
                </div>
                <p className="text-gray-300 mt-4 text-sm whitespace-pre-wrap">{product.description}</p>
            </div>
        </div>
        <footer className="mt-4 pt-4 border-t border-gray-700 flex-shrink-0">
            <button 
                onClick={handleAddToCartClick} 
                disabled={!selectedVariant}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                {!selectedVariant ? `Select a ${variantTypes[0] || 'variant'}` : 'Add to Cart'}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ProductDetailModal;
