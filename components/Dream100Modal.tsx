import React, { useState, useMemo } from 'react';
import { Channel, Dream100Video, Dream100VideoStatus, ApiKeys } from '../types';
import { X, Plus, Loader, Trash2, ThumbsUp, MessageSquare, Eye } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { fetchFullVideoDetailsForDream100 } from '../services/youtubeService';
import { getDream100StatusOptions, DREAM100_STATUS_COLORS } from '../constants';

interface Dream100ModalProps {
    isOpen: boolean;
    onClose: () => void;
    channel: Channel;
    apiKeys: ApiKeys;
    onUpdate: (updatedVideos: Dream100Video[]) => void;
}

export const Dream100Modal: React.FC<Dream100ModalProps> = ({ isOpen, onClose, channel, apiKeys, onUpdate }) => {
    const { t, language } = useTranslation();
    const [videos, setVideos] = useState<Dream100Video[]>(channel.dream100Videos || []);
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [channelFilter, setChannelFilter] = useState('');
    const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
    const statusOptions = getDream100StatusOptions(t);

    const uniqueChannels = useMemo(() => {
        const channelSet = new Set(videos.map(v => v.channelTitle));
        return Array.from(channelSet).sort();
    }, [videos]);

    const filteredVideos = useMemo(() => {
        if (!channelFilter) {
            return videos;
        }
        return videos.filter(video => video.channelTitle === channelFilter);
    }, [videos, channelFilter]);

    const handleAddVideo = async () => {
        if (!newVideoUrl.trim()) return;

        const alreadyExists = videos.some(v => v.youtubeLink === newVideoUrl || v.youtubeLink.includes(newVideoUrl.split('v=')[1]));
        if (alreadyExists) {
            alert(t('dream100.toasts.videoExists'));
            return;
        }

        setIsLoading(true);
        try {
            const details = await fetchFullVideoDetailsForDream100(newVideoUrl, apiKeys.youtube);
            if (details) {
                const newVideo: Dream100Video = {
                    ...details,
                    status: Dream100VideoStatus.Pending,
                };
                const updatedVideos = [...videos, newVideo];
                setVideos(updatedVideos);
                onUpdate(updatedVideos);
                setNewVideoUrl('');
                alert(t('dream100.toasts.videoAdded'));
            } else {
                throw new Error("No details fetched.");
            }
        } catch (error: any) {
            alert(`${t('dream100.toasts.fetchError')}: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = (videoId: string, newStatus: Dream100VideoStatus) => {
        const updatedVideos = videos.map(v => v.id === videoId ? { ...v, status: newStatus } : v);
        setVideos(updatedVideos);
        onUpdate(updatedVideos);
    };

    const handleDeleteVideo = (videoId: string) => {
        if (window.confirm(t('dream100.deleteConfirmation'))) {
            const updatedVideos = videos.filter(v => v.id !== videoId);
            setVideos(updatedVideos);
            onUpdate(updatedVideos);
            alert(t('dream100.toasts.videoRemoved'));
        }
    };

    const toggleExpand = (videoId: string) => {
        setExpandedVideoId(prev => (prev === videoId ? null : videoId));
    };

    const formatStat = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString(language);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">{t('dream100.title', { channelName: channel.name })}</h2>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X /></button>
                    </div>
                </div>

                <div className="p-6 flex-shrink-0 border-b border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={newVideoUrl}
                            onChange={(e) => setNewVideoUrl(e.target.value)}
                            placeholder={t('dream100.youtubeUrlPlaceholder')}
                            className="flex-grow p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleAddVideo}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-lg disabled:bg-opacity-70"
                        >
                            {isLoading ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                            {isLoading ? t('dream100.addingVideo') : t('dream100.addVideo')}
                        </button>
                    </div>
                     {uniqueChannels.length > 0 && (
                        <div className="flex items-center">
                            <label htmlFor="channel-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">{t('dream100.filterByChannel')}:</label>
                            <select
                                id="channel-filter"
                                value={channelFilter}
                                onChange={(e) => setChannelFilter(e.target.value)}
                                className="p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
                            >
                                <option value="">{t('dream100.allChannels')}</option>
                                {uniqueChannels.map(channelName => (
                                    <option key={channelName} value={channelName}>{channelName}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto">
                    {filteredVideos.length === 0 ? (
                        <div className="text-center p-12">
                            <p className="font-semibold text-lg">{t('dream100.noVideos')}</p>
                            <p className="text-gray-500 dark:text-gray-400">{t('dream100.getStarted')}</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('dream100.table.video')}</th>
                                    <th scope="col" className="px-6 py-3">{t('dream100.table.stats')}</th>
                                    <th scope="col" className="px-6 py-3">{t('dream100.table.published')}</th>
                                    <th scope="col" className="px-6 py-3">{t('dream100.table.status')}</th>
                                    <th scope="col" className="px-6 py-3">{t('dream100.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVideos.map(video => (
                                    <React.Fragment key={video.id}>
                                        <tr 
                                            className={`border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${expandedVideoId === video.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-light-card dark:bg-dark-card'}`}
                                            onClick={() => toggleExpand(video.id)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img src={video.thumbnailUrl} alt={video.title} className="w-32 h-18 object-cover rounded-md" />
                                                    <div>
                                                        <a href={video.youtubeLink} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-primary line-clamp-2" title={video.title}>{video.title}</a>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{video.channelTitle}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 text-xs">
                                                    <span className="flex items-center gap-1"><Eye size={12}/> {formatStat(video.viewCount)}</span>
                                                    <span className="flex items-center gap-1"><ThumbsUp size={12}/> {formatStat(video.likeCount)}</span>
                                                    <span className="flex items-center gap-1"><MessageSquare size={12}/> {formatStat(video.commentCount)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                {new Date(video.publishedAt).toLocaleDateString(language)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={video.status}
                                                    onChange={(e) => handleStatusChange(video.id, e.target.value as Dream100VideoStatus)}
                                                    onClick={(e) => e.stopPropagation()} // Prevent row from toggling when changing status
                                                    className={`text-xs p-1 rounded-md text-white border-none ${DREAM100_STATUS_COLORS[video.status]}`}
                                                >
                                                    {statusOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value} className="bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text">{opt.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteVideo(video.id); }} className="p-2 text-gray-500 hover:text-red-500">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedVideoId === video.id && (
                                            <tr className="bg-light-bg dark:bg-dark-bg/50">
                                                <td colSpan={5} className="p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="font-semibold text-sm mb-2">{t('dream100.details.description')}</h4>
                                                            <div className="bg-white dark:bg-gray-800 p-3 rounded-md max-h-48 overflow-y-auto text-xs text-gray-600 dark:text-gray-300">
                                                                <pre className="whitespace-pre-wrap font-sans">{video.description}</pre>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-sm mb-2">{t('dream100.details.tags')}</h4>
                                                            <div className="bg-white dark:bg-gray-800 p-3 rounded-md max-h-48 overflow-y-auto">
                                                                {video.tags && video.tags.length > 0 ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {video.tags.map(tag => (
                                                                            <span key={tag} className="bg-primary/20 text-primary-dark dark:text-red-300 px-2 py-0.5 text-xs rounded-full">
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-gray-400">{t('dream100.details.noTags')}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};