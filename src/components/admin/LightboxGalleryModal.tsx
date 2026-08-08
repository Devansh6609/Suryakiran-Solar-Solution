import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Film, Image as ImageIcon } from 'lucide-react';

interface GalleryMediaItem {
    url: string;
    title: string;
    type?: 'image' | 'video';
    category?: string;
}

interface LightboxGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    media: GalleryMediaItem[];
    initialIndex?: number;
}

const LightboxGalleryModal: React.FC<LightboxGalleryModalProps> = ({
    isOpen,
    onClose,
    title,
    media,
    initialIndex = 0
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoomLevel, setZoomLevel] = useState(1);

    if (!isOpen || media.length === 0) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const currentItem = media[currentIndex] || media[0];
    const isVideo = currentItem.type === 'video' || currentItem.url?.endsWith('.mp4') || currentItem.url?.endsWith('.webm');

    const handlePrev = () => {
        setZoomLevel(1);
        setCurrentIndex(prev => (prev === 0 ? media.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setZoomLevel(1);
        setCurrentIndex(prev => (prev === media.length - 1 ? 0 : prev + 1));
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md anim-fade-in">
            {/* Header Bar */}
            <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
                <div>
                    <h3 className="text-lg font-700 text-white">{title}</h3>
                    <p className="text-xs font-600 text-white/70">
                        {currentIndex + 1} of {media.length} • {currentItem.title || currentItem.category || 'Evidence Record'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {!isVideo && (
                        <>
                            <button
                                onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))}
                                className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                                title="Zoom Out"
                            >
                                <ZoomOut size={18} />
                            </button>
                            <button
                                onClick={() => setZoomLevel(z => Math.min(3, z + 0.25))}
                                className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                                title="Zoom In"
                            >
                                <ZoomIn size={18} />
                            </button>
                        </>
                    )}

                    <a
                        href={currentItem.url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                        title="Download Media"
                    >
                        <Download size={18} />
                    </a>

                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all font-bold"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Prev / Next Controls */}
            {media.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3.5 rounded-2xl bg-white/10 text-white hover:bg-white/30 transition-all z-10"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3.5 rounded-2xl bg-white/10 text-white hover:bg-white/30 transition-all z-10"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Media Canvas */}
            <div className="w-full h-full flex items-center justify-center p-8 overflow-hidden">
                {isVideo ? (
                    <video
                        src={currentItem.url}
                        controls
                        autoPlay
                        className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl"
                    />
                ) : (
                    <img
                        src={currentItem.url}
                        alt={currentItem.title}
                        style={{ transform: `scale(${zoomLevel})` }}
                        className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl transition-transform duration-200 shadow-2xl"
                    />
                )}
            </div>

            {/* Thumbnails Strip */}
            {media.length > 1 && (
                <div className="absolute bottom-4 inset-x-0 flex justify-center items-center gap-2 px-4 overflow-x-auto py-2">
                    {media.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setZoomLevel(1);
                                setCurrentIndex(idx);
                            }}
                            className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 relative ${
                                idx === currentIndex ? 'border-white scale-110 shadow-lg' : 'border-white/20 opacity-50 hover:opacity-100'
                            }`}
                        >
                            {item.type === 'video' ? (
                                <div className="w-full h-full bg-black flex items-center justify-center text-white">
                                    <Film size={20} />
                                </div>
                            ) : (
                                <img src={item.url} alt="" className="w-full h-full object-cover" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>,
        modalRoot
    );
};

export default LightboxGalleryModal;
