import React from 'react';
import Card from './Card';

const TaskItem: React.FC<{ title: string; count: number; color: string }> = ({ title, count, color }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-border-color last:border-b-0">
        <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-3 ${color}`}></span>
            <span className="text-sm text-gray-800 dark:text-text-light">{title}</span>
        </div>
        <span className="text-sm font-semibold bg-gray-100 dark:bg-primary-background px-2 py-0.5 rounded-md text-gray-700 dark:text-text-primary">{count}</span>
    </div>
);


const TaskWidget: React.FC = () => {
    const tasks = [
        { title: 'Pending Verifications', count: 8, color: 'bg-warning-yellow' },
        { title: 'Active Proposals', count: 5, color: 'bg-secondary-cyan' },
        { title: 'Upcoming Surveys', count: 3, color: 'bg-accent-blue' },
    ];

    return (
        <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-text-light mb-4">Tasks</h3>
            <div className="space-y-2">
                {tasks.map(task => (
                    <TaskItem key={task.title} {...task} />
                ))}
            </div>
        </Card>
    );
};

export default TaskWidget;