import React from 'react';
import { PipelineStage } from '../../types';

interface PipelineTrackerProps {
    currentStage: PipelineStage;
    allStages: PipelineStage[];
    onStageChange: (newStage: PipelineStage) => void;
}

const PipelineTracker: React.FC<PipelineTrackerProps> = ({ currentStage, allStages, onStageChange }) => {
    const currentIndex = allStages.indexOf(currentStage);

    return (
        <div>
            {/* Horizontal scrolling container for the pipeline steps */}
            <div className="overflow-x-auto pb-4 -mx-6 px-6">
                <div className="inline-flex items-start py-2 min-w-full">
                    {allStages.map((stage, index) => {
                        const isCompleted = index < currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                            <React.Fragment key={stage}>
                                {/* Individual stage */}
                                <div className="flex flex-col items-center text-center w-24 flex-shrink-0 px-1">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 flex-shrink-0 ${isCompleted ? 'bg-success-green border-success-green text-white' : isCurrent ? 'bg-accent-blue border-accent-blue text-white animate-pulse' : 'bg-gray-200 border-gray-300 text-gray-600 dark:bg-gray-600 dark:border-gray-500 dark:text-white'
                                            }`}
                                    >
                                        {isCompleted ? '✓' : index + 1}
                                    </div>
                                    {/* Stage label */}
                                    <p className={`mt-2 text-xs h-12 flex items-center justify-center ${isCurrent ? 'font-bold text-accent-blue dark:text-neon-cyan' : 'text-gray-500 dark:text-text-muted'}`}>
                                        {stage}
                                    </p>
                                </div>
                                {/* Connector line */}
                                {index < allStages.length - 1 && (
                                    <div className={`flex-auto border-t-2 mt-4 transition-colors duration-500 min-w-[1rem] sm:min-w-[2rem] ${isCompleted ? 'border-success-green' : 'border-gray-300 dark:border-border-color'}`}></div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* "Move to" button */}
            {currentIndex < allStages.indexOf(PipelineStage.ClosedWon) && currentIndex < allStages.indexOf(PipelineStage.ClosedLost) && (
                <div className="text-center mt-4">
                    <button
                        onClick={() => onStageChange(allStages[currentIndex + 1])}
                        className="bg-accent-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-blue-hover transition-colors"
                    >
                        Move to: {allStages[currentIndex + 1]}
                    </button>
                </div>
            )}
        </div>
    );
};

export default PipelineTracker;