import React, { useState, useMemo } from 'react';
import { Dream100Video } from '../types';
import { X, Search } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface Dream100SelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    videos: Dream100Video[];
    onSelect: (video: Dream100Video) => void;
}

export const Dream100SelectorModal: React.FC<Dream100SelectorModalProps> = ({ isOpen, onClose, videos, onSelect }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredVideos = useMemo(() => {
        if (!searchTerm) {
            return videos;
        }
        return videos.filter(video =>
            video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.channelTitle.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [videos, searchTerm]);

    const handleSelect = (video: Dream100Video) => {
        onSelect(video);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">{t('dream100Selector.title')}</h2>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X /></button>
                    </div>
                </div>

                <div className="p-6 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('dream100Selector.searchPlaceholder')}
                            className="w-full p-2 pl-10 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
                        />
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto">
                    {filteredVideos.length === 0 ? (
                        <div className="text-center p-12">
                            <p className="font-semibold text-lg">{t('dream100Selector.noVideos')}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredVideos.map(video => (
                                <div
                                    key={video.id}
                                    onClick={() => handleSelect(video)}
                                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-light-bg/50 dark:hover:bg-dark-bg/50"
                                >
                                    <img src={video.thumbnailUrl} alt={video.title} className="w-32 h-18 object-cover rounded-md flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-semibold line-clamp-2">{video.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{video.channelTitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};