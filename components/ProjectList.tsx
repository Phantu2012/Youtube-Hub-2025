import React, { useState, useMemo } from 'react';
import { Project, Channel, User, ProjectStatus } from '../types';
import { ProjectCard } from './ProjectCard';
import { DashboardSummary } from './DashboardSummary';
import { Loader, PlusCircle, Video, BookOpen, Users, Eye, Share2, AlertTriangle, ExternalLink, HelpCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { getStatusOptions } from '../constants';

interface ProjectListProps {
    projects: Project[];
    channels: Channel[];
    projectsByChannel: Record<string, Project[]>;
    user: User;
    channelMembers: Record<string, User>;
    onSelectProject: (project: Project) => void;
    isLoading: boolean;
    onAddChannel: () => void;
    onAddVideo: (channelId: string) => void;
    onManageDream100: (channelId: string) => void;
    missingIndexError: { message: string, url: string | null } | null;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, channels, projectsByChannel, user, channelMembers, onSelectProject, isLoading, onAddChannel, onAddVideo, onManageDream100, missingIndexError }) => {
    const { t, language } = useTranslation();
    const statusOptions = getStatusOptions(t);
    
    const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'status'>('date-desc');
    const [statusFilter, setStatusFilter] = useState<ProjectStatus[]>([]);

    const toggleStatusFilter = (status: ProjectStatus) => {
        setStatusFilter(prev => {
            const isPresent = prev.includes(status);
            if (isPresent) {
                return prev.filter(s => s !== status);
            } else {
                return [...prev, status];
            }
        });
    };

    const displayedProjects = useMemo(() => {
        let processedProjects = [...projects];

        // Filter
        if (statusFilter.length > 0) {
            processedProjects = processedProjects.filter(p => statusFilter.includes(p.status));
        }

        // Sort
        processedProjects.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.publishDateTime).getTime() - new Date(b.publishDateTime).getTime();
                case 'name-asc':
                    return (a.projectName || a.videoTitle).localeCompare(b.projectName || b.videoTitle);
                case 'status':
                    const orderA = statusOptions.findIndex(opt => opt.value === a.status);
                    const orderB = statusOptions.findIndex(opt => opt.value === b.status);
                    return orderA - orderB;
                case 'date-desc':
                default:
                    try {
                        const dateA = new Date(a.publishDateTime).getTime();
                        const dateB = new Date(b.publishDateTime).getTime();
                        if (isNaN(dateB)) return -1;
                        if (isNaN(dateA)) return 1;
                        return dateB - dateA;
                    } catch (e) {
                        return 0;
                    }
            }
        });

        return processedProjects;
    }, [projects, sortBy, statusFilter, statusOptions]);

    const displayedProjectsByChannel = useMemo(() => {
        return displayedProjects.reduce((acc, project) => {
          const channelId = project.channelId || 'uncategorized';
          if (!acc[channelId]) {
            acc[channelId] = [];
          }
          acc[channelId].push(project);
          return acc;
        }, {} as Record<string, Project[]>);
    }, [displayedProjects]);

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

    // Determine Orphan Channels (Projects that exist but have no corresponding Channel in the list)
    const orphanChannelIds = Object.keys(displayedProjectsByChannel).filter(id => !channels.find(c => c.id === id));
    
    // Create Ghost Channel objects for display
    const ghostChannels: Channel[] = orphanChannelIds.map(id => ({
        id,
        name: t('projects.unknownChannel', { id: id.substring(0, 6) }),
        ownerId: user.uid, // Assume ownership to allow editing
        members: {},
        dna: '',
        stats: { videoCount: displayedProjectsByChannel[id].length, viewCount: 0, subscriberCount: 0 }
    }));

    const allChannelsToRender = [...channels, ...ghostChannels].sort((a, b) => a.name.localeCompare(b.name));

    if (allChannelsToRender.length === 0 && !missingIndexError) {
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
    
    return (
        <div>
            {missingIndexError && (
                <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-800 dark:text-red-200 p-4 rounded-md mb-6 shadow-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-bold">{t('projects.missingIndexError.title')}</h3>
                            <div className="mt-2 text-sm">
                                <p>{missingIndexError.message}</p>
                                {missingIndexError.url && (
                                    <a
                                        href={missingIndexError.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-bold underline hover:text-red-600 dark:hover:text-red-300 mt-2 inline-flex items-center gap-1"
                                    >
                                        {t('projects.missingIndexError.createButton')} <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
            
            {/* Filter and Sort Controls */}
            <div className="my-6 p-4 bg-light-card dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold mr-2">{t('projects.filterByStatus')}:</span>
                        <button
                            onClick={() => setStatusFilter([])}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                                statusFilter.length === 0 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            {t('projects.all')}
                        </button>
                        {statusOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => toggleStatusFilter(opt.value as ProjectStatus)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                                    statusFilter.includes(opt.value as ProjectStatus) 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    {/* Sort */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <label htmlFor="sort-by" className="text-sm font-semibold">{t('projects.sortBy')}:</label>
                        <select
                            id="sort-by"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="p-2 text-sm bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
                        >
                            <option value="date-desc">{t('projects.sortOptions.dateDesc')}</option>
                            <option value="date-asc">{t('projects.sortOptions.dateAsc')}</option>
                            <option value="name-asc">{t('projects.sortOptions.nameAsc')}</option>
                            <option value="status">{t('projects.sortOptions.status')}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-12">
                {allChannelsToRender.map(channel => {
                    const channelProjects = displayedProjectsByChannel[channel.id] || [];
                    const isOwner = channel.ownerId === user.uid;
                    const isGhost = channel.name.includes(t('projects.unknownChannel', { id: '' }).split(' ')[0]); // Check if it's a ghost channel
                    const owner = channelMembers[channel.ownerId];
                    const ownerName = owner ? owner.name : t('projects.owner');

                    return (
                        <div key={channel.id}>
                            <div className="flex flex-wrap justify-between items-center gap-y-2 mb-4 border-b-2 border-primary/30 pb-2">
                                <div className="flex items-center gap-4">
                                    <h2 className={`text-2xl font-semibold ${isGhost ? 'text-orange-500 italic' : 'text-gray-800 dark:text-white'}`}>
                                        {channel.name} {isGhost && <span className="text-xs not-italic bg-orange-100 text-orange-800 px-2 py-1 rounded ml-2">Recovered</span>}
                                    </h2>
                                    {!isOwner && !isGhost && (
                                        <span className="text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full flex items-center gap-1.5">
                                            <Share2 size={12}/>
                                            {t('projects.sharedBy', { name: ownerName })}
                                        </span>
                                    )}
                                    {channel.stats && !isGhost && (
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
                                    {!isGhost && (
                                        <>
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
                                        </>
                                    )}
                                    {isGhost && (
                                        <div className="text-sm text-gray-500 italic flex items-center gap-1">
                                            <HelpCircle size={14} /> {t('projects.ghostChannelHint')}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {channelProjects.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {channelProjects.map(project => (
                                        <ProjectCard key={project.id} project={project} onSelect={() => onSelectProject(project)} channelMembers={channelMembers} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 px-6 bg-light-bg dark:bg-dark-bg rounded-lg">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {(projectsByChannel[channel.id] || []).length > 0
                                            ? t('projects.noMatchingProjects')
                                            : t('projects.noProjectsInChannel')}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};