import React, { useState, useRef, useEffect, useCallback } from 'react';

interface AvatarEditorProps {
  imageSrc: string;
  onClose: () => void;
  onApply: (dataUrl: string) => void;
}

const CANVAS_SIZE = 300;
const SLIDER_MAX = 100;

const AvatarEditor: React.FC<AvatarEditorProps> = ({ imageSrc, onClose, onApply }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [zoom, setZoom] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const image = imageRef.current;
    if (!image.src || image.width === 0) return;

    ctx.fillStyle = '#1C1C1E';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    const scale = 1 + (zoom / SLIDER_MAX) * 2;
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;

    const dx = (CANVAS_SIZE - scaledWidth) / 2 + offset.x;
    const dy = (CANVAS_SIZE - scaledHeight) / 2 + offset.y;

    ctx.save();
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, 2 * Math.PI);
    ctx.clip();
    
    ctx.drawImage(image, dx, dy, scaledWidth, scaledHeight);
    
    ctx.restore();

    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 1, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [zoom, offset]);
  
  useEffect(() => {
    const image = imageRef.current;
    image.crossOrigin = "anonymous";
    const handleLoad = () => {
        setZoom(0);
        setOffset({x: 0, y: 0});
        draw();
    };
    image.onload = handleLoad;
    image.src = imageSrc;
    return () => { image.onload = null; };
  }, [imageSrc, draw]);

  useEffect(() => {
    draw();
  }, [zoom, offset, draw]);

  const getEventCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    return 'touches' in e 
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const { x, y } = getEventCoordinates(e);
    dragStart.current = { x: x - offset.x, y: y - offset.y };
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const { x, y } = getEventCoordinates(e);
    setOffset({ x: x - dragStart.current.x, y: y - dragStart.current.y });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onApply(dataUrl);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 w-full max-w-sm rounded-2xl p-6 flex flex-col items-center" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Edit Photo</h2>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="rounded-full cursor-grab active:cursor-grabbing touch-none"
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        />
        <div className="w-full my-4 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
            <input
                type="range"
                min="0"
                max={SLIDER_MAX}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
        </div>
        <div className="flex justify-end gap-4 w-full">
          <button onClick={onClose} className="bg-zinc-700 hover:bg-zinc-600 font-semibold py-2 px-5 rounded-lg text-sm transition-colors">Cancel</button>
          <button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700 font-semibold py-2 px-5 rounded-lg text-sm transition-colors">Apply</button>
        </div>
      </div>
    </div>
  );
};

export default AvatarEditor;
