import React from 'react';
import { Project } from '../types';
import { getStatusOptions, STATUS_COLORS } from '../constants';
import { Calendar, Eye, Image as ImageIcon, ThumbsUp, MessageSquare, Cloud, Laptop } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface ProjectCardProps {
    project: Project;
    onSelect: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
    const { t, language } = useTranslation();
    const statusOptions = getStatusOptions(t);
    const statusLabel = statusOptions.find(opt => opt.value === project.status)?.label || project.status;
    const statusColor = STATUS_COLORS[project.status];
    
    // Helper to format numbers into K (thousands) or M (millions)
    const formatStat = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString(language);
    };
    
    const getLocaleDateTime = () => {
      const { publishDateTime } = project;
      let date: Date;

      if (!publishDateTime) {
          return '—';
      }

      // FIX: Re-ordered type checks to correctly handle various data types for dates,
      // resolving `instanceof` errors on non-object types. This also resolves a possibly
      // related but misleading error about `publishDateTime` being null.
      if (typeof publishDateTime === 'string') {
          date = new Date(publishDateTime);
      } 
      // It might be a number (milliseconds)
      else if (typeof publishDateTime === 'number') {
        date = new Date(publishDateTime);
      }
      else if (typeof publishDateTime === 'object' && publishDateTime !== null) {
          // It might already be a Date object
          if (publishDateTime instanceof Date) {
              date = publishDateTime;
          }
          // It might be a Firestore Timestamp-like object
          else if ('toDate' in publishDateTime && typeof (publishDateTime as any).toDate === 'function') {
              date = (publishDateTime as any).toDate();
          } else {
              console.error("Unsupported object date type for project:", project.projectName, publishDateTime);
              return '—';
          }
      }
      else {
          console.error("Unsupported date type for project:", project.projectName, typeof publishDateTime);
          return '—';
      }


      // Check for invalid date after parsing attempt
      if (isNaN(date.getTime())) {
          console.error("Invalid date for project:", project.projectName, publishDateTime);
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

      // Fallback for English
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
            className="bg-light-card dark:bg-dark-card rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-transform duration-300 ease-in-out group"
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
            <div className="p-4">
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
        </div>
    );
};