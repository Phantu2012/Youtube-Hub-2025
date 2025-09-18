
import React from 'react';
import { Project, ProjectStatus } from '../types';
import { ClipboardList, Youtube, Eye, ThumbsUp } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface DashboardSummaryProps {
    projects: Project[];
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md flex items-center gap-4">
        <div className={`p-3 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-light-text dark:text-dark-text">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
    </div>
);


export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ projects }) => {
    const { t, language } = useTranslation();

    const totalProjects = projects.length;
    const publishedVideos = projects.filter(p => p.status === ProjectStatus.Published);
    const totalViews = projects.reduce((sum, p) => sum + (p.stats?.views || 0), 0);
    
    const publishedVideosWithStats = publishedVideos.filter(p => p.stats?.likes !== undefined);
    const totalLikes = publishedVideosWithStats.reduce((sum, p) => sum + (p.stats?.likes || 0), 0);
    const avgLikes = publishedVideosWithStats.length > 0 ? Math.round(totalLikes / publishedVideosWithStats.length) : 0;
    
    const formatStat = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString(language);
    };

    return (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                icon={<ClipboardList size={24} className="text-blue-800 dark:text-blue-200" />}
                label={t('dashboard.totalProjects')}
                value={totalProjects.toLocaleString(language)}
                colorClass="bg-blue-100 dark:bg-blue-900/50"
            />
            <StatCard 
                icon={<Youtube size={24} className="text-red-800 dark:text-red-200" />}
                label={t('dashboard.publishedVideos')}
                value={publishedVideos.length.toLocaleString(language)}
                colorClass="bg-red-100 dark:bg-red-900/50"
            />
            <StatCard 
                icon={<Eye size={24} className="text-green-800 dark:text-green-200" />}
                label={t('dashboard.totalViews')}
                value={formatStat(totalViews)}
                colorClass="bg-green-100 dark:bg-green-900/50"
            />
            <StatCard 
                icon={<ThumbsUp size={24} className="text-purple-800 dark:text-purple-200" />}
                label={t('dashboard.avgLikes')}
                value={formatStat(avgLikes)}
                colorClass="bg-purple-100 dark:bg-purple-900/50"
            />
        </div>
    );
};
