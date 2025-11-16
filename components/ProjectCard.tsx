import React from 'react';
import { Project, User } from '../types';
import { getStatusOptions, STATUS_COLORS, PROJECT_TASKS } from '../constants';
import { Calendar, Eye, Image as ImageIcon, ThumbsUp, MessageSquare, Cloud, Laptop, Check } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface ProjectCardProps {
    project: Project;
    onSelect: () => void;
    channelMembers: Record<string, User>;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, channelMembers }) => {
    const { t, language } = useTranslation();
    const statusOptions = getStatusOptions(t);
    const statusLabel = statusOptions.find(opt => opt.value === project.status)?.label || project.status;
    const statusColor = STATUS_COLORS[project.status];
    const assignedUser = project.assignedTo ? channelMembers[project.assignedTo] : null;
    
    // Helper to format numbers into K (thousands) or M (millions)
    const formatStat = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString(language);
    };
    
    const getLocaleDateTime = () => {
        const { publishDateTime, projectName } = project;

        if (!publishDateTime) {
            return '—';
        }

        let date: Date | null = null;

        try {
            const value = publishDateTime as any;

            // Case 1: It's already a valid Date object.
            if (value instanceof Date && !isNaN(value.getTime())) {
                date = value;
            }
            // Case 2: It's a string (ISO, etc.) or a number (epoch ms).
            else if (typeof value === 'string' || typeof value === 'number') {
                const d = new Date(value);
                if (!isNaN(d.getTime())) {
                    date = d;
                }
            }
            // Case 3: It's a Firestore-like Timestamp object.
            else if (typeof value === 'object' && value !== null) {
                // Check for v9/v8 .toDate() method
                if (typeof value.toDate === 'function') {
                    date = value.toDate();
                }
                // Check for serialized seconds properties
                else if (typeof value.seconds === 'number') {
                    date = new Date(value.seconds * 1000);
                } else if (typeof value._seconds === 'number') {
                     date = new Date(value._seconds * 1000);
                }
            }
        } catch (e) {
            console.error(`Error parsing date for project "${projectName}":`, publishDateTime, e);
            return '—';
        }
        
        // Final validation and formatting
        if (!date || isNaN(date.getTime())) {
            console.warn(`Could not parse date for project "${projectName}":`, publishDateTime);
            return '—';
        }

        if (language === 'vi') {
            const pad = (num: number) => num.toString().padStart(2, '0');
            const day = pad(date.getDate());
            const month = pad(date.getMonth() + 1);
            const hours = pad(date.getHours());
            const minutes = pad(date.getMinutes());
            return `${day}/${month} ${hours}:${minutes}`;
        }
  
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).replace(',', '');
    };
    const localeDateTime = getLocaleDateTime();
    
    const storageType = project.storage || (project.id.startsWith('local_') ? 'local' : 'cloud');

    return (
        <div
            onClick={onSelect}
            className="bg-light-card dark:bg-dark-card rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-transform duration-300 ease-in-out group flex flex-col"
        >
            <div className="relative">
                {project.thumbnailData ? (
                    <img
                        src={project.thumbnailData}
                        alt={project.videoTitle || t('projectCard.thumbnailAlt')}
                        className="w-full h-40 object-cover"
                    />
                ) : (
                    <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <ImageIcon className="text-gray-400 dark:text-gray-500" size={48} />
                    </div>
                )}
                 <div className="absolute top-0 right-0 m-2">
                    <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${statusColor}`}>
                        {statusLabel}
                    </span>
                </div>
                 <div className="absolute bottom-2 left-2 p-1 bg-black/30 rounded-full" title={storageType === 'local' ? t('projectCard.local') : t('projectCard.cloud')}>
                    {storageType === 'local' ? (
                        <Laptop size={14} className="text-white/80" />
                    ) : (
                        <Cloud size={14} className="text-white/80" />
                    )}
                </div>
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <div className="mb-3 space-y-1.5">
                        {PROJECT_TASKS.map(task => (
                            <div key={task.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center 
                                    ${project.tasks?.[task.id]
                                        ? 'bg-orange-500 border-orange-500'
                                        : 'border-gray-400 dark:border-gray-500'
                                    }`}>
                                    {project.tasks?.[task.id] && <Check size={12} className="text-white" />}
                                </div>
                                <span className={project.tasks?.[task.id] ? 'line-through text-gray-500' : ''}>{t(task.labelKey)}</span>
                            </div>
                        ))}
                    </div>
                    <h3 className="text-lg font-bold truncate text-light-text dark:text-dark-text group-hover:text-primary transition-colors" title={project.videoTitle || project.projectName}>
                        {project.videoTitle || project.projectName}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <div className="flex items-center">
                            <Calendar size={14} className="mr-2" />
                            <span>{localeDateTime}</span>
                        </div>
                        {project.stats && (
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center" title={`${project.stats.views.toLocaleString(language)} ${t('projectCard.views')}`}>
                                    <Eye size={14} className="mr-1" />
                                    <span>{formatStat(project.stats.views)}</span>
                                </div>
                                <div className="flex items-center" title={`${project.stats.likes.toLocaleString(language)} ${t('projectCard.likes')}`}>
                                    <ThumbsUp size={14} className="mr-1" />
                                    <span>{formatStat(project.stats.likes)}</span>
                                </div>
                                <div className="flex items-center" title={`${project.stats.comments.toLocaleString(language)} ${t('projectCard.comments')}`}>
                                    <MessageSquare size={14} className="mr-1" />
                                    <span>{formatStat(project.stats.comments)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                 {assignedUser && (
                    <div className="mt-3 flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700" title={`${t('projectCard.assignedTo')} ${assignedUser.name}`}>
                        <img src={assignedUser.avatar} alt={assignedUser.name} className="w-6 h-6 rounded-full" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{assignedUser.name}</span>
                    </div>
                )}
            </div>
        </div>
    );
};