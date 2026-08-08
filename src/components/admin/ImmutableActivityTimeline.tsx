import React from 'react';
import { LeadActivity } from '../../types';
import { Clock, User, ShieldCheck, CheckCircle, FileText, Camera, MapPin } from 'lucide-react';

interface ImmutableActivityTimelineProps {
    activities: LeadActivity[];
}

const ImmutableActivityTimeline: React.FC<ImmutableActivityTimelineProps> = ({ activities }) => {
    if (!activities || activities.length === 0) {
        return (
            <div className="p-8 text-center text-text-secondary/60 text-xs font-bold bg-white/[0.02] border border-glass-border/20 rounded-3xl">
                No activity logs recorded yet.
            </div>
        );
    }

    return (
        <div className="space-y-4 font-inter">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neon-cyan mb-2">
                <ShieldCheck size={16} /> Immutable Audit Trail & Activity Timeline
            </div>

            <div className="relative pl-6 border-l-2 border-neon-cyan/20 space-y-6">
                {activities.map((act, idx) => {
                    const dateObj = new Date(act.timestamp);
                    const formattedTime = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                    const formattedDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

                    return (
                        <div key={idx} className="relative group">
                            {/* Dot Indicator */}
                            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-night-sky border-2 border-neon-cyan flex items-center justify-center text-neon-cyan group-hover:scale-125 transition-transform">
                                <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                            </div>

                            {/* Content Box */}
                            <div className="p-4 rounded-2xl bg-glass-surface/30 border border-glass-border/20 hover:border-neon-cyan/30 transition-all">
                                <div className="flex items-center justify-between gap-4 mb-1">
                                    <h5 className="text-xs font-black text-white">{act.action}</h5>
                                    <span className="text-[10px] font-bold text-text-secondary/60 flex items-center gap-1">
                                        <Clock size={11} /> {formattedDate}, {formattedTime}
                                    </span>
                                </div>

                                {act.notes && (
                                    <p className="text-xs font-medium text-text-secondary leading-relaxed mt-1">
                                        {act.notes}
                                    </p>
                                )}

                                <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2 text-[10px] font-bold text-neon-cyan">
                                    <User size={12} />
                                    <span>{act.user || 'System'}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ImmutableActivityTimeline;
