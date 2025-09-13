
import React from 'react';
import { Project } from '../types';
import { ProjectCard } from './ProjectCard';
import { Loader } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface ProjectListProps {
    projects: Project[];
    onSelectProject: (project: Project) => void;
    isLoading: boolean;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject, isLoading }) => {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="text-center py-16 px-6">
                <Loader className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="mt-4 text-gray-500 dark:text-gray-400">{t('projects.loading')}</p>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="text-center py-16 px-6 bg-light-card dark:bg-dark-card rounded-lg shadow-inner">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{t('projects.noProjects')}</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">{t('projects.getStarted')}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map(project => (
                <ProjectCard key={project.id} project={project} onSelect={() => onSelectProject(project)} />
            ))}
        </div>
    );
};
