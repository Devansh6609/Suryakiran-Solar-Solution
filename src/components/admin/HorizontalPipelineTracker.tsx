import React, { useState } from 'react';
import { PipelineStage, StageVerificationRecord } from '../../types';
import { 
    Check, 
    AlertTriangle, 
    Clock, 
    User, 
    Image as ImageIcon, 
    FileText, 
    Zap, 
    Calendar,
    ChevronRight,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import LightboxGalleryModal from './LightboxGalleryModal';

interface HorizontalPipelineTrackerProps {
    currentStage: PipelineStage;
    allStages: PipelineStage[];
    verifications: Record<string, StageVerificationRecord>;
    onSelectStage: (stage: PipelineStage) => void;
}

const STAGE_ICONS: Record<string, string> = {
    // New simplified 9 stages
    "New_Lead": "🆕",
    "Survey_Scheduled": "📅",
    "Survey_Completed": "📍",
    "Quotation_Sent": "📧",
    "Customer_Approved": "✅",
    "Material_Dispatched": "🚚",
    "Installation": "🛠️",
    "Final_Processing": "⚡",
    "Completed": "🏆",
    "Closed_Lost": "❌",
    // Legacy names (for existing data)
    "Lead Created": "📋",
    "Lead Assigned": "👤",
    "Site Survey Scheduled": "📅",
    "Site Survey Completed": "📍",
    "Proposal Generated": "📄",
    "Quotation Sent": "📧",
    "Customer Approved": "✍️",
    "Advance Payment Received": "💰",
    "Material Reserved": "📦",
    "Material Dispatched": "🚚",
    "Material Received On Site": "📋",
    "Installation Started": "🛠️",
    "Installation Completed": "☀️",
    "Inspection": "🔍",
    "Net Metering": "⚡",
    "Subsidy Process": "🏛️",
    "Final Payment": "💳",
    "AMC Activated": "🛡️",
    "Project Completed": "🏆",
    "Closed Lost": "❌"
};


const HorizontalPipelineTracker: React.FC<HorizontalPipelineTrackerProps> = ({
    currentStage,
    allStages,
    verifications,
    onSelectStage
}) => {
    const currentIndex = allStages.indexOf(currentStage);

    // Gallery state
    const [galleryState, setGalleryState] = useState<{ isOpen: boolean; title: string; media: any[] }>({
        isOpen: false,
        title: '',
        media: []
    });

    const openStageGallery = (e: React.MouseEvent, stageName: string, evidenceData: any) => {
        e.stopPropagation();
        const photos = (evidenceData.roofPhotos || evidenceData.installationPhotos || evidenceData.photos || []).map((url: string, idx: number) => ({
            url,
            title: `${stageName} Photo #${idx + 1}`
        }));
        if (evidenceData.videoUrl) {
            photos.push({ url: evidenceData.videoUrl, title: `${stageName} Video`, type: 'video' });
        }

        if (photos.length > 0) {
            setGalleryState({
                isOpen: true,
                title: `${stageName} Evidence Gallery`,
                media: photos
            });
        }
    };

    return (
        <div className="space-y-6 font-inter">
            {/* Gallery Lightbox */}
            <LightboxGalleryModal
                isOpen={galleryState.isOpen}
                onClose={() => setGalleryState(prev => ({ ...prev, isOpen: false }))}
                title={galleryState.title}
                media={galleryState.media}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                <div>
                    <div className="flex items-center gap-2 text-neon-cyan text-xs font-black uppercase tracking-widest">
                        <Sparkles size={14} className="fill-neon-cyan" />
                        Interactive Project Pipeline
                    </div>
                    <h2 className="text-xl font-black text-white tracking-tight">
                        Lifecycle Progression <span className="text-neon-cyan">({currentIndex + 1}/{allStages.length})</span>
                    </h2>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1.5 text-status-green">
                        <div className="w-2.5 h-2.5 rounded-full bg-status-green animate-pulse" />
                        Completed & Verified
                    </div>
                    <div className="flex items-center gap-1.5 text-neon-cyan">
                        <div className="w-2.5 h-2.5 rounded-full bg-neon-cyan animate-pulse" />
                        Current Stage
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-400">
                        <AlertTriangle size={12} />
                        Awaiting Verification
                    </div>
                </div>
            </div>

            {/* Horizontal Timeline Scroll Bar */}
            <div className="overflow-x-auto pb-6 pt-2 px-2 hide-scrollbar">
                <div className="inline-flex items-start gap-4 min-w-max">
                    {allStages.map((stage, index) => {
                        const isCompleted = index < currentIndex;
                        const isCurrent = index === currentIndex;
                        const isPending = index > currentIndex;

                        const verification = verifications[stage];
                        const evidence = verification?.evidenceData || {};
                        const hasPhotos = (evidence.roofPhotos || evidence.installationPhotos || evidence.photos || []).length > 0;
                        const photoCount = (evidence.roofPhotos || evidence.installationPhotos || evidence.photos || []).length;
                        const isAwaitingVerification = isCurrent && !verification;

                        const stageIcon = STAGE_ICONS[stage] || "📌";

                        return (
                            <div key={stage} className="flex items-center group">
                                {/* Stage Card */}
                                <div
                                    onClick={() => onSelectStage(stage)}
                                    className={`
                                        w-72 p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between relative
                                        ${isCurrent 
                                            ? 'bg-gradient-to-b from-neon-cyan/15 to-night-sky/90 border-neon-cyan shadow-glow-md shadow-neon-cyan/30 scale-105 z-10' 
                                            : isCompleted 
                                                ? 'bg-glass-surface/30 border-status-green/40 hover:border-status-green hover:scale-[1.02]' 
                                                : 'bg-white/[0.02] border-glass-border/20 hover:border-white/30 opacity-75'}
                                    `}
                                >
                                    {/* Top Line & Icon */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`
                                                w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black transition-all
                                                ${isCurrent ? 'bg-neon-cyan text-night-sky shadow-glow-sm shadow-neon-cyan/50' :
                                                    isCompleted ? 'bg-status-green/20 text-status-green border border-status-green/30' :
                                                        'bg-white/10 text-text-secondary'}
                                            `}>
                                                {isCompleted ? <Check size={20} className="stroke-[3]" /> : stageIcon}
                                            </div>

                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60 block">
                                                    Stage {index + 1}
                                                </span>
                                                <h4 className={`text-sm font-black tracking-tight leading-snug line-clamp-1 ${isCurrent ? 'text-neon-cyan' : isCompleted ? 'text-white' : 'text-text-secondary'}`}>
                                                    {stage}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Badge Status Indicator */}
                                    <div className="my-2">
                                        {isCompleted && (
                                            <div className="px-3 py-1.5 rounded-xl bg-status-green/10 border border-status-green/20 text-status-green text-[11px] font-bold flex items-center gap-1.5">
                                                <ShieldCheck size={14} />
                                                <span>Verified & Complete</span>
                                            </div>
                                        )}

                                        {isCurrent && !isAwaitingVerification && (
                                            <div className="px-3 py-1.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[11px] font-bold flex items-center gap-1.5">
                                                <Zap size={14} className="fill-neon-cyan" />
                                                <span>Active Stage</span>
                                            </div>
                                        )}

                                        {isAwaitingVerification && (
                                            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
                                                <AlertTriangle size={14} />
                                                <span>Awaiting Verification</span>
                                            </div>
                                        )}

                                        {isPending && (
                                            <div className="px-3 py-1.5 rounded-xl bg-white/5 text-text-secondary/60 text-[11px] font-bold flex items-center gap-1.5">
                                                <Clock size={12} />
                                                <span>Pending Stage</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Evidence Preview / Thumbnail Badge */}
                                    {hasPhotos && (
                                        <div 
                                            onClick={(e) => openStageGallery(e, stage, evidence)}
                                            className="mt-3 p-2.5 rounded-2xl bg-white/5 hover:bg-neon-cyan/10 border border-white/10 hover:border-neon-cyan/30 transition-all flex items-center justify-between group/thumb cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-night-sky border border-white/20 flex-shrink-0">
                                                    <img 
                                                        src={(evidence.roofPhotos || evidence.installationPhotos || evidence.photos)[0]} 
                                                        alt="" 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white group-hover/thumb:text-neon-cyan transition-colors">
                                                        {photoCount} Evidence Photos
                                                    </p>
                                                    <p className="text-[9px] font-bold text-text-secondary/60">
                                                        Click to View Gallery
                                                    </p>
                                                </div>
                                            </div>
                                            <ImageIcon size={14} className="text-neon-cyan" />
                                        </div>
                                    )}

                                    {/* Footer Info */}
                                    <div className="mt-3 pt-3 border-t border-glass-border/10 flex items-center justify-between text-[10px] font-bold text-text-secondary/70">
                                        <div className="flex items-center gap-1">
                                            <User size={12} className="text-neon-cyan" />
                                            <span>{verification?.assignedTo || verification?.verifiedBy || 'Assigned Team'}</span>
                                        </div>
                                        {verification?.createdAt && (
                                            <div className="flex items-center gap-1">
                                                <Calendar size={11} />
                                                <span>{new Date(verification.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Arrow Connector */}
                                {index < allStages.length - 1 && (
                                    <div className="flex items-center mx-2 text-glass-border/40">
                                        <ChevronRight size={22} className={isCompleted ? 'text-status-green' : isCurrent ? 'text-neon-cyan' : 'text-white/20'} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HorizontalPipelineTracker;
