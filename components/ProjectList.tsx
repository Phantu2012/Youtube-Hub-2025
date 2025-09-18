


import React from 'react';
import { Project, Channel } from '../types';
import { ProjectCard } from './ProjectCard';
import { DashboardSummary } from './DashboardSummary';
import { Loader, PlusCircle, Video, BookOpen, Users, Eye } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface ProjectListProps {
    projects: Project[];
    channels: Channel[];
    projectsByChannel: Record<string, Project[]>;
    onSelectProject: (project: Project) => void;
    isLoading: boolean;
    onAddChannel: () => void;
    onAddVideo: (channelId: string) => void;
    onManageDream100: (channelId: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, channels, projectsByChannel, onSelectProject, isLoading, onAddChannel, onAddVideo, onManageDream100 }) => {
    const { t, language } = useTranslation();

    const formatStat = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString(language);
    };

    if (isLoading) {
        return (
            <div className="text-center py-16 px-6">
                <Loader className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="mt-4 text-gray-500 dark:text-gray-400">{t('projects.loading')}</p>
            </div>
        );
    }

    if (channels.length === 0) {
        return (
            <div className="text-center py-16 px-6 bg-light-card dark:bg-dark-card rounded-lg shadow-inner">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{t('projects.noChannels')}</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400 mb-6">{t('projects.getStartedChannels')}</p>
                <button
                    onClick={onAddChannel}
                    className="flex items-center gap-2 mx-auto bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                >
                    <PlusCircle size={20} />
                    {t('projects.addChannel')}
                </button>
            </div>
        );
    }
    
    const sortedChannels = [...channels].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('projects.title')}</h1>
              <button
                onClick={onAddChannel}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105"
              >
                <PlusCircle size={20} />
                {t('projects.manageChannels')}
              </button>
            </div>
            
            <DashboardSummary projects={projects} />

            <div className="space-y-12">
                {sortedChannels.map(channel => {
                    const channelProjects = projectsByChannel[channel.id] || [];
                    return (
                        <div key={channel.id}>
                            <div className="flex flex-wrap justify-between items-center gap-y-2 mb-4 border-b-2 border-primary/30 pb-2">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{channel.name}</h2>
                                    {channel.stats && (
                                        <div className="hidden md:flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 border-l border-gray-300 dark:border-gray-600 pl-4">
                                            <span className="flex items-center gap-1.5" title={`${channel.stats.videoCount.toLocaleString(language)} ${t('projects.videos')}`}>
                                                <Video size={14} /> {formatStat(channel.stats.videoCount)}
                                            </span>
                                            <span className="flex items-center gap-1.5" title={`${channel.stats.subscriberCount.toLocaleString(language)} ${t('projects.subscribers')}`}>
                                                <Users size={14} /> {formatStat(channel.stats.subscriberCount)}
                                            </span>
                                            <span className="flex items-center gap-1.5" title={`${channel.stats.viewCount.toLocaleString(language)} ${t('projects.totalViews')}`}>
                                                <Eye size={14} /> {formatStat(channel.stats.viewCount)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onManageDream100(channel.id)}
                                        className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg shadow-md transition-transform transform hover:scale-105"
                                    >
                                        <BookOpen size={16} />
                                        {t('projects.manageDream100')}
                                    </button>
                                    <button
                                        onClick={() => onAddVideo(channel.id)}
                                        className="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg shadow-md transition-transform transform hover:scale-105"
                                    >
                                        <Video size={16} />
                                        {t('projects.addVideo')}
                                    </button>
                                </div>
                            </div>
                            {channelProjects.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {channelProjects.map(project => (
                                        <ProjectCard key={project.id} project={project} onSelect={() => onSelectProject(project)} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 px-6 bg-light-bg dark:bg-dark-bg rounded-lg">
                                    <p className="text-gray-500 dark:text-gray-400">{t('projects.noProjectsInChannel')}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};