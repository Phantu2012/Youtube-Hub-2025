
import React from 'react';
import { Project, Channel } from '../types';
import { ProjectCard } from './ProjectCard';
import { Loader, PlusCircle, Video } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface ProjectListProps {
    channels: Channel[];
    projectsByChannel: Record<string, Project[]>;
    onSelectProject: (project: Project) => void;
    isLoading: boolean;
    onAddChannel: () => void;
    onAddVideo: (channelId: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ channels, projectsByChannel, onSelectProject, isLoading, onAddChannel, onAddVideo }) => {
    const { t } = useTranslation();

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
        <div className="space-y-12">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('projects.title')}</h1>
              <button
                onClick={onAddChannel}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105"
              >
                <PlusCircle size={20} />
                {t('projects.manageChannels')}
              </button>
            </div>

            {sortedChannels.map(channel => {
                const channelProjects = projectsByChannel[channel.id] || [];
                return (
                    <div key={channel.id}>
                        <div className="flex justify-between items-center mb-4 border-b-2 border-primary/30 pb-2">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{channel.name}</h2>
                            <button
                                onClick={() => onAddVideo(channel.id)}
                                className="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg shadow-md transition-transform transform hover:scale-105"
                            >
                                <Video size={16} />
                                {t('projects.addVideo')}
                            </button>
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
    );
};