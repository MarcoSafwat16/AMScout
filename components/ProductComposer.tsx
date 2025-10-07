
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';

interface ProductComposerProps {
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'seller'>) => void;
  productToEdit: Product | null;
}

const CATEGORIES = ["Shirts", "Shoes", "Pants", "Accessories"];
const VARIANT_PRESETS: { [key: string]: { [key: string]: string[] } } = {
    "Shirts": { "Size": ["S", "M", "L", "XL", "XXL"] },
    "Pants": { "Waist": ["28", "30", "32", "34", "36", "38"] },
    "Shoes": { "Size": ["7", "8", "9", "10", "11", "12", "13"] },
    "Accessories": { "Style": ["Default"] },
};

const ProductComposer: React.FC<ProductComposerProps> = ({ onClose, onSave, productToEdit }) => {
  const [name, setName] = useState(productToEdit?.name || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [price, setPrice] = useState(productToEdit?.price.toString() || '');
  const [category, setCategory] = useState(productToEdit?.category || CATEGORIES[0]);
  const [variants, setVariants] = useState<{ [key: string]: string[] }>(productToEdit?.variants || VARIANT_PRESETS[category]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(productToEdit?.imageUrls || []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // When category changes, update the variants to the preset
    if (!productToEdit) { // Only change variants automatically for new products
        setVariants(VARIANT_PRESETS[category]);
    }
  }, [category, productToEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file as Blob));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    // This is tricky because previews can come from existing URLs or new files
    // For simplicity in this demo, we'll just remove the preview. A real app needs more robust logic.
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    // Ideally, you'd map previews back to files and remove the correct file.
  };

  const handleSave = () => {
    if (!name || !price || imagePreviews.length === 0) {
      alert("Please fill in name, price, and add at least one image.");
      return;
    }
    // In a real app, you would upload imageFiles to a server to get URLs.
    // Here, we'll just use the existing/preview URLs.
    onSave({
      name,
      description,
      price: parseFloat(price),
      category,
      variants,
      imageUrls: imagePreviews,
      // Fix: The `onSave` prop expects a `sellerId`. For new products,
      // a placeholder is fine as App.tsx overwrites it with the current user's ID.
      // For existing products, we preserve the original sellerId.
      sellerId: productToEdit?.sellerId || '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#1C1C1E] w-full max-w-2xl h-[90vh] rounded-2xl flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-700/60 flex items-center justify-between relative">
          <h2 className="font-bold text-lg">{productToEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="text-sm font-semibold">Product Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-[#0c3a99] focus:outline-none"/>
          </div>
          <div>
            <label className="text-sm font-semibold">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-[#0c3a99] focus:outline-none"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold">Price ($)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-[#0c3a99] focus:outline-none"/>
            </div>
            <div>
              <label className="text-sm font-semibold">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-[#0c3a99] focus:outline-none">
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Variants</label>
            <div className="p-2 bg-gray-800 rounded-lg mt-1 text-xs text-gray-300">
                {Object.entries(variants).map(([type, values]) => (
                    <div key={type}><strong>{type}:</strong> {(values as string[]).join(', ')}</div>
                ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Images</label>
            <div className="mt-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {imagePreviews.map((src, index) => (
                    <div key={index} className="relative aspect-square">
                        <img src={src} alt="preview" className="w-full h-full object-cover rounded-lg" />
                        <button onClick={() => removeImage(index)} className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 text-xs rounded-full">&times;</button>
                    </div>
                ))}
                <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-800">+</button>
            </div>
          </div>
        </div>
        
        <footer className="p-4 border-t border-gray-700/60 flex justify-end">
          <button onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
            Save Product
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ProductComposer;
