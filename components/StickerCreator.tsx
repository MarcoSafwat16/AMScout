import React, { useState, useRef, useCallback, useEffect } from 'react';
import AddIcon from './icons/AddIcon';
import { removeImageBackground } from '../services/geminiService';

interface StickerCreatorProps {
  onClose: () => void;
  onStickerCreated: (dataUrl: string) => void;
}

const FONT_OPTIONS = ['Impact', 'Arial', 'Comic Sans MS', 'Georgia'];
const COLOR_OPTIONS = ['#FFFFFF', '#000000', '#FF3B30', '#FFCC00', '#007AFF', '#34C759'];
const CANVAS_SIZE = 256;

const StickerCreator: React.FC<StickerCreatorProps> = ({ onClose, onStickerCreated }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Crop Choice, 3: Editor
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [processedImage, setProcessedImage] = useState<HTMLImageElement | null>(null);
  const [imageForEditing, setImageForEditing] = useState<HTMLImageElement | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Text state
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textFont, setTextFont] = useState('Impact');
  const [fontSize, setFontSize] = useState(48);
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('bold');
  const [hasStroke, setHasStroke] = useState(true);
  const [textPosition, setTextPosition] = useState({ x: CANVAS_SIZE / 2, y: CANVAS_SIZE - 30 });

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas || !imageForEditing) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the image centered
    const scale = Math.min(canvas.width / imageForEditing.width, canvas.height / imageForEditing.height);
    const w = imageForEditing.width * scale;
    const h = imageForEditing.height * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;
    ctx.drawImage(imageForEditing, x, y, w, h);

    // Draw text overlay
    if (text.trim()) {
        ctx.font = `${fontWeight} ${fontSize}px '${textFont}', sans-serif`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (hasStroke) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = Math.max(2, fontSize / 12);
            ctx.strokeText(text, textPosition.x, textPosition.y);
        }
        
        ctx.fillText(text, textPosition.x, textPosition.y);
    }
  }, [imageForEditing, text, textColor, textFont, textPosition, fontSize, fontWeight, hasStroke]);

  useEffect(() => {
    if (step === 3 && imageForEditing) {
      drawCanvas();
    }
  }, [step, imageForEditing, drawCanvas, text, textColor, textFont, textPosition, fontSize, fontWeight, hasStroke]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            setOriginalImage(img);
            setStep(2);
        };
        img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  
  const handleCropChoice = async (choice: 'ai' | 'full') => {
      if (!originalImage) return;

      if (choice === 'full') {
          setImageForEditing(originalImage);
          setStep(3);
          return;
      }
      
      // AI Choice
      setIsLoading(true);
      setError(null);
      try {
        const base64String = originalImage.src.split(',')[1];
        const processedBase64 = await removeImageBackground(base64String, 'image/png');
        const processedImg = new Image();
        processedImg.onload = () => {
          setProcessedImage(processedImg);
          setImageForEditing(processedImg);
          setStep(3);
          setIsLoading(false);
        };
        processedImg.src = `data:image/png;base64,${processedBase64}`;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process image.');
        setIsLoading(false);
      }
  };

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCanvasCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !text.trim()) return;

    ctx.font = `${fontWeight} ${fontSize}px '${textFont}', sans-serif`;
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize; // Approximation
    
    if (
        coords.x >= textPosition.x - textWidth / 2 &&
        coords.x <= textPosition.x + textWidth / 2 &&
        coords.y >= textPosition.y - textHeight / 2 &&
        coords.y <= textPosition.y + textHeight / 2
    ) {
        setIsDragging(true);
        setDragOffset({ x: coords.x - textPosition.x, y: coords.y - textPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const coords = getCanvasCoordinates(e);
    setTextPosition({
        x: coords.x - dragOffset.x,
        y: coords.y - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCreateSticker = () => {
    drawCanvas(); // Ensure canvas is up-to-date
    const dataUrl = canvasRef.current?.toDataURL('image/png');
    if (dataUrl) {
      onStickerCreated(dataUrl);
    }
  };

  const renderContent = () => {
    if (isLoading) {
        return <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
          <svg className="animate-spin h-10 w-10 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p className="font-semibold">Processing image with AI...</p>
        </div>;
    }

    if (error) {
       return <div className="flex flex-col items-center justify-center h-full text-center text-red-400 p-4">
            <p className="font-semibold">Oops! Something went wrong.</p>
            <p className="text-xs mt-1 mb-4 max-w-xs">{error}</p>
            <button onClick={() => { setStep(1); setError(null); }} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">Start Over</button>
        </div>;
    }

    switch (step) {
        case 1:
            return <>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-gray-600 rounded-2xl text-gray-400 hover:bg-gray-800 hover:border-gray-500 transition-colors">
                    <AddIcon className="w-12 h-12" />
                    <span className="font-semibold">Upload Image</span>
                </button>
            </>;
        case 2:
            return <div className="flex flex-col items-center justify-center h-full text-center">
                <h3 className="text-lg font-semibold mb-4">How should we crop it?</h3>
                <img src={originalImage!.src} alt="Preview" className="max-w-full max-h-48 object-contain rounded-lg mb-6 border border-gray-700"/>
                <div className="flex gap-4">
                    <button onClick={() => handleCropChoice('ai')} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">✨ Isolate Subject (AI)</button>
                    <button onClick={() => handleCropChoice('full')} className="bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg">🖼️ Use Full Image</button>
                </div>
            </div>;
        case 3:
            return <div className="flex flex-col items-center justify-between h-full w-full">
                <canvas 
                    ref={canvasRef} 
                    width={CANVAS_SIZE} 
                    height={CANVAS_SIZE}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg cursor-grab"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                />
                <div className="w-full max-w-sm mt-4 space-y-3">
                     <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add text..." maxLength={30} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#0c3a99] focus:outline-none"/>
                     <div className="flex gap-2">
                        <select value={textFont} onChange={e => setTextFont(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#0c3a99] focus:outline-none">
                            {FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}
                        </select>
                        <div className="flex items-center gap-1 bg-gray-800 border border-gray-600 rounded-lg p-1">
                            {COLOR_OPTIONS.map(color => <button key={color} onClick={() => setTextColor(color)} className={`w-6 h-6 rounded-full border-2 ${textColor === color ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} />)}
                        </div>
                     </div>
                     <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-3">
                            <label htmlFor="font-size" className="text-xs font-semibold text-gray-400 w-12">Size</label>
                            <input 
                                id="font-size"
                                type="range" 
                                min="16" 
                                max="72" 
                                value={fontSize} 
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-400">Weight</span>
                                <button onClick={() => setFontWeight('normal')} className={`px-3 py-1 text-xs rounded-md transition-colors ${fontWeight === 'normal' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Normal</button>
                                <button onClick={() => setFontWeight('bold')} className={`px-3 py-1 text-xs rounded-md transition-colors ${fontWeight === 'bold' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Bold</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="stroke-toggle" className="text-xs font-semibold text-gray-400 cursor-pointer">Outline</label>
                                <button id="stroke-toggle" onClick={() => setHasStroke(!hasStroke)} className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors ${hasStroke ? 'bg-blue-600' : 'bg-gray-700'}`}>
                                    <span className={`inline-block w-3.5 h-3.5 transform bg-white rounded-full transition-transform ${hasStroke ? 'translate-x-4' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>;
        default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#1C1C1E] w-full max-w-md h-[90vh] max-h-[700px] rounded-2xl flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-700/60 flex items-center justify-between relative">
          <h2 className="font-bold text-lg">Sticker Studio</h2>
          {step > 1 && <button onClick={() => setStep(prev => prev - 1)} className="absolute left-4 text-sm font-semibold">Back</button>}
          <button onClick={onClose} className="absolute right-4 text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
            {renderContent()}
        </div>

        <footer className="p-4 border-t border-gray-700/60">
            <button 
                onClick={handleCreateSticker}
                disabled={step !== 3 || isLoading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
                Save Sticker
            </button>
        </footer>
      </div>
    </div>
  );
};

export default StickerCreator;