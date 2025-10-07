

import React, { useState, useRef, useEffect, useCallback } from 'react';
import SendIcon from './icons/SendIcon';
import GalleryIcon from './icons/GalleryIcon';

interface StoryCreatorProps {
  onClose: () => void;
  onStoryCreated: (dataUrl: string) => void;
  isSubmitting: boolean;
}

type FilterType = 'none' | 'grayscale(1)' | 'sepia(1)' | 'saturate(2)' | 'contrast(1.5)' | 'brightness(1.2)' | 'invert(1)';

const FILTERS: { name: string; value: FilterType }[] = [
    { name: 'Normal', value: 'none' },
    { name: 'B&W', value: 'grayscale(1)' },
    { name: 'Sepia', value: 'sepia(1)' },
    { name: 'Vivid', value: 'saturate(2)' },
    { name: 'Sharp', value: 'contrast(1.5)' },
    { name: 'Bright', value: 'brightness(1.2)' },
    { name: 'Invert', value: 'invert(1)' },
];

const StoryCreator: React.FC<StoryCreatorProps> = ({ onClose, onStoryCreated, isSubmitting }) => {
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('none');
    const [isCameraFlipped, setIsCameraFlipped] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const cleanupCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }, []);

    useEffect(() => {
        if (capturedImage) return; // Don't run camera if an image is already selected/captured

        const facingMode = isCameraFlipped ? "user" : "environment";
        const constraints = {
            video: {
                facingMode,
                width: { ideal: 1080 },
                height: { ideal: 1920 }
            }
        };
        
        setCameraError(null);

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.error("Error accessing camera: ", err);
                if (err instanceof Error) {
                    if (err.name === "NotAllowedError") {
                        setCameraError("Camera access was denied. Please enable it in your browser settings.");
                    } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                        setCameraError("No camera found. Please connect a camera to continue.");
                    } else {
                        setCameraError(`Could not access camera: ${err.message}`);
                    }
                } else {
                    setCameraError("An unknown error occurred while accessing the camera.");
                }
            });

        return cleanupCamera;
    }, [isCameraFlipped, cleanupCamera, capturedImage]);

    const handleCapture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if(context) {
                if (isCameraFlipped) {
                    context.translate(video.videoWidth, 0);
                    context.scale(-1, 1);
                }
                context.filter = activeFilter;
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                setCapturedImage(dataUrl);
                cleanupCamera();
            }
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                setCapturedImage(dataUrl);
                cleanupCamera(); // Stop camera stream after selecting an image
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handlePost = () => {
        if(capturedImage) {
            const canvas = canvasRef.current;
            const image = new Image();
            image.onload = () => {
                if (!canvas) return;
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.filter = activeFilter;
                ctx.drawImage(image, 0, 0);
                const finalDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                onStoryCreated(finalDataUrl);
            };
            image.src = capturedImage;
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        // The useEffect will restart the camera stream
    };

    if (cameraError) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-center p-4">
                <div className="bg-zinc-800 p-8 rounded-lg shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-xl font-bold text-white mb-2">Camera Error</h2>
                    <p className="text-gray-300 mb-6 max-w-sm">{cameraError}</p>
                    <button onClick={onClose} className="bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors">Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            <div className="relative w-full h-full max-w-lg mx-auto flex flex-col items-center justify-center">
                
                <canvas ref={canvasRef} className="hidden" />
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />

                {/* Main View */}
                <div className="relative w-full aspect-[9/16] max-h-full rounded-lg overflow-hidden bg-zinc-900">
                    {capturedImage ? (
                        <img src={capturedImage} alt="Captured story" className="w-full h-full object-cover" style={{ filter: activeFilter }} />
                    ) : (
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted
                            className="w-full h-full object-cover"
                            style={{ filter: activeFilter, transform: isCameraFlipped ? 'scaleX(-1)' : 'scaleX(1)' }}
                        />
                    )}
                    {isSubmitting && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="mt-2 font-semibold">Posting...</p>
                        </div>
                    )}
                </div>
                
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-end z-10">
                    <button onClick={onClose} className="text-white text-3xl leading-none bg-black/30 rounded-full w-10 h-10 flex items-center justify-center" disabled={isSubmitting}>&times;</button>
                </div>

                {/* Footer Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    {capturedImage ? (
                        <div className="flex items-center justify-between">
                             <button onClick={handleRetake} className="font-semibold text-white bg-black/40 py-2 px-4 rounded-full disabled:opacity-50" disabled={isSubmitting}>
                                Retake
                            </button>
                            <div>
                                <h3 className="text-sm font-semibold text-white mb-2 text-center">Filter</h3>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {FILTERS.map(filter => (
                                    <button key={filter.value} onClick={() => setActiveFilter(filter.value)} className="flex-shrink-0 text-center" disabled={isSubmitting}>
                                        <div className={`w-14 h-14 rounded-md overflow-hidden border-2 bg-zinc-600 ${activeFilter === filter.value ? 'border-blue-500' : 'border-transparent'}`}>
                                            <img src={capturedImage} className="w-full h-full object-cover" style={{filter: filter.value}}/>
                                        </div>
                                    </button>
                                ))}
                                </div>
                            </div>
                             <button onClick={handlePost} className="flex items-center gap-2 font-bold text-black bg-white py-3 px-6 rounded-full disabled:bg-gray-400" disabled={isSubmitting}>
                                {isSubmitting ? 'Posting...' : 'Post Story'} <SendIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    ) : (
                       <>
                        <div className="flex justify-around items-center">
                            <button onClick={() => fileInputRef.current?.click()} className="w-16 h-16 text-white bg-black/40 rounded-full flex items-center justify-center" aria-label="Upload from Gallery">
                                <GalleryIcon className="w-7 h-7" />
                            </button>
                            <button onClick={handleCapture} className="w-20 h-20 bg-white rounded-full border-4 border-black/30 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white rounded-full active:bg-gray-300"></div>
                            </button>
                            <button onClick={() => setIsCameraFlipped(prev => !prev)} className="w-16 h-16 text-white bg-black/40 rounded-full flex items-center justify-center" aria-label="Flip camera">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" />
                               </svg>
                            </button>
                        </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoryCreator;